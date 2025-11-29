// CQL Knowledge Base - Based on HL7 CQL v1.5.3 and CQF Measures IG
// This module provides comprehensive CQL patterns, templates, and examples

import { MeasureType, MeasureScoringType, ClinicalDomain, ValueSetReference } from '@/types/cql';

// Common VSAC Value Sets by Domain
export const commonValueSets: Record<ClinicalDomain, ValueSetReference[]> = {
  'preventive-care': [
    {
      name: 'Annual Wellness Visit',
      oid: '2.16.840.1.113883.3.526.3.1240',
      purpose: 'Encounters for annual wellness visits',
    },
    {
      name: 'Preventive Care Services',
      oid: '2.16.840.1.113883.3.464.1003.101.12.1024',
      purpose: 'General preventive care encounters',
    },
  ],
  'chronic-disease': [
    {
      name: 'Diabetes',
      oid: '2.16.840.1.113883.3.464.1003.103.12.1001',
      purpose: 'Diabetes diagnoses',
    },
    {
      name: 'Essential Hypertension',
      oid: '2.16.840.1.113883.3.464.1003.104.12.1011',
      purpose: 'Hypertension diagnoses',
    },
    {
      name: 'Heart Failure',
      oid: '2.16.840.1.113883.3.526.3.376',
      purpose: 'Heart failure diagnoses',
    },
  ],
  'acute-care': [
    {
      name: 'Emergency Department Visit',
      oid: '2.16.840.1.113883.3.117.1.7.1.292',
      purpose: 'ED encounters',
    },
    {
      name: 'Inpatient Encounter',
      oid: '2.16.840.1.113883.3.666.5.307',
      purpose: 'Inpatient hospital stays',
    },
  ],
  'behavioral-health': [
    {
      name: 'Major Depression',
      oid: '2.16.840.1.113883.3.464.1003.105.12.1007',
      purpose: 'Major depressive disorder diagnoses',
    },
    {
      name: 'Alcohol and Drug Dependence',
      oid: '2.16.840.1.113883.3.464.1003.106.12.1001',
      purpose: 'Substance use disorder diagnoses',
    },
  ],
  'maternal-health': [
    {
      name: 'Pregnancy',
      oid: '2.16.840.1.113883.3.526.3.378',
      purpose: 'Pregnancy-related conditions',
    },
    {
      name: 'Delivery Procedures',
      oid: '2.16.840.1.113883.3.464.1003.111.12.1011',
      purpose: 'Delivery and birth procedures',
    },
  ],
  'pediatric': [
    {
      name: 'Well Child Visits',
      oid: '2.16.840.1.113883.3.464.1003.101.12.1027',
      purpose: 'Pediatric wellness encounters',
    },
    {
      name: 'Childhood Immunizations',
      oid: '2.16.840.1.113883.3.464.1003.196.12.1019',
      purpose: 'Standard childhood vaccinations',
    },
  ],
  'geriatric': [
    {
      name: 'Frailty Device',
      oid: '2.16.840.1.113883.3.464.1003.118.12.1300',
      purpose: 'Frailty-related devices',
    },
    {
      name: 'Dementia Diagnoses',
      oid: '2.16.840.1.113883.3.526.3.1379',
      purpose: 'Dementia and cognitive disorders',
    },
  ],
  'oncology': [
    {
      name: 'Malignant Neoplasm',
      oid: '2.16.840.1.113883.3.526.3.1010',
      purpose: 'Cancer diagnoses',
    },
    {
      name: 'Chemotherapy',
      oid: '2.16.840.1.113883.3.526.3.1027',
      purpose: 'Chemotherapy procedures',
    },
  ],
  'cardiovascular': [
    {
      name: 'Ischemic Heart Disease',
      oid: '2.16.840.1.113883.3.464.1003.104.12.1003',
      purpose: 'Coronary artery disease',
    },
    {
      name: 'Atrial Fibrillation',
      oid: '2.16.840.1.113883.3.526.3.1028',
      purpose: 'AFib diagnoses',
    },
  ],
  'respiratory': [
    {
      name: 'COPD',
      oid: '2.16.840.1.113883.3.464.1003.102.12.1001',
      purpose: 'COPD diagnoses',
    },
    {
      name: 'Asthma',
      oid: '2.16.840.1.113883.3.526.3.1041',
      purpose: 'Asthma diagnoses',
    },
  ],
  'endocrine': [
    {
      name: 'Thyroid Disorder',
      oid: '2.16.840.1.113883.3.464.1003.117.12.1015',
      purpose: 'Thyroid conditions',
    },
  ],
  'infectious-disease': [
    {
      name: 'HIV',
      oid: '2.16.840.1.113883.3.464.1003.120.12.1003',
      purpose: 'HIV diagnoses',
    },
    {
      name: 'Hepatitis C',
      oid: '2.16.840.1.113883.3.464.1003.120.12.1007',
      purpose: 'Hepatitis C diagnoses',
    },
  ],
  'medication-management': [
    {
      name: 'High-Risk Medications',
      oid: '2.16.840.1.113883.3.464.1003.196.12.1253',
      purpose: 'High-risk medications for elderly',
    },
    {
      name: 'Opioid Medications',
      oid: '2.16.840.1.113883.3.464.1003.196.12.1510',
      purpose: 'Opioid prescriptions',
    },
  ],
};

