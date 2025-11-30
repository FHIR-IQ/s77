import { queryBuilderToCQL } from '../query-builder-to-cql';
import type { RuleGroupType } from 'react-querybuilder';

describe('Query Builder to CQL', () => {
    it('should generate basic patient query', () => {
        const query: RuleGroupType = {
            combinator: 'and',
            rules: [
                { field: 'gender', operator: '=', value: 'male' },
                { field: 'birthDate', operator: '<', value: '1980-01-01' }
            ]
        };

        const result = queryBuilderToCQL(query, { libraryName: 'TestLib' });

        expect(result.cql).toContain('library TestLib');
        expect(result.cql).toContain('define "Initial Population":');
        expect(result.cql).toContain('Patient.gender = \'male\'');
        expect(result.cql).toContain('Patient.birthDate < @1980-01-01');
    });

    it('should handle nested groups', () => {
        const query: RuleGroupType = {
            combinator: 'and',
            rules: [
                { field: 'gender', operator: '=', value: 'female' },
                {
                    combinator: 'or',
                    rules: [
                        { field: 'active', operator: '=', value: true },
                        { field: 'deceasedBoolean', operator: '=', value: false }
                    ]
                }
            ]
        };

        const result = queryBuilderToCQL(query);
        expect(result.cql).toContain('Patient.gender = \'female\'');
        expect(result.cql).toContain('and');
        expect(result.cql).toContain('or');
        expect(result.cql).toContain('Patient.active = true');
    });

    it('should handle resource retrieves', () => {
        const query: RuleGroupType = {
            combinator: 'and',
            rules: [
                { field: 'Condition.code', operator: 'in', value: 'Diabetes' }
            ]
        };

        const result = queryBuilderToCQL(query, {
            resourceTypes: ['Condition'],
            valueSets: [{ name: 'Diabetes', oid: '1.2.3' }]
        });

        expect(result.cql).toContain('valueset "Diabetes": \'1.2.3\'');
        expect(result.cql).toContain('define "Conditions":\n  [Condition]');
        expect(result.cql).toContain('exists([Condition] C where C.code in "Diabetes")');
    });
});
