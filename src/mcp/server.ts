#!/usr/bin/env node
/**
 * CQL Builder MCP Server
 *
 * Model Context Protocol server that provides tools for:
 * - Generating CQL code from natural language requirements
 * - Validating CQL code
 * - Pushing CQL Library resources to FHIR servers
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';

/**
 * Generate a UUID v4 for FHIR resource IDs
 * Medplum and other FHIR servers require proper UUIDs
 */
function generateUUID(): string {
  return randomUUID();
}

// Types
interface MeasureRequirement {
  purpose: string;
  problemStatement?: string;
  measureType?: 'clinical-quality' | 'operational' | 'population-health' | 'consumer-insight' | 'decision-support';
  scoringType?: 'proportion' | 'ratio' | 'continuous-variable' | 'cohort';
  valueSets?: Array<{ name: string; oid: string }>;
  targetPopulation?: string;
}

interface FhirServerConfig {
  baseUrl: string;
  authType: 'none' | 'basic' | 'bearer' | 'client-credentials';
  username?: string;
  password?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: Array<{ message: string; line?: number; severity: string }>;
  warnings: Array<{ message: string; line?: number; severity: string }>;
  metadata?: {
    library?: { name: string; version: string };
    valueSets: Array<{ name: string; oid: string }>;
    defines: Array<{ name: string; isFunction: boolean }>;
  };
}

// CQL System Prompt for generation
const CQL_SYSTEM_PROMPT = `You are an expert in Clinical Quality Language (CQL) v1.5.3, specializing in creating healthcare quality measures using the FHIR R4 data model.

Your task is to generate valid, production-ready CQL code that follows HL7 best practices:

1. LIBRARY STRUCTURE:
   - Start with library declaration: library LibraryName version '1.0.0'
   - Use FHIR version '4.0.1'
   - Include FHIRHelpers version '4.0.1'
   - Include SupplementalDataElements for CMS measures

2. VALUE SETS:
   - Reference value sets using VSAC URLs: http://cts.nlm.nih.gov/fhir/ValueSet/{OID}
   - Use descriptive names that match the clinical concept

3. POPULATION CRITERIA (for proportion measures):
   - Initial Population: The starting population eligible for the measure
   - Denominator: Usually equals Initial Population
   - Denominator Exclusions: Patients to exclude
   - Numerator: Patients meeting the quality criteria
   - Numerator Exclusions: Patients to exclude from numerator

4. CODING STANDARDS:
   - Use proper FHIR path expressions
   - Check clinical status (e.g., Condition.clinicalStatus)
   - Use temporal operators (during, overlaps, before, after)
   - Include null checks where appropriate

5. OUTPUT FORMAT:
   - Return ONLY valid CQL code
   - Wrap code in \`\`\`cql code blocks
   - Include helpful comments`;

