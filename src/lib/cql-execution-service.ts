/**
 * CQL Execution Service
 *
 * Integrates with the official CQL Framework packages:
 * - cql-execution: Core CQL execution engine
 * - cql-exec-fhir: FHIR R4 patient data source
 * - cql-exec-vsac: VSAC value set code service
 *
 * Based on: https://github.com/cqframework/cql-execution
 * Playground: https://cqframework.org/clinical_quality_language/playground/
 */

// Type definitions for CQL execution
export interface ELMLibrary {
  library: {
    identifier: {
      id: string;
      version: string;
    };
    schemaIdentifier: {
      id: string;
      version: string;
    };
    usings?: {
      def: Array<{
        localIdentifier: string;
        uri: string;
        version?: string;
      }>;
    };
    includes?: {
      def: Array<{
        localIdentifier: string;
        path: string;
        version?: string;
      }>;
    };
    valueSets?: {
      def: Array<{
        name: string;
        id: string;
        version?: string;
        accessLevel?: string;
      }>;
    };
    codeSystems?: {
      def: Array<{
        name: string;
        id: string;
        version?: string;
        accessLevel?: string;
      }>;
    };
    codes?: {
      def: Array<{
        name: string;
        id: string;
        display?: string;
        codeSystem: { name: string };
        accessLevel?: string;
      }>;
    };
    parameters?: {
      def: Array<{
        name: string;
        accessLevel?: string;
        parameterTypeSpecifier?: unknown;
        default?: unknown;
      }>;
    };
    contexts?: {
      def: Array<{
        name: string;
      }>;
    };
    statements?: {
      def: Array<{
        name: string;
        context?: string;
        accessLevel?: string;
        expression?: unknown;
      }>;
    };
  };
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  type: string;
  entry?: Array<{
    resource: FHIRResource;
  }>;
}

export interface FHIRResource {
  resourceType: string;
  id?: string;
  [key: string]: unknown;
}

export interface CQLExecutionResult {
  patientId: string;
  results: Record<string, unknown>;
}

export interface CQLExecutionOptions {
  measurementPeriodStart?: string;
  measurementPeriodEnd?: string;
  parameters?: Record<string, unknown>;
  enableDebug?: boolean;
}

export interface CompilationResult {
  success: boolean;
  elm?: ELMLibrary;
  errors?: CompilationError[];
  warnings?: CompilationWarning[];
}

export interface CompilationError {
  severity: 'error';
  message: string;
  errorType?: string;
  startLine?: number;
  startChar?: number;
  endLine?: number;
  endChar?: number;
}

export interface CompilationWarning {
  severity: 'warning';
  message: string;
  startLine?: number;
  startChar?: number;
}

/**
 * CQL Translation Service Configuration
 * Uses the cqframework/cql-translation-service Docker image
 *
 * Public endpoints may experience downtime. For production use, consider:
 * - Self-hosting on Railway.app (~$5/month): https://railway.com
 * - Self-hosting on Render: https://render.com
 * - Self-hosting on Fly.io: https://fly.io
 * - Local Docker: docker run -d -p 8080:8080 cqframework/cql-translation-service:latest
 *
 * Note: CQL-to-ELM translation requires a Java-based service.
 * There is no pure JavaScript/TypeScript npm package available.
 * The cql-execution package only executes pre-compiled ELM JSON.
 *
 * Alternative CQL tools:
 * - Firely .NET CQL SDK: https://github.com/FirelyTeam/firely-cql-sdk (requires .NET)
 * - CQF Ruler: https://github.com/cqframework/cqf-ruler (full FHIR server with CQL)
 * - Google CQL (Go): https://github.com/google/cql (experimental, no ELM export)
 */
