/**
 * CQL (Clinical Quality Language) Monarch Grammar Definition
 * For Monaco Editor syntax highlighting
 * Based on HL7 CQL v1.5.3 specification
 */

import type { languages } from 'monaco-editor';

// FHIR R4 Resource Types for highlighting
export const FHIR_RESOURCES = [
  'Account', 'ActivityDefinition', 'AdverseEvent', 'AllergyIntolerance',
  'Appointment', 'AppointmentResponse', 'AuditEvent', 'Basic', 'Binary',
  'BiologicallyDerivedProduct', 'BodyStructure', 'Bundle', 'CapabilityStatement',
  'CarePlan', 'CareTeam', 'CatalogEntry', 'ChargeItem', 'ChargeItemDefinition',
  'Claim', 'ClaimResponse', 'ClinicalImpression', 'CodeSystem', 'Communication',
  'CommunicationRequest', 'CompartmentDefinition', 'Composition', 'ConceptMap',
  'Condition', 'Consent', 'Contract', 'Coverage', 'CoverageEligibilityRequest',
  'CoverageEligibilityResponse', 'DetectedIssue', 'Device', 'DeviceDefinition',
  'DeviceMetric', 'DeviceRequest', 'DeviceUseStatement', 'DiagnosticReport',
  'DocumentManifest', 'DocumentReference', 'EffectEvidenceSynthesis', 'Encounter',
  'Endpoint', 'EnrollmentRequest', 'EnrollmentResponse', 'EpisodeOfCare',
  'EventDefinition', 'Evidence', 'EvidenceVariable', 'ExampleScenario',
  'ExplanationOfBenefit', 'FamilyMemberHistory', 'Flag', 'Goal', 'GraphDefinition',
  'Group', 'GuidanceResponse', 'HealthcareService', 'ImagingStudy', 'Immunization',
  'ImmunizationEvaluation', 'ImmunizationRecommendation', 'ImplementationGuide',
  'InsurancePlan', 'Invoice', 'Library', 'Linkage', 'List', 'Location', 'Measure',
  'MeasureReport', 'Media', 'Medication', 'MedicationAdministration',
  'MedicationDispense', 'MedicationKnowledge', 'MedicationRequest',
  'MedicationStatement', 'MedicinalProduct', 'MedicinalProductAuthorization',
  'MedicinalProductContraindication', 'MedicinalProductIndication',
  'MedicinalProductIngredient', 'MedicinalProductInteraction',
  'MedicinalProductManufactured', 'MedicinalProductPackaged',
  'MedicinalProductPharmaceutical', 'MedicinalProductUndesirableEffect',
  'MessageDefinition', 'MessageHeader', 'MolecularSequence', 'NamingSystem',
  'NutritionOrder', 'Observation', 'ObservationDefinition', 'OperationDefinition',
  'OperationOutcome', 'Organization', 'OrganizationAffiliation', 'Parameters',
  'Patient', 'PaymentNotice', 'PaymentReconciliation', 'Person', 'PlanDefinition',
  'Practitioner', 'PractitionerRole', 'Procedure', 'Provenance', 'Questionnaire',
  'QuestionnaireResponse', 'RelatedPerson', 'RequestGroup', 'ResearchDefinition',
  'ResearchElementDefinition', 'ResearchStudy', 'ResearchSubject', 'RiskAssessment',
  'RiskEvidenceSynthesis', 'Schedule', 'SearchParameter', 'ServiceRequest',
  'Slot', 'Specimen', 'SpecimenDefinition', 'StructureDefinition', 'StructureMap',
  'Subscription', 'Substance', 'SubstanceNucleicAcid', 'SubstancePolymer',
  'SubstanceProtein', 'SubstanceReferenceInformation', 'SubstanceSourceMaterial',
  'SubstanceSpecification', 'SupplyDelivery', 'SupplyRequest', 'Task',
  'TerminologyCapabilities', 'TestReport', 'TestScript', 'ValueSet',
  'VerificationResult', 'VisionPrescription'
];