// CQL Library Templates
export const libraryTemplates: Record<MeasureScoringType, string> = {
  proportion: `library {{LIBRARY_NAME}} version '{{VERSION}}'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers
include SupplementalDataElements version '3.0.0' called SDE
include QICoreCommon version '2.0.0' called QICoreCommon

{{VALUE_SETS}}

{{CODE_SYSTEMS}}

{{CODES}}

parameter "Measurement Period" Interval<DateTime>
  default Interval[@{{START_DATE}}T00:00:00.0, @{{END_DATE}}T00:00:00.0)

context Patient

// Supplemental Data Elements
define "SDE Ethnicity":
  SDE."SDE Ethnicity"

define "SDE Payer":
  SDE."SDE Payer"

define "SDE Race":
  SDE."SDE Race"

define "SDE Sex":
  SDE."SDE Sex"

// Initial Population
{{INITIAL_POPULATION}}

// Denominator
{{DENOMINATOR}}

// Denominator Exclusions
{{DENOMINATOR_EXCLUSIONS}}

// Denominator Exceptions
{{DENOMINATOR_EXCEPTIONS}}

// Numerator
{{NUMERATOR}}

// Numerator Exclusions
{{NUMERATOR_EXCLUSIONS}}

{{STRATIFIERS}}
`,

  ratio: `library {{LIBRARY_NAME}} version '{{VERSION}}'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers

{{VALUE_SETS}}

parameter "Measurement Period" Interval<DateTime>
  default Interval[@{{START_DATE}}T00:00:00.0, @{{END_DATE}}T00:00:00.0)

context Patient

// Initial Population
{{INITIAL_POPULATION}}

// Denominator (events for denominator rate)
{{DENOMINATOR}}

// Numerator (events for numerator rate)
{{NUMERATOR}}
`,

  'continuous-variable': `library {{LIBRARY_NAME}} version '{{VERSION}}'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers

{{VALUE_SETS}}

parameter "Measurement Period" Interval<DateTime>
  default Interval[@{{START_DATE}}T00:00:00.0, @{{END_DATE}}T00:00:00.0)

context Patient

// Initial Population
{{INITIAL_POPULATION}}

// Measure Population
{{MEASURE_POPULATION}}

// Measure Population Exclusions
{{MEASURE_POPULATION_EXCLUSIONS}}

// Measure Observation
define function "Measure Observation"({{OBSERVATION_PARAMETER}}):
  {{OBSERVATION_EXPRESSION}}
`,

  cohort: `library {{LIBRARY_NAME}} version '{{VERSION}}'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers

{{VALUE_SETS}}

parameter "Measurement Period" Interval<DateTime>
  default Interval[@{{START_DATE}}T00:00:00.0, @{{END_DATE}}T00:00:00.0)

context Patient

// Initial Population (Cohort Definition)
{{INITIAL_POPULATION}}

{{STRATIFIERS}}
`,
};