export const CQL_TRANSLATOR_CONFIG = {
  // Multiple public CQL Translation Service endpoints (tried in order)
  // These are community-provided and may experience downtime
  publicEndpoints: [
    'https://cql-translation.alphora.com/cql/translator',
    'https://cql.dataphoria.org/cql/translator',
    // Add custom endpoint via environment variable
    ...(process.env.NEXT_PUBLIC_CQL_TRANSLATOR_URL ? [process.env.NEXT_PUBLIC_CQL_TRANSLATOR_URL] : []),
  ],

  // Primary public endpoint (for backwards compatibility)
  publicEndpoint: 'https://cql-translation.alphora.com/cql/translator',

  // Local Docker endpoint
  localEndpoint: 'http://localhost:8080/cql/translator',

  // Docker run command for self-hosting
  dockerCommand: 'docker run -d -p 8080:8080 --restart unless-stopped cqframework/cql-translation-service:latest',

  // Default translation options
  defaultOptions: {
    annotations: true,
    locators: true,
    'result-types': true,
    signatures: 'All',
    'detailed-errors': true,
  },

  // Request timeout in milliseconds (increased for slow endpoints)
  timeout: 30000,

  // Self-hosting options
  selfHosting: {
    railway: {
      name: 'Railway.app',
      pricing: '$5/month (Hobby plan)',
      instructions: 'Deploy Docker image cqframework/cql-translation-service:latest',
      url: 'https://railway.com',
    },
    render: {
      name: 'Render',
      pricing: 'Free tier available (spins down after inactivity)',
      instructions: 'Create Web Service from Docker image',
      url: 'https://render.com',
    },
    flyio: {
      name: 'Fly.io',
      pricing: 'Pay-as-you-go, hobby tier available',
      instructions: 'fly launch --image cqframework/cql-translation-service:latest',
      url: 'https://fly.io',
    },
  },
};

/**
 * Compile CQL to ELM using the CQL Translation Service
 * Tries multiple endpoints with fallback on failure
 */
export async function compileCQLToELM(
  cqlCode: string,
  translatorEndpoint?: string
): Promise<CompilationResult> {
  // If specific endpoint provided, only try that one
  const endpoints = translatorEndpoint
    ? [translatorEndpoint]
    : CQL_TRANSLATOR_CONFIG.publicEndpoints;

  const errors: string[] = [];

  // Try each endpoint in order
  for (const endpoint of endpoints) {
    try {
      const result = await compileCQLToELMWithEndpoint(cqlCode, endpoint);
      if (result.success || (result.errors && result.errors.some(e => !e.message.includes('fetch')))) {
        // Success or CQL-specific error (not network error)
        return result;
      }
      errors.push(`${endpoint}: ${result.errors?.[0]?.message || 'Unknown error'}`);
    } catch (error) {
      errors.push(`${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // All endpoints failed
  return {
    success: false,
    errors: [{
      severity: 'error',
      message: `All translation services unavailable. Tried: ${endpoints.length} endpoint(s). Last error: ${errors[errors.length - 1]}`,
    }],
  };
}

/**
 * Try to compile CQL to ELM using a specific endpoint
 */
async function compileCQLToELMWithEndpoint(
  cqlCode: string,
  endpoint: string
): Promise<CompilationResult> {
  // Build query string with options
  const params = new URLSearchParams();
  Object.entries(CQL_TRANSLATOR_CONFIG.defaultOptions).forEach(([key, value]) => {
    params.append(key, String(value));
  });

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CQL_TRANSLATOR_CONFIG.timeout);

  try {
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/cql',
        'Accept': 'application/elm+json',
      },
      body: cqlCode,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        errors: [{
          severity: 'error',
          message: `Translation service error: ${response.status} - ${errorText}`,
        }],
      };
    }

    const elm = await response.json() as ELMLibrary;

    // Check for annotation errors
    const errors: CompilationError[] = [];
    const warnings: CompilationWarning[] = [];

    // Parse annotations for errors/warnings if present
    if (elm.library && (elm.library as Record<string, unknown>).annotation) {
      const annotations = (elm.library as Record<string, unknown>).annotation as Array<{
        type?: string;
        message?: string;
        errorSeverity?: string;
        startLine?: number;
        startChar?: number;
        endLine?: number;
        endChar?: number;
      }>;

      annotations.forEach((ann) => {
        if (ann.errorSeverity === 'error') {
          errors.push({
            severity: 'error',
            message: ann.message || 'Unknown error',
            startLine: ann.startLine,
            startChar: ann.startChar,
            endLine: ann.endLine,
            endChar: ann.endChar,
          });
        } else if (ann.errorSeverity === 'warning') {
          warnings.push({
            severity: 'warning',
            message: ann.message || 'Unknown warning',
            startLine: ann.startLine,
            startChar: ann.startChar,
          });
        }
      });
    }

    return {
      success: errors.length === 0,
      elm,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        errors: [{
          severity: 'error',
          message: `Request timed out after ${CQL_TRANSLATOR_CONFIG.timeout / 1000}s`,
        }],
      };
    }

    return {
      success: false,
      errors: [{
        severity: 'error',
        message: `Failed to compile CQL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }],
    };
  }
}

