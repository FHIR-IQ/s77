/**
 * FHIR Schema Service
 * Provides field definitions for FHIR resources used in the Visual Query Builder
 * Based on FHIR R4 specification
 */

import type { Field, OptionGroup } from 'react-querybuilder';

// FHIR data types for field configuration
export type FhirDataType =
  | 'string'
  | 'code'
  | 'boolean'
  | 'date'
  | 'dateTime'
  | 'integer'
  | 'decimal'
  | 'Reference'
  | 'CodeableConcept'
  | 'Coding'
  | 'Period'
  | 'Quantity'
  | 'Age';

export interface FhirFieldDefinition {
  name: string;
  label: string;
  dataType: FhirDataType;
  path: string;
  description?: string;
  values?: Array<{ name: string; label: string }>;
  valueSetOid?: string;
}

export interface FhirResourceSchema {
  resourceType: string;
  label: string;
  description: string;
  fields: FhirFieldDefinition[];
}

// Common FHIR status values
const conditionClinicalStatusValues = [
  { name: 'active', label: 'Active' },
  { name: 'recurrence', label: 'Recurrence' },
  { name: 'relapse', label: 'Relapse' },
  { name: 'inactive', label: 'Inactive' },
  { name: 'remission', label: 'Remission' },
  { name: 'resolved', label: 'Resolved' },
];

const conditionVerificationStatusValues = [
  { name: 'unconfirmed', label: 'Unconfirmed' },
  { name: 'provisional', label: 'Provisional' },
  { name: 'differential', label: 'Differential' },
  { name: 'confirmed', label: 'Confirmed' },
  { name: 'refuted', label: 'Refuted' },
  { name: 'entered-in-error', label: 'Entered in Error' },
];

const encounterStatusValues = [
  { name: 'planned', label: 'Planned' },
  { name: 'arrived', label: 'Arrived' },
  { name: 'triaged', label: 'Triaged' },
  { name: 'in-progress', label: 'In Progress' },
  { name: 'onleave', label: 'On Leave' },
  { name: 'finished', label: 'Finished' },
  { name: 'cancelled', label: 'Cancelled' },
];

const encounterClassValues = [
  { name: 'AMB', label: 'Ambulatory' },
  { name: 'EMER', label: 'Emergency' },
  { name: 'IMP', label: 'Inpatient' },
  { name: 'OBSENC', label: 'Observation' },
  { name: 'HH', label: 'Home Health' },
  { name: 'VR', label: 'Virtual' },
];

const medicationRequestStatusValues = [
  { name: 'active', label: 'Active' },
  { name: 'on-hold', label: 'On Hold' },
  { name: 'cancelled', label: 'Cancelled' },
  { name: 'completed', label: 'Completed' },
  { name: 'entered-in-error', label: 'Entered in Error' },
  { name: 'stopped', label: 'Stopped' },
  { name: 'draft', label: 'Draft' },
];

const observationStatusValues = [
  { name: 'registered', label: 'Registered' },
  { name: 'preliminary', label: 'Preliminary' },
  { name: 'final', label: 'Final' },
  { name: 'amended', label: 'Amended' },
  { name: 'corrected', label: 'Corrected' },
  { name: 'cancelled', label: 'Cancelled' },
  { name: 'entered-in-error', label: 'Entered in Error' },
];

const genderValues = [
  { name: 'male', label: 'Male' },
  { name: 'female', label: 'Female' },
  { name: 'other', label: 'Other' },
  { name: 'unknown', label: 'Unknown' },
];

