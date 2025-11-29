/*
 * Example: Diabetes HbA1c Poor Control Measure
 * Based on CMS122v11 - Diabetes: Hemoglobin A1c (HbA1c) Poor Control (> 9%)
 *
 * Purpose: Identify patients with diabetes who have poor glycemic control
 * Problem: Uncontrolled diabetes leads to complications; HbA1c > 9% indicates poor control
 * Type: Clinical Quality Measure (eCQM) - Proportion
 *
 * This is a reference implementation for the CQL Builder
 * Based on HL7 CQL v1.5.3 and CQF Measures IG
 */
library DiabetesHbA1cControl version '1.0.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers
include SupplementalDataElements version '3.0.0' called SDE
include QICoreCommon version '2.0.0' called QICoreCommon

// Value Sets
valueset "Diabetes": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.103.12.1001'
valueset "HbA1c Laboratory Test": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1013'
valueset "Annual Wellness Visit": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.526.3.1240'
valueset "Office Visit": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1001'
valueset "Preventive Care Services - Established Office Visit, 18 and Up": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1025'
valueset "Home Healthcare Services": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1016'
valueset "Hospice Care": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.1165'
valueset "Palliative Care Encounter": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1090'

// Measurement Period Parameter
parameter "Measurement Period" Interval<DateTime>
  default Interval[@2024-01-01T00:00:00.0, @2025-01-01T00:00:00.0)

context Patient

// Supplemental Data Elements for CMS Reporting
define "SDE Ethnicity":
  SDE."SDE Ethnicity"

define "SDE Payer":
  SDE."SDE Payer"

define "SDE Race":
  SDE."SDE Race"

define "SDE Sex":
  SDE."SDE Sex"

// Helper: Qualifying Encounters
define "Qualifying Encounters":
  (
    [Encounter: "Office Visit"]
    union [Encounter: "Annual Wellness Visit"]
    union [Encounter: "Preventive Care Services - Established Office Visit, 18 and Up"]
    union [Encounter: "Home Healthcare Services"]
  ) ValidEncounter
  where ValidEncounter.status = 'finished'
    and ValidEncounter.period during "Measurement Period"

// Helper: Active Diabetes Diagnosis
define "Has Diabetes Diagnosis":
  exists(
    [Condition: "Diabetes"] DiabetesDx
    where DiabetesDx.clinicalStatus ~ QICoreCommon."active"
      and DiabetesDx.verificationStatus ~ QICoreCommon."confirmed"
  )

/*
 * Initial Population
 * Patients 18-75 years of age with diabetes and a qualifying encounter
 */
define "Initial Population":
  AgeInYearsAt(date from start of "Measurement Period") in Interval[18, 75]
    and "Has Diabetes Diagnosis"
    and exists("Qualifying Encounters")

/*
 * Denominator
 * Equals Initial Population
 */
define "Denominator":
  "Initial Population"

/*
 * Denominator Exclusions
 * Patients in hospice or receiving palliative care
 */
define "Denominator Exclusions":
  exists(
    [Encounter: "Hospice Care"] HospiceEncounter
    where HospiceEncounter.status = 'finished'
      and HospiceEncounter.period overlaps "Measurement Period"
  )
  or exists(
    [Encounter: "Palliative Care Encounter"] PalliativeEncounter
    where PalliativeEncounter.status = 'finished'
      and PalliativeEncounter.period overlaps "Measurement Period"
  )

/*
 * Most Recent HbA1c Result
 * Get the most recent HbA1c test during the measurement period
 */
define "Most Recent HbA1c":
  Last(
    [Observation: "HbA1c Laboratory Test"] HbA1cTest
    where HbA1cTest.status in { 'final', 'amended', 'corrected' }
      and HbA1cTest.effective during "Measurement Period"
    sort by effective
  )

/*
 * Numerator
 * Patients with most recent HbA1c > 9% OR no HbA1c during measurement period
 * NOTE: This is an "inverse" measure - higher rate indicates poorer quality
 */
define "Numerator":
  "Most Recent HbA1c".value > 9 '%'
    or "Most Recent HbA1c" is null

/*
 * Numerator Exclusions
 * None for this measure
 */
define "Numerator Exclusions":
  false

/*
 * Stratification 1: Age 18-44
 */
define "Stratification 1":
  AgeInYearsAt(date from start of "Measurement Period") in Interval[18, 44]

/*
 * Stratification 2: Age 45-64
 */
define "Stratification 2":
  AgeInYearsAt(date from start of "Measurement Period") in Interval[45, 64]

/*
 * Stratification 3: Age 65-75
 */
define "Stratification 3":
  AgeInYearsAt(date from start of "Measurement Period") in Interval[65, 75]