// Tools definition
const TOOLS: Tool[] = [
  {
    name: 'generate_cql',
    description: 'Generate CQL (Clinical Quality Language) code from natural language requirements. Provide a description of the clinical quality measure you want to create.',
    inputSchema: {
      type: 'object',
      properties: {
        purpose: {
          type: 'string',
          description: 'The main purpose or goal of the measure (e.g., "Track diabetes patients with controlled HbA1c")',
        },
        problemStatement: {
          type: 'string',
          description: 'Detailed description of the clinical problem being addressed',
        },
        measureType: {
          type: 'string',
          enum: ['clinical-quality', 'operational', 'population-health', 'consumer-insight', 'decision-support'],
          description: 'Type of measure to generate',
        },
        scoringType: {
          type: 'string',
          enum: ['proportion', 'ratio', 'continuous-variable', 'cohort'],
          description: 'Scoring methodology for the measure',
        },
        valueSets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              oid: { type: 'string' },
            },
            required: ['name', 'oid'],
          },
          description: 'Value sets to include in the measure (VSAC OIDs)',
        },
        targetPopulation: {
          type: 'string',
          description: 'Description of the target patient population',
        },
      },
      required: ['purpose'],
    },
  },
  {
    name: 'validate_cql',
    description: 'Validate CQL code for syntax errors and best practices. Returns validation results including errors, warnings, and extracted metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        cql: {
          type: 'string',
          description: 'The CQL code to validate',
        },
        fullValidation: {
          type: 'boolean',
          description: 'Whether to perform full compilation validation (default: true)',
        },
      },
      required: ['cql'],
    },
  },
  {
    name: 'push_to_fhir',
    description: 'Push a CQL Library resource to a FHIR server. The CQL code will be base64 encoded and attached to a FHIR Library resource along with a corresponding Measure resource.',
    inputSchema: {
      type: 'object',
      properties: {
        cql: {
          type: 'string',
          description: 'The CQL code to push',
        },
        libraryName: {
          type: 'string',
          description: 'Name for the Library resource (alphanumeric, no spaces)',
        },
        libraryVersion: {
          type: 'string',
          description: 'Version of the library (default: 1.0.0)',
        },
        serverUrl: {
          type: 'string',
          description: 'FHIR server base URL (e.g., https://api.medplum.com/fhir/R4)',
        },
        authType: {
          type: 'string',
          enum: ['none', 'basic', 'bearer', 'client-credentials'],
          description: 'Authentication type for the FHIR server. Use client-credentials for Medplum OAuth2.',
        },
        username: {
          type: 'string',
          description: 'Username for basic auth',
        },
        password: {
          type: 'string',
          description: 'Password for basic auth',
        },
        accessToken: {
          type: 'string',
          description: 'Bearer token for authentication',
        },
        clientId: {
          type: 'string',
          description: 'Client ID for OAuth2 client-credentials flow (Medplum)',
        },
        clientSecret: {
          type: 'string',
          description: 'Client secret for OAuth2 client-credentials flow (Medplum)',
        },
        tokenUrl: {
          type: 'string',
          description: 'Token URL for OAuth2 (default: https://api.medplum.com/oauth2/token for Medplum)',
        },
        scoringType: {
          type: 'string',
          enum: ['proportion', 'ratio', 'continuous-variable', 'cohort'],
          description: 'Scoring type for the Measure resource',
        },
      },
      required: ['cql', 'libraryName', 'serverUrl'],
    },
  },
];

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper functions
function generateUserPrompt(requirements: MeasureRequirement): string {
  let prompt = `Generate a CQL library for the following measure:\n\n`;
  prompt += `## Purpose\n${requirements.purpose}\n\n`;

  if (requirements.problemStatement) {
    prompt += `## Problem Statement\n${requirements.problemStatement}\n\n`;
  }

  if (requirements.measureType) {
    prompt += `## Measure Type\n${requirements.measureType}\n\n`;
  }

  if (requirements.scoringType) {
    prompt += `## Scoring Type\n${requirements.scoringType}\n\n`;
  }

  if (requirements.targetPopulation) {
    prompt += `## Target Population\n${requirements.targetPopulation}\n\n`;
  }

  if (requirements.valueSets && requirements.valueSets.length > 0) {
    prompt += `## Value Sets to Include\n`;
    requirements.valueSets.forEach((vs) => {
      prompt += `- ${vs.name}: ${vs.oid}\n`;
    });
    prompt += '\n';
  }

  prompt += `Generate complete, production-ready CQL code following HL7 best practices.`;
  return prompt;
}

function postProcessCQL(rawCQL: string): string {
  // Extract CQL from code blocks if present
  const cqlMatch = rawCQL.match(/```cql\n?([\s\S]*?)```/);
  if (cqlMatch) {
    return cqlMatch[1].trim();
  }
  // Try generic code blocks
  const codeMatch = rawCQL.match(/```\n?([\s\S]*?)```/);
  if (codeMatch) {
    return codeMatch[1].trim();
  }
  return rawCQL.trim();
}

function validateCQLStructure(cql: string): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  // Check for library declaration
  if (!cql.match(/library\s+\w+/)) {
    errors.push({ message: 'Missing library declaration', severity: 'error' });
  }

  // Check for FHIR model
  if (!cql.includes("using FHIR")) {
    warnings.push({ message: 'Missing FHIR data model declaration', severity: 'warning' });
  }

  // Check for context
  if (!cql.match(/context\s+(Patient|Practitioner|Unfiltered)/)) {
    warnings.push({ message: 'Missing context statement', severity: 'warning' });
  }

  // Check bracket balance
  const openBrackets = (cql.match(/\[/g) || []).length;
  const closeBrackets = (cql.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push({ message: `Unbalanced brackets: ${openBrackets} opening, ${closeBrackets} closing`, severity: 'error' });
  }

  // Check parenthesis balance
  const openParens = (cql.match(/\(/g) || []).length;
  const closeParens = (cql.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push({ message: `Unbalanced parentheses: ${openParens} opening, ${closeParens} closing`, severity: 'error' });
  }

  // Extract metadata
  const libraryMatch = cql.match(/library\s+(\w+)\s+version\s+'([^']+)'/);
  const valueSetMatches = [...cql.matchAll(/valueset\s+"([^"]+)":\s*'[^']*\/([^'\/]+)'/g)];
  const defineMatches = [...cql.matchAll(/define\s+(?:(function)\s+)?"?([^":\n]+)"?\s*:/g)];

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      library: libraryMatch ? { name: libraryMatch[1], version: libraryMatch[2] } : undefined,
      valueSets: valueSetMatches.map((m) => ({ name: m[1], oid: m[2] })),
      defines: defineMatches.map((m) => ({ name: m[2].trim(), isFunction: m[1] === 'function' })),
    },
  };
}