// FHIR Resource Schemas
export const FHIR_RESOURCE_SCHEMAS: Record<string, FhirResourceSchema> = {
  Patient: {
    resourceType: 'Patient',
    label: 'Patient',
    description: 'Demographics and administrative information about a patient',
    fields: [
      { name: 'id', label: 'Patient ID', dataType: 'string', path: 'Patient.id' },
      { name: 'gender', label: 'Gender', dataType: 'code', path: 'Patient.gender', values: genderValues },
      { name: 'birthDate', label: 'Birth Date', dataType: 'date', path: 'Patient.birthDate' },
      { name: 'deceasedBoolean', label: 'Is Deceased', dataType: 'boolean', path: 'Patient.deceased' },
      { name: 'deceasedDateTime', label: 'Deceased Date', dataType: 'dateTime', path: 'Patient.deceased' },
      { name: 'active', label: 'Active', dataType: 'boolean', path: 'Patient.active' },
    ],
  },

  Condition: {
    resourceType: 'Condition',
    label: 'Condition',
    description: 'Clinical condition, problem, diagnosis, or other event',
    fields: [
      { name: 'code', label: 'Condition Code', dataType: 'CodeableConcept', path: 'Condition.code' },
      { name: 'clinicalStatus', label: 'Clinical Status', dataType: 'code', path: 'Condition.clinicalStatus', values: conditionClinicalStatusValues },
      { name: 'verificationStatus', label: 'Verification Status', dataType: 'code', path: 'Condition.verificationStatus', values: conditionVerificationStatusValues },
      { name: 'onsetDateTime', label: 'Onset Date', dataType: 'dateTime', path: 'Condition.onset' },
      { name: 'abatementDateTime', label: 'Abatement Date', dataType: 'dateTime', path: 'Condition.abatement' },
      { name: 'recordedDate', label: 'Recorded Date', dataType: 'dateTime', path: 'Condition.recordedDate' },
      { name: 'category', label: 'Category', dataType: 'CodeableConcept', path: 'Condition.category' },
      { name: 'severity', label: 'Severity', dataType: 'CodeableConcept', path: 'Condition.severity' },
    ],
  },

  Encounter: {
    resourceType: 'Encounter',
    label: 'Encounter',
    description: 'An interaction during which services are provided to the patient',
    fields: [
      { name: 'status', label: 'Status', dataType: 'code', path: 'Encounter.status', values: encounterStatusValues },
      { name: 'class', label: 'Class', dataType: 'Coding', path: 'Encounter.class', values: encounterClassValues },
      { name: 'type', label: 'Type', dataType: 'CodeableConcept', path: 'Encounter.type' },
      { name: 'period.start', label: 'Start Date', dataType: 'dateTime', path: 'Encounter.period.start' },
      { name: 'period.end', label: 'End Date', dataType: 'dateTime', path: 'Encounter.period.end' },
      { name: 'reasonCode', label: 'Reason', dataType: 'CodeableConcept', path: 'Encounter.reasonCode' },
      { name: 'hospitalization.dischargeDisposition', label: 'Discharge Disposition', dataType: 'CodeableConcept', path: 'Encounter.hospitalization.dischargeDisposition' },
    ],
  },

  MedicationRequest: {
    resourceType: 'MedicationRequest',
    label: 'Medication Request',
    description: 'An order or request for medication supply and administration',
    fields: [
      { name: 'status', label: 'Status', dataType: 'code', path: 'MedicationRequest.status', values: medicationRequestStatusValues },
      { name: 'medicationCodeableConcept', label: 'Medication', dataType: 'CodeableConcept', path: 'MedicationRequest.medication' },
      { name: 'authoredOn', label: 'Authored On', dataType: 'dateTime', path: 'MedicationRequest.authoredOn' },
      { name: 'intent', label: 'Intent', dataType: 'code', path: 'MedicationRequest.intent' },
      { name: 'category', label: 'Category', dataType: 'CodeableConcept', path: 'MedicationRequest.category' },
      { name: 'dosageInstruction.timing', label: 'Timing', dataType: 'string', path: 'MedicationRequest.dosageInstruction.timing' },
    ],
  },

  Observation: {
    resourceType: 'Observation',
    label: 'Observation',
    description: 'Measurements and simple assertions about a patient',
    fields: [
      { name: 'status', label: 'Status', dataType: 'code', path: 'Observation.status', values: observationStatusValues },
      { name: 'code', label: 'Observation Code', dataType: 'CodeableConcept', path: 'Observation.code' },
      { name: 'effectiveDateTime', label: 'Effective Date', dataType: 'dateTime', path: 'Observation.effective' },
      { name: 'valueQuantity', label: 'Value (Quantity)', dataType: 'Quantity', path: 'Observation.value' },
      { name: 'valueCodeableConcept', label: 'Value (Code)', dataType: 'CodeableConcept', path: 'Observation.value' },
      { name: 'valueBoolean', label: 'Value (Boolean)', dataType: 'boolean', path: 'Observation.value' },
      { name: 'interpretation', label: 'Interpretation', dataType: 'CodeableConcept', path: 'Observation.interpretation' },
      { name: 'category', label: 'Category', dataType: 'CodeableConcept', path: 'Observation.category' },
    ],
  },

  Procedure: {
    resourceType: 'Procedure',
    label: 'Procedure',
    description: 'An action that is performed on or for a patient',
    fields: [
      { name: 'status', label: 'Status', dataType: 'code', path: 'Procedure.status' },
      { name: 'code', label: 'Procedure Code', dataType: 'CodeableConcept', path: 'Procedure.code' },
      { name: 'performedDateTime', label: 'Performed Date', dataType: 'dateTime', path: 'Procedure.performed' },
      { name: 'performedPeriod.start', label: 'Start Date', dataType: 'dateTime', path: 'Procedure.performed.start' },
      { name: 'performedPeriod.end', label: 'End Date', dataType: 'dateTime', path: 'Procedure.performed.end' },
      { name: 'category', label: 'Category', dataType: 'CodeableConcept', path: 'Procedure.category' },
      { name: 'outcome', label: 'Outcome', dataType: 'CodeableConcept', path: 'Procedure.outcome' },
    ],
  },

  Immunization: {
    resourceType: 'Immunization',
    label: 'Immunization',
    description: 'Immunization event information',
    fields: [
      { name: 'status', label: 'Status', dataType: 'code', path: 'Immunization.status' },
      { name: 'vaccineCode', label: 'Vaccine Code', dataType: 'CodeableConcept', path: 'Immunization.vaccineCode' },
      { name: 'occurrenceDateTime', label: 'Occurrence Date', dataType: 'dateTime', path: 'Immunization.occurrence' },
      { name: 'primarySource', label: 'Primary Source', dataType: 'boolean', path: 'Immunization.primarySource' },
      { name: 'doseQuantity', label: 'Dose', dataType: 'Quantity', path: 'Immunization.doseQuantity' },
    ],
  },

  AllergyIntolerance: {
    resourceType: 'AllergyIntolerance',
    label: 'Allergy/Intolerance',
    description: 'Allergy or Intolerance (generally a risk of adverse reaction)',
    fields: [
      { name: 'clinicalStatus', label: 'Clinical Status', dataType: 'CodeableConcept', path: 'AllergyIntolerance.clinicalStatus' },
      { name: 'verificationStatus', label: 'Verification Status', dataType: 'CodeableConcept', path: 'AllergyIntolerance.verificationStatus' },
      { name: 'type', label: 'Type', dataType: 'code', path: 'AllergyIntolerance.type' },
      { name: 'category', label: 'Category', dataType: 'code', path: 'AllergyIntolerance.category' },
      { name: 'criticality', label: 'Criticality', dataType: 'code', path: 'AllergyIntolerance.criticality' },
      { name: 'code', label: 'Allergen Code', dataType: 'CodeableConcept', path: 'AllergyIntolerance.code' },
      { name: 'onsetDateTime', label: 'Onset Date', dataType: 'dateTime', path: 'AllergyIntolerance.onset' },
    ],
  },

  DiagnosticReport: {
    resourceType: 'DiagnosticReport',
    label: 'Diagnostic Report',
    description: 'Diagnostic test results',
    fields: [
      { name: 'status', label: 'Status', dataType: 'code', path: 'DiagnosticReport.status' },
      { name: 'code', label: 'Report Code', dataType: 'CodeableConcept', path: 'DiagnosticReport.code' },
      { name: 'effectiveDateTime', label: 'Effective Date', dataType: 'dateTime', path: 'DiagnosticReport.effective' },
      { name: 'issued', label: 'Issued Date', dataType: 'dateTime', path: 'DiagnosticReport.issued' },
      { name: 'category', label: 'Category', dataType: 'CodeableConcept', path: 'DiagnosticReport.category' },
      { name: 'conclusion', label: 'Conclusion', dataType: 'string', path: 'DiagnosticReport.conclusion' },
    ],
  },
};

