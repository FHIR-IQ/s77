/**
 * CQL Compiler Web Worker
 * Handles CQL-to-ELM compilation off the main thread
 * Uses the CQL Translation Service API or local compilation
 */

// Message types
interface CompileRequest {
  type: 'compile';
  code: string;
  requestId: string;
}

interface CompileResponse {
  type: 'compile-result';
  requestId: string;
  success: boolean;
  elm?: object;
  annotations: Array<{
    row: number;
    col: number;
    endRow?: number;
    endCol?: number;
    text: string;
    type: 'error' | 'warning' | 'info';
  }>;
  compilationTime: number;
  error?: string;
}

// Translation service endpoints
const TRANSLATION_SERVICES = [
  'https://cql-translation-service.herokuapp.com/cql/translator',
  // Fallback to local Docker instance if available
  'http://localhost:8080/cql/translator',
];

// Parse CQL annotations from translation service response
function parseAnnotations(response: {
  library?: {
    annotation?: Array<{
      s?: { r?: string; startLine?: number; startChar?: number; endLine?: number; endChar?: number };
      message?: string;
      errorType?: string;
      errorSeverity?: string;
    }>;
  };
}) {
  const annotations: CompileResponse['annotations'] = [];

  if (response.library?.annotation) {
    for (const ann of response.library.annotation) {
      if (ann.message) {
        const severity = ann.errorSeverity?.toLowerCase();
        const type = severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'info';

        annotations.push({
          row: ann.s?.startLine ?? 1,
          col: ann.s?.startChar ?? 1,
          endRow: ann.s?.endLine,
          endCol: ann.s?.endChar,
          text: ann.message,
          type,
        });
      }
    }
  }

  return annotations;
}