// Common CQL Expression Patterns
export const expressionPatterns = {
  // Age calculations
  ageInYears: `AgeInYearsAt(date from start of "Measurement Period")`,
  ageInMonths: `AgeInMonthsAt(date from start of "Measurement Period")`,
  ageBetween: (min: number, max: number) =>
    `AgeInYearsAt(date from start of "Measurement Period") >= ${min}
    and AgeInYearsAt(date from start of "Measurement Period") < ${max}`,

  // Encounter patterns
  encounterDuringPeriod: (valueSetName: string) =>
    `[Encounter: "${valueSetName}"] Encounter
    where Encounter.status = 'finished'
      and Encounter.period during "Measurement Period"`,

  qualifyingEncounter: (valueSetName: string) =>
    `[Encounter: "${valueSetName}"] ValidEncounter
    where ValidEncounter.status = 'finished'
      and ValidEncounter.period during "Measurement Period"`,

  // Condition patterns
  activeCondition: (valueSetName: string) =>
    `[Condition: "${valueSetName}"] Condition
    where Condition.clinicalStatus ~ QICoreCommon."active"
      and Condition.verificationStatus ~ QICoreCommon."confirmed"`,

  conditionDuringPeriod: (valueSetName: string) =>
    `[Condition: "${valueSetName}"] Condition
    where Condition.onset during "Measurement Period"`,

  // Procedure patterns
  procedureCompleted: (valueSetName: string) =>
    `[Procedure: "${valueSetName}"] Procedure
    where Procedure.status = 'completed'`,

  procedureDuringPeriod: (valueSetName: string) =>
    `[Procedure: "${valueSetName}"] Procedure
    where Procedure.status = 'completed'
      and Procedure.performed during "Measurement Period"`,

  // Medication patterns
  medicationActive: (valueSetName: string) =>
    `[MedicationRequest: "${valueSetName}"] MedicationRequest
    where MedicationRequest.status = 'active'`,

  medicationDispensed: (valueSetName: string) =>
    `[MedicationDispense: "${valueSetName}"] MedicationDispense
    where MedicationDispense.status = 'completed'`,

  // Observation patterns
  observationResult: (valueSetName: string) =>
    `[Observation: "${valueSetName}"] Observation
    where Observation.status in { 'final', 'amended', 'corrected' }`,

  latestObservation: (valueSetName: string) =>
    `Last(
    [Observation: "${valueSetName}"] Observation
      where Observation.status in { 'final', 'amended', 'corrected' }
        and Observation.effective during "Measurement Period"
    sort by effective
  )`,

  // Temporal patterns
  duringPeriod: `during "Measurement Period"`,
  beforePeriodEnd: `before end of "Measurement Period"`,
  withinDays: (days: number) => `within ${days} days`,
  withinMonths: (months: number) => `within ${months} months`,

  // Existence checks
  exists: (expression: string) => `exists(${expression})`,
  notExists: (expression: string) => `not exists(${expression})`,

  // Hospice exclusion (common pattern)
  hospiceExclusion: `exists(
    [Encounter: "Encounter Inpatient"] InpatientEncounter
      where InpatientEncounter.status = 'finished'
        and InpatientEncounter.hospitalization.dischargeDisposition ~ "Discharge to home for hospice care (procedure)"
  )
    or exists(
      [ServiceRequest: "Hospice Care Ambulatory"] HospiceOrder
        where HospiceOrder.status in { 'active', 'on-hold', 'completed' }
          and HospiceOrder.authoredOn during "Measurement Period"
    )`,

  // Frailty exclusion (for geriatric measures)
  frailtyExclusion: `exists(
    [Condition: "Frailty Diagnosis"] FrailtyCondition
      where FrailtyCondition.clinicalStatus ~ QICoreCommon."active"
  )
    or exists(
      [DeviceRequest: "Frailty Device"] FrailtyDevice
        where FrailtyDevice.status = 'active'
    )`,
};