// Get all available resource types
export function getAvailableResourceTypes(): Array<{ value: string; label: string }> {
  return Object.values(FHIR_RESOURCE_SCHEMAS).map((schema) => ({
    value: schema.resourceType,
    label: schema.label,
  }));
}

// Get fields for a specific resource type (for react-querybuilder)
export function getFieldsForResource(resourceType: string): Field[] {
  const schema = FHIR_RESOURCE_SCHEMAS[resourceType];
  if (!schema) return [];

  return schema.fields.map((field) => {
    const baseField: Field = {
      name: field.name,
      label: field.label,
    };

    // Add input type based on data type
    switch (field.dataType) {
      case 'boolean':
        baseField.inputType = 'checkbox';
        baseField.valueEditorType = 'checkbox';
        break;
      case 'date':
      case 'dateTime':
        baseField.inputType = 'date';
        baseField.valueEditorType = 'text';
        break;
      case 'integer':
        baseField.inputType = 'number';
        baseField.valueEditorType = 'text';
        break;
      case 'decimal':
        baseField.inputType = 'number';
        baseField.valueEditorType = 'text';
        break;
      case 'code':
        if (field.values && field.values.length > 0) {
          baseField.valueEditorType = 'select';
          baseField.values = field.values;
        }
        break;
      case 'CodeableConcept':
      case 'Coding':
        // For CodeableConcept, we'll use text input for OID/code
        baseField.valueEditorType = 'text';
        baseField.placeholder = 'Enter code or OID';
        if (field.values && field.values.length > 0) {
          baseField.valueEditorType = 'select';
          baseField.values = field.values;
        }
        break;
      default:
        baseField.valueEditorType = 'text';
    }

    return baseField;
  });
}

