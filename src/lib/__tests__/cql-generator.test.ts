import {
    generateLibraryName,
    formatValueSets,
    generateMeasurementPeriod,
    createBasicTemplate,
    postProcessCQL
} from '../cql-generator';

describe('CQL Generator', () => {
    describe('generateLibraryName', () => {
        it('should generate a valid library name from purpose', () => {
            const purpose = 'Screening for Depression in Adolescents';
            const expected = 'ScreeningForDepressionIn';
            expect(generateLibraryName(purpose)).toBe(expected);
        });

        it('should handle special characters', () => {
            const purpose = 'Test: Measure & Check';
            const expected = 'TestMeasureCheck';
            expect(generateLibraryName(purpose)).toBe(expected);
        });
    });

    describe('formatValueSets', () => {
        it('should format value sets correctly', () => {
            const valueSets = [
                { name: 'Diabetes', oid: '2.16.840.1.113883.3.464.1003.103.12.1001' },
                { name: 'HbA1c Test', oid: '2.16.840.1.113883.3.464.1003.198.12.1013' }
            ];
            const result = formatValueSets(valueSets);
            expect(result).toContain('valueset "Diabetes": \'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.103.12.1001\'');
            expect(result).toContain('valueset "HbA1c Test": \'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.12.1013\'');
        });
    });

    describe('generateMeasurementPeriod', () => {
        it('should generate measurement period for current year by default', () => {
            const currentYear = new Date().getFullYear();
            const result = generateMeasurementPeriod();
            expect(result).toContain(`default Interval[@${currentYear}-01-01T00:00:00.0, @${currentYear + 1}-01-01T00:00:00.0)`);
        });

        it('should generate measurement period for specific year', () => {
            const result = generateMeasurementPeriod(2023);
            expect(result).toContain('default Interval[@2023-01-01T00:00:00.0, @2024-01-01T00:00:00.0)');
        });
    });

    describe('createBasicTemplate', () => {
        it('should create a basic template with library name', () => {
            const requirements = {
                purpose: 'Test Measure',
                scoringType: 'proportion' as const
            };
            const result = createBasicTemplate(requirements);
            expect(result).toContain('library TestMeasure version \'1.0.0\'');
            expect(result).toContain('using FHIR version \'4.0.1\'');
        });

        it('should include value sets if provided', () => {
            const requirements = {
                purpose: 'Test Measure',
                valueSets: [{ name: 'Test VS', oid: '1.2.3' }]
            };
            const result = createBasicTemplate(requirements);
            expect(result).toContain('valueset "Test VS": \'http://cts.nlm.nih.gov/fhir/ValueSet/1.2.3\'');
        });
    });

    describe('postProcessCQL', () => {
        it('should remove markdown code blocks', () => {
            const cql = '```cql\nlibrary Test\n```';
            expect(postProcessCQL(cql)).toBe('library Test');
        });

        it('should ensure library declaration is first', () => {
            const cql = 'using FHIR version \'4.0.1\'\nlibrary Test version \'1.0.0\'';
            const result = postProcessCQL(cql);
            expect(result.startsWith('library Test version \'1.0.0\'')).toBe(true);
        });
    });
});
