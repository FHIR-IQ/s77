// CQL Builder Types - Based on HL7 CQL v1.5.3 Specification
// FHIR IQ - Open Quality

// FHIR Implementation Guide Types
export type FHIRImplementationGuide =
  | 'us-core'          // US Core IG
  | 'qi-core'          // QI-Core IG (for quality measures)
  | 'carin-bb'         // CARIN Blue Button IG
  | 'hedis'            // HEDIS IG
  | 'davinci-pdex'     // Da Vinci PDex
  | 'mcode';           // mCODE (oncology)

export interface FHIRIGInfo {
  id: FHIRImplementationGuide;
  name: string;
  version: string;
  url: string;
  description: string;
  fhirHelpers: string;
}

// Synthea Configuration for Test Data Generation
export interface SyntheaConfig {
  population: number;
  state: string;
  city?: string;
  gender?: 'M' | 'F';
  minAge?: number;
  maxAge?: number;
  modules?: string[];          // Synthea disease modules to include
  seed?: number;               // For reproducible data
}

export type MeasureType =
  | 'clinical-quality'      // Clinical Quality Measures (CMS/eCQM)
  | 'operational'           // Operational/Process Measures
  | 'population-health'     // Population Health Evaluation
  | 'consumer-insight'      // Patient/Consumer Insights
  | 'decision-support';     // Clinical Decision Support

export type MeasureScoringType =
  | 'proportion'           // Numerator/Denominator
  | 'ratio'                // Ratio measures
  | 'continuous-variable'  // Continuous Variable
  | 'cohort';              // Cohort identification

export type PopulationCriteria =
  | 'initial-population'
  | 'denominator'
  | 'denominator-exclusion'
  | 'denominator-exception'
  | 'numerator'
  | 'numerator-exclusion'
  | 'measure-population'
  | 'measure-population-exclusion'
  | 'measure-observation'
  | 'stratifier';

export interface ValueSetReference {
  name: string;
  oid: string;                    // VSAC OID (e.g., 2.16.840.1.113883.3.464.1003.102.12.1011)
  url?: string;                   // FHIR canonical URL
  version?: string;
  steward?: string;               // Value set steward
  purpose?: string;               // Description of value set purpose
}

export interface CodeReference {
  code: string;
  display: string;
  system: string;                 // e.g., SNOMED-CT, LOINC, ICD-10
  systemName: string;             // Human-readable name
}

export interface CQLLibraryMetadata {
  name: string;
  version: string;
  fhirVersion: string;           // Default: 4.0.1
  includes: string[];            // Included libraries
  valueSets: ValueSetReference[];
  codes: CodeReference[];
  parameters: CQLParameter[];
}

export interface CQLParameter {
  name: string;
  type: string;
  default?: string;
}

export interface CQLDefinition {
  name: string;
  expression: string;
  description?: string;
  populationType?: PopulationCriteria;
}

export interface CQLLibrary {
  metadata: CQLLibraryMetadata;
  context: 'Patient' | 'Practitioner' | 'Unfiltered';
  definitions: CQLDefinition[];
  functions?: CQLFunction[];
}

export interface CQLFunction {
  name: string;
  parameters: { name: string; type: string }[];
  returnType: string;
  body: string;
}

// Conversational Flow Types
export interface MeasureRequirement {
  // Step A: Purpose
  purpose: string;

  // Step B: Problem
  problemStatement: string;

  // Step C: Measure Type
  measureType: MeasureType;
  scoringType: MeasureScoringType;

  // Step D: Value Sets
  valueSets: ValueSetReference[];

  // Step E: Evidence
  evidenceReferences: EvidenceReference[];

  // FHIR IG Selection
  fhirIG: FHIRImplementationGuide;

  // Synthea Test Data Config
  syntheaConfig?: SyntheaConfig;

  // Additional context
  targetPopulation?: string;
  measurementPeriod?: string;
  exclusionCriteria?: string[];
  stratificationCriteria?: string[];
}

export interface EvidenceReference {
  title: string;
  source: string;              // e.g., "Journal of Medicine", "CDC Guidelines"
  url?: string;
  year?: number;
  relevance: string;
}

export interface ConversationStep {
  id: string;
  question: string;
  hint?: string;
  examples?: string[];
  type: 'text' | 'select' | 'multiselect' | 'valueset-search';
  options?: { value: string; label: string; description?: string }[];
  validation?: (value: string) => boolean;
}

export interface GeneratedCQL {
  library: string;              // Full CQL library code
  elm?: string;                 // Compiled ELM (if validated)
  validationResult?: ValidationResult;
  suggestions?: string[];       // AI suggestions for improvements
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'fatal';
}

export interface ValidationWarning {
  line?: number;
  column?: number;
  message: string;
  severity: 'warning' | 'info';
}

// FHIR Resource Types commonly used in CQL
export type FHIRResourceType =
  | 'Patient'
  | 'Encounter'
  | 'Condition'
  | 'Procedure'
  | 'Observation'
  | 'MedicationRequest'
  | 'MedicationAdministration'
  | 'DiagnosticReport'
  | 'Immunization'
  | 'AllergyIntolerance'
  | 'CarePlan'
  | 'Goal'
  | 'ServiceRequest'
  | 'Coverage'
  | 'Claim';

// Common Clinical Domains
export type ClinicalDomain =
  | 'preventive-care'
  | 'chronic-disease'
  | 'acute-care'
  | 'behavioral-health'
  | 'maternal-health'
  | 'pediatric'
  | 'geriatric'
  | 'oncology'
  | 'cardiovascular'
  | 'respiratory'
  | 'endocrine'
  | 'infectious-disease'
  | 'medication-management';