// Example CQL Libraries for Reference
export const exampleLibraries = {
  diabetesHbA1c: `/*
 * Example: Diabetes HbA1c Control Measure
 * Based on CMS122v11 - Diabetes: Hemoglobin A1c (HbA1c) Poor Control (> 9%)
 */
library DiabetesHbA1cControl version '1.0.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers
include SupplementalDataElements version '3.0.0' called SDE

valueset "Diabetes": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.103.12.1001'
valueset "HbA1c Laboratory Test": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1013'
valueset "Annual Wellness Visit": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.526.3.1240'
valueset "Office Visit": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1001'

parameter "Measurement Period" Interval<DateTime>
  default Interval[@2024-01-01T00:00:00.0, @2025-01-01T00:00:00.0)

context Patient

define "SDE Ethnicity":
  SDE."SDE Ethnicity"

define "SDE Payer":
  SDE."SDE Payer"

define "SDE Race":
  SDE."SDE Race"

define "SDE Sex":
  SDE."SDE Sex"

define "Qualifying Encounters":
  ([Encounter: "Office Visit"]
    union [Encounter: "Annual Wellness Visit"]) ValidEncounter
    where ValidEncounter.status = 'finished'
      and ValidEncounter.period during "Measurement Period"

define "Initial Population":
  AgeInYearsAt(date from start of "Measurement Period") in Interval[18, 75]
    and exists("Qualifying Encounters")
    and exists(
      [Condition: "Diabetes"] Diabetes
        where Diabetes.clinicalStatus ~ "active"
    )

define "Denominator":
  "Initial Population"

define "Denominator Exclusions":
  false // Add hospice, palliative care exclusions as needed

define "Most Recent HbA1c":
  Last(
    [Observation: "HbA1c Laboratory Test"] HbA1c
      where HbA1c.status in { 'final', 'amended', 'corrected' }
        and HbA1c.effective during "Measurement Period"
      sort by effective
  )

define "Has Most Recent HbA1c Greater Than 9 Percent":
  "Most Recent HbA1c".value > 9 '%'

define "Numerator":
  "Has Most Recent HbA1c Greater Than 9 Percent"
    or "Most Recent HbA1c" is null
`,

  colorectalScreening: `/*
 * Example: Colorectal Cancer Screening Measure
 * Based on CMS130 - Colorectal Cancer Screening
 */
library ColorectalCancerScreening version '1.0.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers
include SupplementalDataElements version '3.0.0' called SDE

valueset "Colonoscopy": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1020'
valueset "Fecal Occult Blood Test (FOBT)": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1011'
valueset "Flexible Sigmoidoscopy": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1010'
valueset "CT Colonography": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1038'
valueset "FIT-DNA Test": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1039'
valueset "Colorectal Cancer": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1001'
valueset "Total Colectomy": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1019'
valueset "Office Visit": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1001'

parameter "Measurement Period" Interval<DateTime>
  default Interval[@2024-01-01T00:00:00.0, @2025-01-01T00:00:00.0)

context Patient

define "Qualifying Encounters":
  [Encounter: "Office Visit"] ValidEncounter
    where ValidEncounter.status = 'finished'
      and ValidEncounter.period during "Measurement Period"

define "Initial Population":
  AgeInYearsAt(date from start of "Measurement Period") in Interval[45, 75]
    and exists("Qualifying Encounters")

define "Denominator":
  "Initial Population"

define "Denominator Exclusions":
  exists(
    [Condition: "Colorectal Cancer"] ColorectalCancer
      where ColorectalCancer.clinicalStatus ~ "active"
  )
    or exists(
      [Procedure: "Total Colectomy"] Colectomy
        where Colectomy.status = 'completed'
          and Colectomy.performed before end of "Measurement Period"
    )

define "Colonoscopy Performed":
  [Procedure: "Colonoscopy"] Colonoscopy
    where Colonoscopy.status = 'completed'
      and Colonoscopy.performed ends 10 years or less before end of "Measurement Period"

define "FOBT Performed":
  [Observation: "Fecal Occult Blood Test (FOBT)"] FOBT
    where FOBT.status in { 'final', 'amended', 'corrected' }
      and FOBT.effective during "Measurement Period"
      and FOBT.value is not null

define "Flexible Sigmoidoscopy Performed":
  [Procedure: "Flexible Sigmoidoscopy"] Sigmoidoscopy
    where Sigmoidoscopy.status = 'completed'
      and Sigmoidoscopy.performed ends 5 years or less before end of "Measurement Period"

define "Numerator":
  exists("Colonoscopy Performed")
    or exists("FOBT Performed")
    or exists("Flexible Sigmoidoscopy Performed")
`,

  medicationAdherence: `/*
 * Example: Medication Adherence Measure
 * Proportion of days covered for chronic medications
 */
library MedicationAdherence version '1.0.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers

valueset "Diabetes Medications": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.196.12.1001'
valueset "Office Visit": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1001'

parameter "Measurement Period" Interval<DateTime>
  default Interval[@2024-01-01T00:00:00.0, @2025-01-01T00:00:00.0)

context Patient

define "Initial Population":
  AgeInYearsAt(date from start of "Measurement Period") >= 18
    and exists(
      [MedicationRequest: "Diabetes Medications"] MedRequest
        where MedRequest.status = 'active'
          and MedRequest.authoredOn before end of "Measurement Period"
    )

define "Denominator":
  "Initial Population"

define "Medication Dispenses":
  [MedicationDispense: "Diabetes Medications"] Dispense
    where Dispense.status = 'completed'
      and Dispense.whenHandedOver during "Measurement Period"

define "Days Covered":
  Sum(
    "Medication Dispenses" Dispense
      return duration in days of Dispense.daysSupply
  )

define "Days in Period":
  duration in days of "Measurement Period"

define "Proportion of Days Covered":
  if "Days in Period" > 0 then
    "Days Covered" / "Days in Period"
  else
    null

define "Numerator":
  "Proportion of Days Covered" >= 0.8
`,
};

