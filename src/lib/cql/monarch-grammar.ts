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
  defaultToken: 'invalid',
  tokenPostfix: '.cql',

  // CQL is case-sensitive
  ignoreCase: false,

  // CQL Keywords
  keywords: [
    'library', 'version', 'using', 'include', 'called', 'public', 'private',
    'parameter', 'default', 'codesystem', 'valueset', 'code', 'concept',
    'define', 'function', 'returns', 'context', 'Patient', 'Population',
    'let', 'if', 'then', 'else', 'case', 'when', 'cast', 'as', 'is',
    'not', 'null', 'true', 'false', 'from', 'where', 'return', 'all',
    'distinct', 'sort', 'by', 'asc', 'ascending', 'desc', 'descending',
    'with', 'such', 'that', 'without', 'union', 'intersect', 'except',
    'collapse', 'expand', 'flatten', 'in', 'starts', 'ends', 'occurs',
    'same', 'day', 'includes', 'included', 'before', 'after', 'meets',
    'overlaps', 'start', 'end', 'width', 'duration', 'properly',
    'singleton', 'List', 'Interval', 'Tuple', 'between', 'and', 'or',
    'xor', 'implies', 'equivalent', 'contains', 'exists', 'retrieve',
    'display', 'aggregate', 'starting', 'fluent'
  ],

  // CQL Type Keywords
  typeKeywords: [
    'Boolean', 'Integer', 'Decimal', 'String', 'DateTime', 'Date', 'Time',
    'Quantity', 'Ratio', 'Code', 'Concept', 'ValueSet', 'CodeSystem',
    'Any', 'Choice', 'Interval', 'List', 'Tuple'
  ],

  // System Types
  systemTypes: [
    'System.Boolean', 'System.Integer', 'System.Decimal', 'System.String',
    'System.DateTime', 'System.Date', 'System.Time', 'System.Quantity',
    'System.Ratio', 'System.Code', 'System.Concept', 'System.Any'
  ],

  // Temporal operators
  temporalOperators: [
    'years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds',
    'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'
  ],

  // Mathematical operators
  operators: [
    '+', '-', '*', '/', '^', '=', '~', '!=', '!~', '<>', '<', '>', '<=', '>=',
    '|'
  ],

  // Symbols
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // Escape sequences
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer
  tokenizer: {
    root: [
      // Whitespace
      { include: '@whitespace' },

      // Comments
      [/\/\/.*$/, 'comment'],
      [/\/\*/, 'comment', '@comment'],

      // FHIR Resources (before identifiers)
      [/\b(Patient|Encounter|Condition|Observation|Procedure|MedicationRequest|MedicationStatement|Medication|DiagnosticReport|Immunization|AllergyIntolerance|CarePlan|Goal|CareTeam|Coverage|Claim|ExplanationOfBenefit|Practitioner|Organization|Location|Device|Specimen|FamilyMemberHistory|ServiceRequest)\b/, 'type.fhir'],

      // Annotations/Decorators - escape @ to match literal @ symbol
      [/\x40[a-zA-Z_]\w*/, 'annotation'],

      // Library declaration
      [/\b(library)\s+([A-Za-z_][A-Za-z0-9_]*)/, ['keyword', 'type.library']],

      // Include statement with alias
      [/\b(include)\s+([A-Za-z_][A-Za-z0-9_]*)/, ['keyword', 'type.library']],
      [/\b(called)\s+([A-Za-z_][A-Za-z0-9_]*)/, ['keyword', 'variable.alias']],

      // Version strings
      [/\b(version)\s+('[^']*')/, ['keyword', 'string.version']],

      // Using FHIR declaration
      [/\b(using)\s+(FHIR|QDM|QICore)/, ['keyword', 'type.model']],

      // Context declarations
      [/\b(context)\s+(Patient|Population|Practitioner|Unfiltered)/, ['keyword', 'type.context']],

      // Define statements
      [/\b(define)\s+(fluent\s+)?(function\s+)?("[^"]+"|[A-Za-z_][A-Za-z0-9_]*)/, ['keyword', 'keyword', 'keyword', 'variable.definition']],

      // Parameter declarations
      [/\b(parameter)\s+("[^"]+"|[A-Za-z_][A-Za-z0-9_]*)/, ['keyword', 'variable.parameter']],

      // Valueset declarations
      [/\b(valueset)\s+("[^"]+")/, ['keyword', 'variable.valueset']],

      // Codesystem declarations
      [/\b(codesystem)\s+("[^"]+")/, ['keyword', 'variable.codesystem']],

      // Code declarations
      [/\b(code)\s+("[^"]+")/, ['keyword', 'variable.code']],

      // Concept declarations
      [/\b(concept)\s+("[^"]+")/, ['keyword', 'variable.concept']],

      // System types (e.g., System.Boolean)
      [/\bSystem\.[A-Z][a-zA-Z]*\b/, 'type.system'],

      // FHIR paths (e.g., Observation.code, Patient.birthDate)
      [/\b([A-Z][a-zA-Z]*)(\.)(value|code|status|category|effective|onset|abatement|recorded|issued|performer|subject|encounter|period|start|end|birthDate|deceased|gender|name|identifier|address|telecom|maritalStatus|multipleBirth|contact|communication|generalPractitioner|managingOrganization|link|extension|id|meta|implicitRules|language|text|contained|modifierExtension)\b/, ['type.fhir', 'delimiter', 'property.fhir']],

      // Keywords
      [/\b(and|or|xor|implies|not)\b/, 'keyword.operator.logical'],
      [/\b(before|after|during|overlaps|meets|starts|ends|occurs|same|properly|included|includes|within|contains)\b/, 'keyword.operator.temporal'],
      [/\b(is|as|cast|convert)\b/, 'keyword.operator.type'],
      [/\b(in|between)\b/, 'keyword.operator.membership'],

      // Temporal units
      [/\b(years?|months?|weeks?|days?|hours?|minutes?|seconds?|milliseconds?)\b/, 'keyword.temporal'],

      // CQL Functions
      [/\b(AgeInYears|AgeInMonths|AgeInDays|AgeInHours|AgeInMinutes|AgeInSeconds|CalculateAge|CalculateAgeInYears|CalculateAgeInMonths|CalculateAgeInDays|Now|Today|TimeOfDay|Count|Sum|Min|Max|Avg|Median|Mode|StdDev|Variance|PopulationStdDev|PopulationVariance|First|Last|Single|Exists|Not|IsNull|IsTrue|IsFalse|ToConcept|ToCode|ToDateTime|ToDate|ToTime|ToDecimal|ToInteger|ToString|ToQuantity|ToBoolean|ToList|ToInterval|Flatten|Collapse|Expand|Length|Indexer|Last|Lower|Upper|Split|Combine|StartsWith|EndsWith|Matches|ReplaceMatches|Substring|PositionOf|LastPositionOf|IndexOf|Abs|Ceiling|Floor|Truncate|Round|Ln|Log|Power|Exp|Successor|Predecessor|LowBoundary|HighBoundary|Precision|ConvertQuantity|ConvertsToBoolean|ConvertsToDate|ConvertsToDateTime|ConvertsToDecimal|ConvertsToInteger|ConvertsToLong|ConvertsToQuantity|ConvertsToRatio|ConvertsToString|ConvertsToTime)\b(?=\s*\()/, 'function.builtin'],

      // Keywords (general)
      [/\b(library|version|using|include|called|public|private|parameter|default|codesystem|valueset|code|concept|define|function|returns|context|let|if|then|else|case|when|from|where|return|all|distinct|sort|by|asc|ascending|desc|descending|with|such|that|without|union|intersect|except|flatten|singleton|aggregate|starting|fluent|retrieve|display)\b/, 'keyword'],

      // Boolean literals
      [/\b(true|false)\b/, 'constant.boolean'],

      // Null
      [/\bnull\b/, 'constant.null'],

      // Numbers - Decimal and Integer
      [/\d+\.\d+/, 'number.float'],
      [/\d+/, 'number'],

      // Quantities with units
      [/\d+(\.\d+)?\s*'[^']*'/, 'number.quantity'],

      // Date/Time literals - CQL uses @ prefix for date/time literals
      // Note: Must escape @ as \x40 to avoid Monarch attribute reference interpretation
      [/\x40\d{4}(-\d{2}(-\d{2}(T\d{2}(:\d{2}(:\d{2}(\.\d+)?)?)?)?)?)?([+-]\d{2}:\d{2}|Z)?/, 'date'],
      [/\x40T\d{2}(:\d{2}(:\d{2}(\.\d+)?)?)?/, 'date'],

      // Intervals
      [/Interval\s*[\[\(]/, 'keyword.interval'],

      // Strings
      [/'([^'\\]|\\.)*$/, 'string.invalid'],  // Non-terminated string
      [/'/, 'string', '@string_single'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],  // Non-terminated string
      [/"/, 'string.identifier', '@string_double'],

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],

      // Delimiters
      [/[;,.]/, 'delimiter'],
      [/:/, 'delimiter.colon'],

      // Identifiers
      [/[A-Z][a-zA-Z0-9_]*/, {
        cases: {
          '@typeKeywords': 'type',
          '@default': 'identifier.type'
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
      ["\\*/", 'comment', '@pop'],
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

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
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
    increaseIndentPattern: /^\s*(define|if|case|where|return|from|with|such that|without|let)\b.*:?\s*$/,
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
  fhirResources: FHIR_RESOURCES.slice(0, 30) // Most common resources
};