function generateLibraryResource(cql: string, name: string, version: string): object {
  const sanitizedName = name.replace(/[^a-zA-Z0-9-]/g, '');
  const cqlBase64 = Buffer.from(cql).toString('base64');
  // Generate UUID for the resource ID (required by Medplum and other FHIR servers)
  const resourceId = generateUUID();

  return {
    resourceType: 'Library',
    id: resourceId,
    meta: {
      profile: ['http://hl7.org/fhir/uv/cql/StructureDefinition/cql-library'],
    },
    url: `http://example.org/fhir/Library/${sanitizedName}`,
    version,
    name: sanitizedName,
    title: name,
    status: 'draft',
    experimental: true,
    type: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/library-type',
        code: 'logic-library',
        display: 'Logic Library',
      }],
    },
    date: new Date().toISOString(),
    publisher: 'CQL Builder MCP',
    content: [{
      contentType: 'text/cql',
      data: cqlBase64,
      title: `${sanitizedName}.cql`,
    }],
    parameter: [
      { name: 'Measurement Period', use: 'in', min: 0, max: '1', type: 'Period' },
      { name: 'Patient', use: 'out', min: 0, max: '1', type: 'Patient' },
    ],
  };
}

function generateMeasureResource(libraryUrl: string, name: string, version: string, scoringType: string): object {
  const sanitizedName = name.replace(/[^a-zA-Z0-9-]/g, '');
  // Generate UUID for the resource ID (required by Medplum and other FHIR servers)
  const resourceId = generateUUID();

  const scoringDisplay: Record<string, string> = {
    proportion: 'Proportion',
    ratio: 'Ratio',
    'continuous-variable': 'Continuous Variable',
    cohort: 'Cohort',
  };

  return {
    resourceType: 'Measure',
    id: resourceId,
    url: `http://example.org/fhir/Measure/${sanitizedName}Measure`,
    version,
    name: `${sanitizedName}Measure`,
    title: `${name} Measure`,
    status: 'draft',
    experimental: true,
    date: new Date().toISOString(),
    publisher: 'CQL Builder MCP',
    library: [libraryUrl],
    scoring: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/measure-scoring',
        code: scoringType,
        display: scoringDisplay[scoringType] || 'Proportion',
      }],
    },
    group: [{
      population: [
        {
          code: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/measure-population', code: 'initial-population', display: 'Initial Population' }] },
          criteria: { language: 'text/cql-identifier', expression: 'Initial Population' },
        },
        {
          code: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/measure-population', code: 'denominator', display: 'Denominator' }] },
          criteria: { language: 'text/cql-identifier', expression: 'Denominator' },
        },
        {
          code: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/measure-population', code: 'numerator', display: 'Numerator' }] },
          criteria: { language: 'text/cql-identifier', expression: 'Numerator' },
        },
      ],
    }],
  };
}

async function buildAuthHeaders(config: FhirServerConfig): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/fhir+json',
    'Accept': 'application/fhir+json',
  };

  switch (config.authType) {
    case 'basic':
      if (config.username && config.password) {
        const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }
      break;
    case 'bearer':
      if (config.accessToken) {
        headers['Authorization'] = `Bearer ${config.accessToken}`;
      }
      break;
    case 'client-credentials':
      if (config.clientId && config.clientSecret && config.tokenUrl) {
        const tokenResponse = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: config.clientId,
            client_secret: config.clientSecret,
          }),
        });
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          headers['Authorization'] = `Bearer ${tokenData.access_token}`;
        }
      }
      break;
  }

  return headers;
}

// Tool handlers
async function handleGenerateCQL(args: MeasureRequirement): Promise<string> {
  const userPrompt = generateUserPrompt(args);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: CQL_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const responseContent = message.content[0];
  if (responseContent.type !== 'text') {
    throw new Error('Unexpected response format');
  }

  return postProcessCQL(responseContent.text);
}