// Measure type descriptions for UI
export const measureTypeDescriptions: Record<MeasureType, { title: string; description: string; examples: string[] }> = {
  'clinical-quality': {
    title: 'Clinical Quality Measure (eCQM)',
    description: 'Measures the quality of clinical care against evidence-based guidelines. Used for CMS reporting, MIPS, and quality improvement.',
    examples: [
      'Diabetes HbA1c control',
      'Blood pressure management',
      'Cancer screening rates',
      'Medication adherence',
    ],
  },
  operational: {
    title: 'Operational Measure',
    description: 'Measures healthcare operations efficiency, resource utilization, and process performance.',
    examples: [
      'Hospital readmission rates',
      'Average length of stay',
      'ED wait times',
      'Appointment no-show rates',
    ],
  },
  'population-health': {
    title: 'Population Health Measure',
    description: 'Evaluates health outcomes and disparities across patient populations.',
    examples: [
      'Vaccination rates',
      'Chronic disease prevalence',
      'Health equity assessments',
      'Social determinants of health',
    ],
  },
  'consumer-insight': {
    title: 'Consumer/Patient Insight',
    description: 'Measures patient experience, engagement, and satisfaction.',
    examples: [
      'Patient satisfaction scores',
      'Portal engagement rates',
      'Care plan adherence',
      'Patient-reported outcomes',
    ],
  },
  'decision-support': {
    title: 'Clinical Decision Support',
    description: 'Logic for real-time clinical alerts and recommendations.',
    examples: [
      'Drug-drug interaction alerts',
      'Care gap notifications',
      'Risk stratification',
      'Preventive care reminders',
    ],
  },
};

// Scoring type descriptions
export const scoringTypeDescriptions: Record<MeasureScoringType, { title: string; description: string }> = {
  proportion: {
    title: 'Proportion Measure',
    description: 'Calculates the percentage of patients meeting the numerator criteria out of those in the denominator. Most common measure type.',
  },
  ratio: {
    title: 'Ratio Measure',
    description: 'Compares two related but distinct populations or events. Used when numerator is not a subset of denominator.',
  },
  'continuous-variable': {
    title: 'Continuous Variable Measure',
    description: 'Calculates a numeric value (mean, median) across a population. Used for measures like average length of stay.',
  },
  cohort: {
    title: 'Cohort Measure',
    description: 'Identifies a population meeting specific criteria. Used for registry reporting or population identification.',
  },
};