// Get grouped fields for multiple resources
export function getFieldsForResources(resourceTypes: string[]): Field[] {
  const allFields: Field[] = [];

  resourceTypes.forEach((resourceType) => {
    const schema = FHIR_RESOURCE_SCHEMAS[resourceType];
    if (!schema) return;

    schema.fields.forEach((field) => {
      const fieldName = `${resourceType}.${field.name}`;
      const baseField: Field = {
        name: fieldName,
        label: `${schema.label}: ${field.label}`,
      };

      switch (field.dataType) {
        case 'boolean':
          baseField.inputType = 'checkbox';
          baseField.valueEditorType = 'checkbox';
          break;
        case 'date':
        case 'dateTime':
          baseField.inputType = 'date';
          baseField.valueEditorType = 'text';
          break;
        case 'code':
          if (field.values && field.values.length > 0) {
            baseField.valueEditorType = 'select';
            baseField.values = field.values;
          }
          break;
        default:
          baseField.valueEditorType = 'text';
      }

      allFields.push(baseField);
    });
  });

  return allFields;
}

// Get field option groups (for grouped dropdowns)
export function getFieldOptionGroups(resourceTypes: string[]): OptionGroup<Field>[] {
  return resourceTypes.map((resourceType) => {
    const schema = FHIR_RESOURCE_SCHEMAS[resourceType];
    if (!schema) return { label: resourceType, options: [] };

    return {
      label: schema.label,
      options: getFieldsForResource(resourceType).map((f) => ({
        ...f,
        name: `${resourceType}.${f.name}`,
      })),
    };
  });
}