async function handleValidateCQL(args: { cql: string; fullValidation?: boolean }): Promise<ValidationResult> {
  const result = validateCQLStructure(args.cql);

  // If full validation requested and structural validation passed, try CQL translator
  if (args.fullValidation !== false && result.valid) {
    try {
      const translatorUrl = 'https://cql-translation.alphora.com/cql/translator';
      const response = await fetch(translatorUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/cql',
          'Accept': 'application/elm+json',
        },
        body: args.cql,
      });

      if (response.ok) {
        const elm = await response.json();
        if (elm.library?.annotation) {
          elm.library.annotation.forEach((ann: { errorType?: string; message?: string; startLine?: number }) => {
            if (ann.errorType === 'error') {
              result.errors.push({ message: ann.message || 'Unknown error', line: ann.startLine, severity: 'error' });
              result.valid = false;
            } else if (ann.errorType === 'warning') {
              result.warnings.push({ message: ann.message || 'Unknown warning', line: ann.startLine, severity: 'warning' });
            }
          });
        }
      }
    } catch (error) {
      result.warnings.push({
        message: `Full compilation unavailable: ${error instanceof Error ? error.message : 'Service error'}`,
        severity: 'info',
      });
    }
  }

  return result;
}

async function handlePushToFhir(args: {
  cql: string;
  libraryName: string;
  libraryVersion?: string;
  serverUrl: string;
  authType?: 'none' | 'basic' | 'bearer' | 'client-credentials';
  username?: string;
  password?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
  scoringType?: string;
}): Promise<{ success: boolean; message: string; libraryUrl?: string; measureUrl?: string; libraryId?: string; measureId?: string }> {
  const version = args.libraryVersion || '1.0.0';
  const scoringType = args.scoringType || 'proportion';

  // Generate Library and Measure resources (without ID - server will assign)
  const library = generateLibraryResource(args.cql, args.libraryName, version);
  const libraryUrl = `http://example.org/fhir/Library/${args.libraryName.replace(/[^a-zA-Z0-9-]/g, '')}`;
  const measure = generateMeasureResource(libraryUrl, args.libraryName, version, scoringType);

  // Build auth headers (with OAuth2 support for Medplum)
  const tokenUrl = args.tokenUrl || (args.serverUrl.includes('medplum') ? 'https://api.medplum.com/oauth2/token' : undefined);
  const headers = await buildAuthHeaders({
    baseUrl: args.serverUrl,
    authType: args.authType || 'none',
    username: args.username,
    password: args.password,
    accessToken: args.accessToken,
    clientId: args.clientId,
    clientSecret: args.clientSecret,
    tokenUrl,
  });

  // Upload Library using POST (creates new resource)
  const libraryResponse = await fetch(`${args.serverUrl}/Library`, {
    method: 'POST',
    headers,
    body: JSON.stringify(library),
  });

  if (!libraryResponse.ok) {
    const errorText = await libraryResponse.text();
    return {
      success: false,
      message: `Failed to upload Library: ${libraryResponse.status} - ${errorText}`,
    };
  }

  // Get the server-assigned ID from the response
  const libraryResult = await libraryResponse.json();
  const libraryId = libraryResult.id;

  // Update measure to reference the actual library URL on the server
  const actualLibraryUrl = `${args.serverUrl}/Library/${libraryId}`;
  (measure as { library: string[] }).library = [actualLibraryUrl];

  // Upload Measure using POST (creates new resource)
  const measureResponse = await fetch(`${args.serverUrl}/Measure`, {
    method: 'POST',
    headers,
    body: JSON.stringify(measure),
  });

  if (!measureResponse.ok) {
    const errorText = await measureResponse.text();
    return {
      success: false,
      message: `Library uploaded but Measure failed: ${measureResponse.status} - ${errorText}`,
      libraryUrl: actualLibraryUrl,
      libraryId,
    };
  }

  const measureResult = await measureResponse.json();
  const measureId = measureResult.id;

  return {
    success: true,
    message: 'Library and Measure resources uploaded successfully',
    libraryUrl: actualLibraryUrl,
    measureUrl: `${args.serverUrl}/Measure/${measureId}`,
    libraryId,
    measureId,
  };
}

// Create and run MCP server
async function main() {
  const server = new Server(
    {
      name: 'cql-builder',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'generate_cql': {
          const cql = await handleGenerateCQL(args as unknown as MeasureRequirement);
          return {
            content: [{ type: 'text', text: cql }],
          };
        }

        case 'validate_cql': {
          const result = await handleValidateCQL(args as unknown as { cql: string; fullValidation?: boolean });
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2),
            }],
          };
        }

        case 'push_to_fhir': {
          const result = await handlePushToFhir(args as unknown as Parameters<typeof handlePushToFhir>[0]);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2),
            }],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
        isError: true,
      };
    }
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CQL Builder MCP Server running on stdio');
}

main().catch(console.error);