// Local validation fallback (basic syntax checking)
function localValidation(code: string): CompileResponse['annotations'] {
  const annotations: CompileResponse['annotations'] = [];
  const lines = code.split('\n');

  // Basic syntax checks
  let hasLibrary = false;
  let hasContext = false;
  let hasUsing = false;
  let openParens = 0;
  let openBrackets = 0;
  let openBraces = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for library declaration
    if (/^\s*library\s+/.test(line)) {
      hasLibrary = true;
      // Check library naming convention
      const match = line.match(/library\s+(\w+)/);
      if (match && !/^[A-Z]/.test(match[1])) {
        annotations.push({
          row: lineNum,
          col: line.indexOf(match[1]) + 1,
          text: 'Library name should start with an uppercase letter',
          type: 'warning',
        });
      }
    }

    // Check for context declaration
    if (/^\s*context\s+/.test(line)) {
      hasContext = true;
    }

    // Check for using declaration
    if (/^\s*using\s+/.test(line)) {
      hasUsing = true;
      // Validate FHIR version
      if (line.includes('FHIR') && !line.includes("version")) {
        annotations.push({
          row: lineNum,
          col: 1,
          text: 'FHIR using declaration should include a version',
          type: 'warning',
        });
      }
    }

    // Check for unclosed strings
    const stringMatches = line.match(/'/g);
    if (stringMatches && stringMatches.length % 2 !== 0) {
      // Check if it's not a comment line
      if (!line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
        annotations.push({
          row: lineNum,
          col: line.indexOf("'") + 1,
          text: 'Unclosed string literal',
          type: 'error',
        });
      }
    }

    // Count brackets
    for (const char of line) {
      if (char === '(') openParens++;
      if (char === ')') openParens--;
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
    }

    // Check for common mistakes
    if (/\bdefine\s+"[^"]+"\s*$/.test(line)) {
      annotations.push({
        row: lineNum,
        col: line.indexOf('define') + 1,
        text: 'Define statement is missing a colon (:) and expression',
        type: 'error',
      });
    }

    // Check for deprecated syntax
    if (/\bCalculateAgeInYearsAt\b/.test(line)) {
      annotations.push({
        row: lineNum,
        col: line.indexOf('CalculateAgeInYearsAt') + 1,
        text: 'CalculateAgeInYearsAt is deprecated, use AgeInYearsAt instead',
        type: 'warning',
      });
    }

    // Check for undefined references (basic)
    const retrieveMatch = line.match(/\[([A-Z][a-zA-Z]*)\s*:/);
    if (retrieveMatch) {
      const resourceType = retrieveMatch[1];
      const validFhirResources = [
        'Patient', 'Encounter', 'Condition', 'Observation', 'Procedure',
        'MedicationRequest', 'MedicationStatement', 'Medication', 'Immunization',
        'AllergyIntolerance', 'DiagnosticReport', 'ServiceRequest', 'CarePlan',
        'Goal', 'Coverage', 'Claim', 'ExplanationOfBenefit', 'Device',
        'DocumentReference', 'FamilyMemberHistory', 'Specimen', 'Location',
        'Organization', 'Practitioner', 'RelatedPerson', 'CareTeam'
      ];
      if (!validFhirResources.includes(resourceType)) {
        annotations.push({
          row: lineNum,
          col: line.indexOf(resourceType) + 1,
          text: `Unknown FHIR resource type: ${resourceType}`,
          type: 'warning',
        });
      }
    }
  }

  // Global checks
  if (!hasLibrary) {
    annotations.push({
      row: 1,
      col: 1,
      text: 'Missing library declaration',
      type: 'error',
    });
  }

  if (hasLibrary && !hasUsing) {
    annotations.push({
      row: 1,
      col: 1,
      text: 'Missing using declaration (e.g., using FHIR version \'4.0.1\')',
      type: 'warning',
    });
  }

  if (hasUsing && !hasContext) {
    annotations.push({
      row: 1,
      col: 1,
      text: 'Missing context declaration (e.g., context Patient)',
      type: 'info',
    });
  }

  // Bracket mismatch
  if (openParens !== 0) {
    annotations.push({
      row: lines.length,
      col: 1,
      text: `Mismatched parentheses: ${openParens > 0 ? 'missing closing' : 'extra closing'} parenthesis`,
      type: 'error',
    });
  }

  if (openBrackets !== 0) {
    annotations.push({
      row: lines.length,
      col: 1,
      text: `Mismatched brackets: ${openBrackets > 0 ? 'missing closing' : 'extra closing'} bracket`,
      type: 'error',
    });
  }

  if (openBraces !== 0) {
    annotations.push({
      row: lines.length,
      col: 1,
      text: `Mismatched braces: ${openBraces > 0 ? 'missing closing' : 'extra closing'} brace`,
      type: 'error',
    });
  }

  return annotations;
}

// Compile using translation service
async function compileWithService(code: string): Promise<{ elm: object | null; annotations: CompileResponse['annotations'] }> {
  for (const serviceUrl of TRANSLATION_SERVICES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/cql',
          'Accept': 'application/elm+json',
        },
        body: code,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const result = await response.json();
        const annotations = parseAnnotations(result);
        return { elm: result, annotations };
      }
    } catch {
      // Try next service
      continue;
    }
  }

  // Fallback to local validation
  return {
    elm: null,
    annotations: localValidation(code),
  };
}

// Message handler
self.onmessage = async (event: MessageEvent<CompileRequest>) => {
  const { type, code, requestId } = event.data;

  if (type === 'compile') {
    const startTime = performance.now();

    try {
      const { elm, annotations } = await compileWithService(code);
      const compilationTime = performance.now() - startTime;

      const hasErrors = annotations.some(a => a.type === 'error');

      const response: CompileResponse = {
        type: 'compile-result',
        requestId,
        success: !hasErrors,
        elm: elm ?? undefined,
        annotations,
        compilationTime,
      };

      self.postMessage(response);
    } catch (error) {
      const compilationTime = performance.now() - startTime;

      const response: CompileResponse = {
        type: 'compile-result',
        requestId,
        success: false,
        annotations: [{
          row: 1,
          col: 1,
          text: error instanceof Error ? error.message : 'Unknown compilation error',
          type: 'error',
        }],
        compilationTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      self.postMessage(response);
    }
  }
};

// Export empty to make this a module
export {};
