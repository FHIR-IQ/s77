import {
    getAvailableResourceTypes,
    getFieldsForResource,
    getFhirPath,
    getFieldDefinition,
    FHIR_RESOURCE_SCHEMAS
} from '../fhir-schema-service';

describe('FHIR Schema Service', () => {
    describe('getAvailableResourceTypes', () => {
        it('should return list of available resources', () => {
            const resources = getAvailableResourceTypes();
            expect(resources.length).toBeGreaterThan(0);
            expect(resources.find(r => r.value === 'Patient')).toBeDefined();
        });
    });

    describe('getFieldsForResource', () => {
        it('should return fields for Patient', () => {
            const fields = getFieldsForResource('Patient');
            expect(fields).toBeDefined();
            expect(fields.length).toBeGreaterThan(0);
            expect(fields.find(f => f.name === 'gender')).toBeDefined();
        });

        it('should return empty array for unknown resource', () => {
            const fields = getFieldsForResource('UnknownResource');
            expect(fields).toEqual([]);
        });

        it('should set correct input types', () => {
            const fields = getFieldsForResource('Patient');
            const birthDate = fields.find(f => f.name === 'birthDate');
            expect(birthDate?.inputType).toBe('date');

            const gender = fields.find(f => f.name === 'gender');
            expect(gender?.valueEditorType).toBe('select');
        });
    });

    describe('getFhirPath', () => {
        it('should return correct path for known field', () => {
            expect(getFhirPath('Patient', 'gender')).toBe('Patient.gender');
        });

        it('should return default path for unknown field', () => {
            expect(getFhirPath('Patient', 'unknown')).toBe('Patient.unknown');
        });
    });

    describe('getFieldDefinition', () => {
        it('should return definition for known field', () => {
            const def = getFieldDefinition('Patient', 'gender');
            expect(def).toBeDefined();
            expect(def?.dataType).toBe('code');
        });

        it('should return undefined for unknown resource', () => {
            expect(getFieldDefinition('Unknown', 'field')).toBeUndefined();
        });
    });
});