/**
 * Execute compiled ELM against FHIR patient data
 *
 * This function should be used server-side with the actual cql-execution package
 */
export async function executeCQLAgainstFHIR(
  elm: ELMLibrary,
  patientBundles: FHIRBundle[],
  options: CQLExecutionOptions = {}
): Promise<CQLExecutionResult[]> {
  // This is a placeholder that will be implemented server-side
  // The actual implementation uses:
  // - cql-execution: new cql.Library(elm), new cql.Executor(lib, codeService)
  // - cql-exec-fhir: cqlfhir.PatientSource.FHIRv401()
  // - cql-exec-vsac: new vsac.CodeService()

  throw new Error('Server-side execution required. Use /api/execute endpoint.');
}

/**
 * Extract value set references from CQL code
 */
export function extractValueSetReferences(cqlCode: string): Array<{
  name: string;
  oid: string;
  version?: string;
}> {
  const valueSets: Array<{ name: string; oid: string; version?: string }> = [];

  // Match valueset declarations
  const valuesetPattern = /valueset\s+"([^"]+)"\s*:\s*'([^']+)'/g;
  let match;

  while ((match = valuesetPattern.exec(cqlCode)) !== null) {
    const [, name, url] = match;

    // Extract OID from URL
    let oid = url;
    let version: string | undefined;

    // Handle VSAC FHIR URLs
    if (url.includes('cts.nlm.nih.gov')) {
      const oidMatch = url.match(/ValueSet\/([0-9.]+)(\|(.+))?/);
      if (oidMatch) {
        oid = oidMatch[1];
        version = oidMatch[3];
      }
    }
    // Handle URN format
    else if (url.startsWith('urn:oid:')) {
      oid = url.replace('urn:oid:', '');
    }

    valueSets.push({ name, oid, version });
  }

  return valueSets;
}

/**
 * Extract define statements from CQL code
 */
export function extractDefineStatements(cqlCode: string): Array<{
  name: string;
  isFunction: boolean;
  context?: string;
}> {
  const defines: Array<{ name: string; isFunction: boolean; context?: string }> = [];

  // Track current context
  let currentContext = 'Patient';
  const contextPattern = /context\s+(Patient|Practitioner|Unfiltered)/g;
  let contextMatch;

  while ((contextMatch = contextPattern.exec(cqlCode)) !== null) {
    currentContext = contextMatch[1];
  }

  // Match define statements
  const definePattern = /define\s+(?:function\s+)?"([^"]+)"/g;
  let match;

  while ((match = definePattern.exec(cqlCode)) !== null) {
    const name = match[1];
    const isFunction = cqlCode.slice(Math.max(0, match.index - 20), match.index).includes('function');

    defines.push({
      name,
      isFunction,
      context: currentContext,
    });
  }

  return defines;
}

/**
 * Get the library identifier from CQL code
 */
export function extractLibraryIdentifier(cqlCode: string): {
  name: string;
  version: string;
} | null {
  const libraryPattern = /library\s+(\w+)\s+version\s+'([^']+)'/;
  const match = cqlCode.match(libraryPattern);

  if (match) {
    return {
      name: match[1],
      version: match[2],
    };
  }

  return null;
}

