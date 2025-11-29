// CQL Generator - Builds CQL code from structured requirements
// This is used in conjunction with LLM for intelligent code generation

import type { MeasureRequirement, CQLLibrary, ValueSetReference } from '@/types/cql';
import { libraryTemplates, expressionPatterns } from './cql-knowledge-base';

/**
 * Generate a library name from the measure purpose
 */
export function generateLibraryName(purpose: string): string {
  // Convert purpose to PascalCase library name
  const words = purpose
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .slice(0, 4); // Max 4 words

  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

/**
 * Format value set declarations for CQL
 */
export function formatValueSets(valueSets: ValueSetReference[]): string {
  return valueSets
    .map(
      (vs) =>
        `valueset "${vs.name}": 'http://cts.nlm.nih.gov/fhir/ValueSet/${vs.oid}'`
    )
    .join('\n');
}

/**
 * Generate the measurement period parameter
 */
export function generateMeasurementPeriod(startYear?: number): string {
  const year = startYear || new Date().getFullYear();
  return `parameter "Measurement Period" Interval<DateTime>
  default Interval[@${year}-01-01T00:00:00.0, @${year + 1}-01-01T00:00:00.0)`;
}

/**
 * Create a basic CQL template based on requirements
 */
export function createBasicTemplate(requirements: Partial<MeasureRequirement>): string {
  const libraryName = requirements.purpose
    ? generateLibraryName(requirements.purpose)
    : 'NewMeasure';

  const template = libraryTemplates[requirements.scoringType || 'proportion'];

  let cql = template
    .replace('{{LIBRARY_NAME}}', libraryName)
    .replace('{{VERSION}}', '1.0.0')
    .replace('{{START_DATE}}', `${new Date().getFullYear()}-01-01`)
    .replace('{{END_DATE}}', `${new Date().getFullYear() + 1}-01-01`);

  // Add value sets
  if (requirements.valueSets && requirements.valueSets.length > 0) {
    cql = cql.replace('{{VALUE_SETS}}', formatValueSets(requirements.valueSets));
  } else {
    cql = cql.replace('{{VALUE_SETS}}', '// Add value sets here');
  }

  // Add placeholders for code systems and codes
  cql = cql.replace('{{CODE_SYSTEMS}}', '');
  cql = cql.replace('{{CODES}}', '');

  return cql;
}

/**
 * System prompt for LLM-based CQL generation
 */
export const CQL_SYSTEM_PROMPT = `You are an expert Clinical Quality Language (CQL) developer. Your role is to generate valid, production-ready CQL code based on HL7 CQL v1.5.3 specification and the CQF Measures Implementation Guide.

## Key CQL Concepts You Must Follow:

### Library Structure
- Always start with library declaration: \`library LibraryName version 'X.X.X'\`
- Use FHIR 4.0.1: \`using FHIR version '4.0.1'\`
- Include FHIRHelpers: \`include FHIRHelpers version '4.0.1' called FHIRHelpers\`
- Include SupplementalDataElements for demographic tracking

### Value Set Declarations
- Use VSAC URLs: \`valueset "Name": 'http://cts.nlm.nih.gov/fhir/ValueSet/OID'\`
- Reference value sets by their quoted name in retrieves

### Context and Parameters
- Always set context: \`context Patient\`
- Define measurement period parameter with appropriate interval

### Population Criteria (for proportion measures)
1. Initial Population - who is eligible for the measure
2. Denominator - typically equals Initial Population
3. Denominator Exclusions - who to exclude from denominator
4. Denominator Exceptions - allowable exceptions
5. Numerator - who meets the measure criteria
6. Numerator Exclusions - who to exclude from numerator

### Query Patterns
- Use proper FHIR resource retrieves: \`[Encounter: "Value Set Name"]\`
- Always check status fields (e.g., \`Encounter.status = 'finished'\`)
- Use temporal operators: \`during\`, \`before\`, \`after\`, \`within X days\`
- Use \`exists()\` for boolean checks on collections

### Common Functions
- \`AgeInYearsAt(date)\` - Calculate age at a date
- \`duration in days of Interval\` - Calculate interval length
- \`start of\`, \`end of\` - Extract interval boundaries
- \`Last()\`, \`First()\` - Get list elements

### Best Practices
1. Use descriptive, meaningful names for all definitions
2. Add comments for complex logic
3. Break complex logic into smaller, named definitions
4. Use consistent formatting and indentation
5. Include SDE (Supplemental Data Elements) for demographics
6. Check clinical status for conditions: \`Condition.clinicalStatus ~ "active"\`
7. Check verification status: \`Condition.verificationStatus ~ "confirmed"\`

### Common Exclusions
- Hospice care
- Palliative care
- Frailty (for elderly populations)
- Terminal illness

Generate complete, syntactically correct CQL that can be validated with the CQL Language Support VS Code extension.`;

/**
 * Generate the user prompt for CQL generation
 */
export function generateUserPrompt(requirements: Partial<MeasureRequirement>): string {
  let prompt = `Generate a complete CQL library for the following measure:\n\n`;

  if (requirements.purpose) {
    prompt += `## Purpose\n${requirements.purpose}\n\n`;
  }

  if (requirements.problemStatement) {
    prompt += `## Problem Being Solved\n${requirements.problemStatement}\n\n`;
  }

  if (requirements.measureType) {
    prompt += `## Measure Type\n${requirements.measureType}\n\n`;
  }

  if (requirements.scoringType) {
    prompt += `## Scoring Type\n${requirements.scoringType}\n\n`;
  }

  if (requirements.valueSets && requirements.valueSets.length > 0) {
    prompt += `## Value Sets to Include\n`;
    requirements.valueSets.forEach((vs) => {
      prompt += `- ${vs.name} (OID: ${vs.oid})${vs.purpose ? `: ${vs.purpose}` : ''}\n`;
    });
    prompt += '\n';
  }

  if (requirements.targetPopulation) {
    prompt += `## Target Population\n${requirements.targetPopulation}\n\n`;
  }

  if (requirements.exclusionCriteria && requirements.exclusionCriteria.length > 0) {
    prompt += `## Exclusion Criteria\n`;
    requirements.exclusionCriteria.forEach((exc) => {
      prompt += `- ${exc}\n`;
    });
    prompt += '\n';
  }

  if (requirements.stratificationCriteria && requirements.stratificationCriteria.length > 0) {
    prompt += `## Stratification Criteria\n`;
    requirements.stratificationCriteria.forEach((strat) => {
      prompt += `- ${strat}\n`;
    });
    prompt += '\n';
  }

  if (requirements.evidenceReferences && requirements.evidenceReferences.length > 0) {
    prompt += `## Clinical Evidence\n`;
    requirements.evidenceReferences.forEach((ev) => {
      prompt += `- ${ev.title} (${ev.source}): ${ev.relevance}\n`;
    });
    prompt += '\n';
  }

  prompt += `
## Requirements
1. Generate complete, valid CQL following HL7 CQL v1.5.3 specification
2. Use FHIR 4.0.1 data model
3. Include all necessary value set declarations with VSAC URLs
4. Include Supplemental Data Elements (SDE) for demographics
5. Add helpful comments explaining the logic
6. Ensure the code can be validated with CQL Language Support extension
7. Use proper clinical status checks for conditions
8. Include appropriate temporal constraints based on the measure type

Return ONLY the CQL code, no additional explanation.`;

  return prompt;
}

/**
 * Post-process generated CQL to fix common issues
 */
export function postProcessCQL(cql: string): string {
  let processed = cql;

  // Ensure proper line endings
  processed = processed.replace(/\r\n/g, '\n');

  // Remove markdown code blocks if present
  processed = processed.replace(/^```cql\n?/gm, '');
  processed = processed.replace(/^```\n?/gm, '');

  // Ensure library declaration is first
  const lines = processed.split('\n');
  const libraryLine = lines.find((l) => l.trim().startsWith('library '));
  if (libraryLine) {
    const otherLines = lines.filter((l) => !l.trim().startsWith('library '));
    processed = [libraryLine, '', ...otherLines].join('\n');
  }

  // Clean up excessive blank lines
  processed = processed.replace(/\n{4,}/g, '\n\n\n');

  return processed.trim();
}