export const cqlMonarchLanguage: languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.cql',

  // CQL is case-sensitive
  ignoreCase: false,

  // CQL Keywords
  keywords: [
    'library', 'version', 'using', 'include', 'called', 'public', 'private',
    'parameter', 'default', 'codesystem', 'valueset', 'code', 'concept',
    'define', 'function', 'returns', 'context', 'fluent',
    'let', 'if', 'then', 'else', 'case', 'when', 'cast', 'as', 'is',
    'not', 'null', 'true', 'false', 'from', 'where', 'return', 'all',
    'distinct', 'sort', 'by', 'asc', 'ascending', 'desc', 'descending',
    'with', 'such', 'that', 'without', 'union', 'intersect', 'except',
    'collapse', 'expand', 'flatten', 'in', 'starts', 'ends', 'occurs',
    'same', 'day', 'includes', 'included', 'before', 'after', 'meets',
    'overlaps', 'start', 'end', 'width', 'duration', 'properly',
    'singleton', 'between', 'and', 'or', 'xor', 'implies', 'equivalent',
    'contains', 'exists', 'retrieve', 'display', 'aggregate', 'starting'
  ],

  // CQL Type Keywords
  typeKeywords: [
    'Boolean', 'Integer', 'Decimal', 'String', 'DateTime', 'Date', 'Time',
    'Quantity', 'Ratio', 'Code', 'Concept', 'ValueSet', 'CodeSystem',
    'Any', 'Choice', 'Interval', 'List', 'Tuple', 'Patient', 'Population'
  ],

  // Temporal operators
  temporalOperators: [
    'years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds',
    'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'
  ],

  // FHIR Resources
  fhirResources: [
    'Patient', 'Encounter', 'Condition', 'Observation', 'Procedure',
    'MedicationRequest', 'MedicationStatement', 'Medication', 'DiagnosticReport',
    'Immunization', 'AllergyIntolerance', 'CarePlan', 'Goal', 'CareTeam',
    'Coverage', 'Claim', 'ExplanationOfBenefit', 'Practitioner', 'Organization',
    'Location', 'Device', 'Specimen', 'FamilyMemberHistory', 'ServiceRequest'
  ],

  // Built-in functions
  builtinFunctions: [
    'AgeInYears', 'AgeInMonths', 'AgeInDays', 'AgeInHours', 'AgeInMinutes',
    'AgeInSeconds', 'CalculateAge', 'CalculateAgeInYears', 'CalculateAgeInMonths',
    'CalculateAgeInDays', 'Now', 'Today', 'TimeOfDay', 'Count', 'Sum', 'Min',
    'Max', 'Avg', 'Median', 'Mode', 'StdDev', 'Variance', 'PopulationStdDev',
    'PopulationVariance', 'First', 'Last', 'Single', 'Exists', 'Not', 'IsNull',
    'IsTrue', 'IsFalse', 'ToConcept', 'ToCode', 'ToDateTime', 'ToDate', 'ToTime',
    'ToDecimal', 'ToInteger', 'ToString', 'ToQuantity', 'ToBoolean', 'ToList',
    'ToInterval', 'Flatten', 'Collapse', 'Expand', 'Length', 'Indexer', 'Lower',
    'Upper', 'Split', 'Combine', 'StartsWith', 'EndsWith', 'Matches',
    'ReplaceMatches', 'Substring', 'PositionOf', 'LastPositionOf', 'IndexOf',
    'Abs', 'Ceiling', 'Floor', 'Truncate', 'Round', 'Ln', 'Log', 'Power', 'Exp',
    'Successor', 'Predecessor', 'LowBoundary', 'HighBoundary', 'Precision',
    'ConvertQuantity', 'ConvertsToBoolean', 'ConvertsToDate', 'ConvertsToDateTime',
    'ConvertsToDecimal', 'ConvertsToInteger', 'ConvertsToLong', 'ConvertsToQuantity',
    'ConvertsToRatio', 'ConvertsToString', 'ConvertsToTime'
  ],

  // Operators
  operators: [
    '=', '!=', '<>', '<', '>', '<=', '>=', '~', '!~', '+', '-', '*', '/', '^', '|'
  ],

  // Symbols for operator matching
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // Escape sequences
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer - simplified without multi-group rules
  tokenizer: {
    root: [
      // Whitespace
      [/[ \t\r\n]+/, ''],

      // Comments
      [/\/\/.*$/, 'comment'],
      [/\/\*/, 'comment', '@comment'],

      // Date/Time literals - CQL uses @ prefix
      [/@\d{4}(-\d{2}(-\d{2}(T\d{2}(:\d{2}(:\d{2}(\.\d+)?)?)?)?)?)?([+-]\d{2}:\d{2}|Z)?/, 'number.date'],
      [/@T\d{2}(:\d{2}(:\d{2}(\.\d+)?)?)?/, 'number.date'],

      // Strings - double quoted (identifiers)
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string.identifier', '@string_double'],

      // Strings - single quoted
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/'/, 'string', '@string_single'],

      // Numbers with units (quantities)
      [/\d+(\.\d+)?\s*'[^']*'/, 'number.quantity'],

      // Numbers - Decimal and Integer
      [/\d+\.\d+/, 'number.float'],
      [/\d+/, 'number'],

      // System types (e.g., System.Boolean)
      [/System\.[A-Z][a-zA-Z]*/, 'type.system'],

      // Delimiters and brackets
      [/[{}()\[\]]/, 'delimiter.bracket'],
      [/[;,.]/, 'delimiter'],
      [/:/, 'delimiter'],

      // Operators
      [/[=><!~?:&|+\-*\/\^%]+/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],

      // Identifiers and keywords
      [/[A-Z][a-zA-Z0-9_]*/, {
        cases: {
          '@typeKeywords': 'type',
          '@fhirResources': 'type.fhir',
          '@builtinFunctions': 'function.builtin',
          '@default': 'identifier'
        }
      }],
      [/[a-z_][a-zA-Z0-9_]*/, {
        cases: {
          '@keywords': 'keyword',
          '@temporalOperators': 'keyword.temporal',
          '@default': 'identifier'
        }
      }],
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      [/\*\//, 'comment', '@pop'],
      [/[\/*]/, 'comment']
    ],

    string_single: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop']
    ],

    string_double: [
      [/[^\\"]+/, 'string.identifier'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string.identifier', '@pop']
    ],
  },
};

// CQL Language Configuration for Monaco
export const cqlLanguageConfiguration: languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '/*', close: ' */' }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],
  folding: {
    markers: {
      start: /^\s*\/\*\s*#region\b/,
      end: /^\s*\/\*\s*#endregion\b/
    }
  },
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
  indentationRules: {
    increaseIndentPattern: /^\s*(define|if|case|where|return|from|with|without|let)\b.*:?\s*$/,
    decreaseIndentPattern: /^\s*(else|then|end)\b/
  }
};

// CQL Auto-completion suggestions
export const cqlCompletionItemProvider = {
  keywords: [
    'library', 'version', 'using', 'include', 'called', 'parameter', 'default',
    'codesystem', 'valueset', 'code', 'concept', 'define', 'function', 'returns',
    'context', 'Patient', 'let', 'if', 'then', 'else', 'case', 'when', 'from',
    'where', 'return', 'all', 'distinct', 'sort', 'by', 'with', 'such', 'that',
    'without', 'union', 'intersect', 'except', 'flatten', 'exists', 'not',
    'and', 'or', 'xor', 'implies', 'true', 'false', 'null', 'as', 'is', 'cast',
    'between', 'in', 'before', 'after', 'during', 'overlaps', 'meets', 'starts',
    'ends', 'properly', 'included', 'includes', 'singleton', 'aggregate'
  ],
  types: [
    'Boolean', 'Integer', 'Decimal', 'String', 'DateTime', 'Date', 'Time',
    'Quantity', 'Ratio', 'Code', 'Concept', 'ValueSet', 'Interval', 'List', 'Tuple'
  ],
  functions: [
    'AgeInYears', 'AgeInMonths', 'AgeInDays', 'Now', 'Today', 'Count', 'Sum',
    'Min', 'Max', 'Avg', 'First', 'Last', 'Exists', 'IsNull', 'ToConcept',
    'ToDateTime', 'ToDate', 'ToQuantity', 'Flatten', 'Collapse', 'Length'
  ],
  fhirResources: FHIR_RESOURCES.slice(0, 30)
};
