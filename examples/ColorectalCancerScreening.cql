/*
 * Example: Colorectal Cancer Screening Measure
 * Based on CMS130 - Colorectal Cancer Screening
 *
 * Purpose: Measure the percentage of adults who receive appropriate
 *          colorectal cancer screening
 * Problem: Colorectal cancer is the third most common cancer; early
 *          detection through screening significantly improves outcomes
 * Type: Clinical Quality Measure (eCQM) - Proportion
 *
 * This is a reference implementation for the CQL Builder
 * Based on HL7 CQL v1.5.3 and CQF Measures IG
 */
library ColorectalCancerScreening version '1.0.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers
include SupplementalDataElements version '3.0.0' called SDE
include QICoreCommon version '2.0.0' called QICoreCommon

// Value Sets - Encounters
valueset "Office Visit": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1001'
valueset "Annual Wellness Visit": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.526.3.1240'
valueset "Preventive Care Services - Established Office Visit, 18 and Up": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1025'

// Value Sets - Screening Procedures
valueset "Colonoscopy": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1020'
valueset "Flexible Sigmoidoscopy": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1010'
valueset "CT Colonography": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1038'

// Value Sets - Lab Tests
valueset "Fecal Occult Blood Test (FOBT)": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1011'
valueset "FIT-DNA Test": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1039'
valueset "Fecal Immunochemical Test (FIT)": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1019'

// Value Sets - Exclusions
valueset "Colorectal Cancer": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.108.12.1001'
valueset "Total Colectomy": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1019'
valueset "Hospice Care": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.1165'

// Measurement Period Parameter
parameter "Measurement Period" Interval<DateTime>
  default Interval[@2024-01-01T00:00:00.0, @2025-01-01T00:00:00.0)

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

// Helper: Qualifying Encounters
define "Qualifying Encounters":
  (
    [Encounter: "Office Visit"]
    union [Encounter: "Annual Wellness Visit"]
    union [Encounter: "Preventive Care Services - Established Office Visit, 18 and Up"]
  ) ValidEncounter
  where ValidEncounter.status = 'finished'
    and ValidEncounter.period during "Measurement Period"

/*
 * Initial Population
 * Adults aged 45-75 with a qualifying encounter
 * Note: Age lowered to 45 per updated USPSTF guidelines
 */
define "Initial Population":
  AgeInYearsAt(date from start of "Measurement Period") in Interval[45, 75]
    and exists("Qualifying Encounters")

/*
 * Denominator
 * Equals Initial Population
 */
define "Denominator":
  "Initial Population"

/*
 * Denominator Exclusions
 * Patients with colorectal cancer, total colectomy, or in hospice
 */
define "Denominator Exclusions":
  // History of colorectal cancer
  exists(
    [Condition: "Colorectal Cancer"] CRCDx
    where CRCDx.clinicalStatus ~ QICoreCommon."active"
  )
  // Prior total colectomy
  or exists(
    [Procedure: "Total Colectomy"] Colectomy
    where Colectomy.status = 'completed'
      and Colectomy.performed before end of "Measurement Period"
  )
  // Hospice care
  or exists(
    [Encounter: "Hospice Care"] HospiceEncounter
    where HospiceEncounter.status = 'finished'
      and HospiceEncounter.period overlaps "Measurement Period"
  )

/*
 * Colonoscopy in Past 10 Years
 */
define "Colonoscopy Performed":
  [Procedure: "Colonoscopy"] Colonoscopy
  where Colonoscopy.status = 'completed'
    and Colonoscopy.performed ends 10 years or less before end of "Measurement Period"

/*
 * Flexible Sigmoidoscopy in Past 5 Years
 */
define "Flexible Sigmoidoscopy Performed":
  [Procedure: "Flexible Sigmoidoscopy"] Sigmoidoscopy
  where Sigmoidoscopy.status = 'completed'
    and Sigmoidoscopy.performed ends 5 years or less before end of "Measurement Period"

/*
 * CT Colonography in Past 5 Years
 */
define "CT Colonography Performed":
  [Procedure: "CT Colonography"] CTColonography
  where CTColonography.status = 'completed'
    and CTColonography.performed ends 5 years or less before end of "Measurement Period"

/*
 * FOBT/FIT During Measurement Period
 */
define "FOBT or FIT Performed":
  (
    [Observation: "Fecal Occult Blood Test (FOBT)"]
    union [Observation: "Fecal Immunochemical Test (FIT)"]
  ) FOBTTest
  where FOBTTest.status in { 'final', 'amended', 'corrected' }
    and FOBTTest.effective during "Measurement Period"
    and FOBTTest.value is not null

/*
 * FIT-DNA in Past 3 Years
 */
define "FIT DNA Performed":
  [Observation: "FIT-DNA Test"] FITDNA
  where FITDNA.status in { 'final', 'amended', 'corrected' }
    and FITDNA.effective 3 years or less before end of "Measurement Period"
    and FITDNA.value is not null

/*
 * Numerator
 * Patients who had appropriate colorectal cancer screening
 */
define "Numerator":
  exists("Colonoscopy Performed")
    or exists("Flexible Sigmoidoscopy Performed")
    or exists("CT Colonography Performed")
    or exists("FOBT or FIT Performed")
    or exists("FIT DNA Performed")

/*
 * Numerator Exclusions
 * None for this measure
 */
define "Numerator Exclusions":
  false

/*
 * Stratification by Age Group
 */
define "Stratification 1 - Age 45-49":
  AgeInYearsAt(date from start of "Measurement Period") in Interval[45, 49]

define "Stratification 2 - Age 50-64":
  AgeInYearsAt(date from start of "Measurement Period") in Interval[50, 64]

define "Stratification 3 - Age 65-75":
  AgeInYearsAt(date from start of "Measurement Period") in Interval[65, 75]