// Get FHIR path from field name
export function getFhirPath(resourceType: string, fieldName: string): string {
  const schema = FHIR_RESOURCE_SCHEMAS[resourceType];
  if (!schema) return '';

  const field = schema.fields.find((f) => f.name === fieldName);
  return field?.path || `${resourceType}.${fieldName}`;
}

// Get field definition
export function getFieldDefinition(resourceType: string, fieldName: string): FhirFieldDefinition | undefined {
  const schema = FHIR_RESOURCE_SCHEMAS[resourceType];
  if (!schema) return undefined;

  return schema.fields.find((f) => f.name === fieldName);
}

// CQL operators for different data types
export const CQL_OPERATORS_BY_TYPE: Record<FhirDataType, Array<{ name: string; label: string }>> = {
  string: [
    { name: '=', label: 'equals' },
    { name: '!=', label: 'not equals' },
    { name: 'contains', label: 'contains' },
    { name: 'startsWith', label: 'starts with' },
    { name: 'endsWith', label: 'ends with' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  code: [
    { name: '=', label: 'equals' },
    { name: '!=', label: 'not equals' },
    { name: 'in', label: 'in value set' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  boolean: [
    { name: '=', label: 'is' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  date: [
    { name: '=', label: 'equals' },
    { name: '!=', label: 'not equals' },
    { name: '<', label: 'before' },
    { name: '>', label: 'after' },
    { name: '<=', label: 'on or before' },
    { name: '>=', label: 'on or after' },
    { name: 'during', label: 'during measurement period' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  dateTime: [
    { name: '=', label: 'equals' },
    { name: '!=', label: 'not equals' },
    { name: '<', label: 'before' },
    { name: '>', label: 'after' },
    { name: '<=', label: 'on or before' },
    { name: '>=', label: 'on or after' },
    { name: 'during', label: 'during measurement period' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  integer: [
    { name: '=', label: 'equals' },
    { name: '!=', label: 'not equals' },
    { name: '<', label: 'less than' },
    { name: '>', label: 'greater than' },
    { name: '<=', label: 'less than or equal' },
    { name: '>=', label: 'greater than or equal' },
    { name: 'between', label: 'between' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  decimal: [
    { name: '=', label: 'equals' },
    { name: '!=', label: 'not equals' },
    { name: '<', label: 'less than' },
    { name: '>', label: 'greater than' },
    { name: '<=', label: 'less than or equal' },
    { name: '>=', label: 'greater than or equal' },
    { name: 'between', label: 'between' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  Reference: [
    { name: '=', label: 'references' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  CodeableConcept: [
    { name: '~', label: 'equivalent to' },
    { name: 'in', label: 'in value set' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  Coding: [
    { name: '~', label: 'equivalent to' },
    { name: 'in', label: 'in value set' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  Period: [
    { name: 'overlaps', label: 'overlaps' },
    { name: 'during', label: 'during' },
    { name: 'includes', label: 'includes' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  Quantity: [
    { name: '=', label: 'equals' },
    { name: '!=', label: 'not equals' },
    { name: '<', label: 'less than' },
    { name: '>', label: 'greater than' },
    { name: '<=', label: 'less than or equal' },
    { name: '>=', label: 'greater than or equal' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
  Age: [
    { name: '=', label: 'equals' },
    { name: '!=', label: 'not equals' },
    { name: '<', label: 'less than' },
    { name: '>', label: 'greater than' },
    { name: '<=', label: 'less than or equal' },
    { name: '>=', label: 'greater than or equal' },
    { name: 'between', label: 'between' },
    { name: 'is null', label: 'is null' },
    { name: 'is not null', label: 'is not null' },
  ],
};

// Get operators for a field
export function getOperatorsForField(resourceType: string, fieldName: string): Array<{ name: string; label: string }> {
  const field = getFieldDefinition(resourceType, fieldName);
  if (!field) {
    return CQL_OPERATORS_BY_TYPE.string;
  }
  return CQL_OPERATORS_BY_TYPE[field.dataType] || CQL_OPERATORS_BY_TYPE.string;
}