/**
 * Validate CQL structure without full compilation
 */
export function validateCQLStructure(cqlCode: string): {
  valid: boolean;
  issues: Array<{
    type: 'error' | 'warning';
    message: string;
    line?: number;
  }>;
} {
  const issues: Array<{ type: 'error' | 'warning'; message: string; line?: number }> = [];
  const lines = cqlCode.split('\n');

  // Check for library declaration
  const libraryInfo = extractLibraryIdentifier(cqlCode);
  if (!libraryInfo) {
    issues.push({
      type: 'error',
      message: 'Missing library declaration. Expected: library LibraryName version \'X.X.X\'',
      line: 1,
    });
  }

  // Check for FHIR using statement
  if (!/using\s+FHIR\s+version/.test(cqlCode)) {
    issues.push({
      type: 'error',
      message: 'Missing FHIR data model. Add: using FHIR version \'4.0.1\'',
    });
  }

  // Check for context
  if (!/context\s+(Patient|Practitioner|Unfiltered)/.test(cqlCode)) {
    issues.push({
      type: 'error',
      message: 'Missing context statement. Add: context Patient',
    });
  }

  // Check for define statements
  const defines = extractDefineStatements(cqlCode);
  if (defines.length === 0) {
    issues.push({
      type: 'warning',
      message: 'No define statements found. A CQL library should contain at least one define statement.',
    });
  }

  // Check for FHIRHelpers include
  if (!/include\s+FHIRHelpers/.test(cqlCode)) {
    issues.push({
      type: 'warning',
      message: 'Consider including FHIRHelpers for FHIR type conversions.',
    });
  }

  // Check for balanced brackets
  const bracketCheck = checkBracketBalance(cqlCode);
  if (!bracketCheck.balanced) {
    issues.push({
      type: 'error',
      message: `Unbalanced ${bracketCheck.type}: missing ${bracketCheck.count} closing ${bracketCheck.type}(s)`,
    });
  }

  // Check for measurement period
  if (!/parameter\s+"Measurement Period"/.test(cqlCode)) {
    issues.push({
      type: 'warning',
      message: 'Missing "Measurement Period" parameter. This is required for most quality measures.',
    });
  }

  // Line-specific checks
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Check for common issues
    if (trimmed.startsWith('define') && !trimmed.includes('"')) {
      issues.push({
        type: 'error',
        message: 'Define statement requires quoted identifier: define "Name":',
        line: lineNum,
      });
    }

    // Check for improper retrieve syntax
    if (/\[\s*[A-Z]\w+\s*:(?!\s*")/.test(trimmed)) {
      issues.push({
        type: 'warning',
        message: 'Retrieve expression may need quoted value set reference: [Resource: "Value Set Name"]',
        line: lineNum,
      });
    }
  });

  return {
    valid: issues.filter(i => i.type === 'error').length === 0,
    issues,
  };
}

function checkBracketBalance(code: string): { balanced: boolean; type?: string; count?: number } {
  const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
  const stack: string[] = [];

  // Remove strings and comments
  const cleanCode = code
    .replace(/'[^']*'/g, '')
    .replace(/"[^"]*"/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  for (const char of cleanCode) {
    if (pairs[char]) {
      stack.push(char);
    } else if (Object.values(pairs).includes(char)) {
      const last = stack.pop();
      if (!last || pairs[last] !== char) {
        const type = char === ')' ? 'parenthesis' : char === ']' ? 'bracket' : 'brace';
        return { balanced: false, type, count: 1 };
      }
    }
  }

  if (stack.length > 0) {
    const lastOpen = stack[stack.length - 1];
    const type = lastOpen === '(' ? 'parenthesis' : lastOpen === '[' ? 'bracket' : 'brace';
    return { balanced: false, type, count: stack.length };
  }

  return { balanced: true };
}
