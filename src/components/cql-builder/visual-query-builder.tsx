'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import QueryBuilder, {
  type RuleGroupType,
  type Field,
  formatQuery,
  defaultOperators,
} from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Code2,
  Eye,
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Settings2,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FHIR_RESOURCE_SCHEMAS,
  getFieldsForResource,
  getAvailableResourceTypes,
  CQL_OPERATORS_BY_TYPE,
  type FhirDataType,
} from '@/lib/fhir-schema-service';
import {
  queryBuilderToCQL,
  generateCompleteMeasure,
  type CQLTransformOptions,
} from '@/lib/query-builder-to-cql';

interface VisualQueryBuilderProps {
  onCQLGenerated: (cql: string) => void;
  initialQuery?: RuleGroupType;
  className?: string;
}

// Default empty query
const defaultQuery: RuleGroupType = {
  combinator: 'and',
  rules: [],
};

// Custom operators for CQL
const cqlOperators = [
  { name: '=', label: '=' },
  { name: '!=', label: '!=' },
  { name: '<', label: '<' },
  { name: '>', label: '>' },
  { name: '<=', label: '<=' },
  { name: '>=', label: '>=' },
  { name: 'contains', label: 'contains' },
  { name: 'in', label: 'in value set' },
  { name: 'during', label: 'during measurement period' },
  { name: 'is null', label: 'is null' },
  { name: 'is not null', label: 'is not null' },
  { name: '~', label: 'equivalent to (~)' },
  { name: 'between', label: 'between' },
];

export function VisualQueryBuilder({
  onCQLGenerated,
  initialQuery,
  className,
}: VisualQueryBuilderProps) {
  // State
  const [selectedResources, setSelectedResources] = useState<string[]>(['Patient', 'Condition']);
  const [query, setQuery] = useState<RuleGroupType>(initialQuery || defaultQuery);
  const [denominatorQuery, setDenominatorQuery] = useState<RuleGroupType>(defaultQuery);
  const [numeratorQuery, setNumeratorQuery] = useState<RuleGroupType>(defaultQuery);
  const [showDenominator, setShowDenominator] = useState(false);
  const [showNumerator, setShowNumerator] = useState(false);
  const [previewCQL, setPreviewCQL] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [transformWarnings, setTransformWarnings] = useState<string[]>([]);

  // Options
  const [libraryName, setLibraryName] = useState('GeneratedMeasure');
  const [libraryVersion, setLibraryVersion] = useState('1.0.0');
  const [valueSets, setValueSets] = useState<Array<{ name: string; oid: string }>>([]);

  // Available resource types
  const availableResources = useMemo(() => getAvailableResourceTypes(), []);

  // Build fields based on selected resources
  const fields: Field[] = useMemo(() => {
    const allFields: Field[] = [];

    selectedResources.forEach((resourceType) => {
      const resourceFields = getFieldsForResource(resourceType);
      resourceFields.forEach((field) => {
        allFields.push({
          ...field,
          name: `${resourceType}.${field.name}`,
          label: `${FHIR_RESOURCE_SCHEMAS[resourceType]?.label || resourceType}: ${field.label}`,
        });
      });
    });

    return allFields;
  }, [selectedResources]);

  // Generate CQL preview
  const updatePreview = useCallback(() => {
    const options: CQLTransformOptions = {
      libraryName,
      libraryVersion,
      resourceTypes: selectedResources,
      valueSets,
      includeComments: true,
      measurementPeriodParam: true,
    };

    let cql: string;
    let warnings: string[] = [];

    if (showDenominator || showNumerator) {
      // Generate complete measure
      cql = generateCompleteMeasure(
        query,
        showDenominator ? denominatorQuery : undefined,
        showNumerator ? numeratorQuery : undefined,
        options
      );
    } else {
      // Generate simple query
      const result = queryBuilderToCQL(query, options);
      cql = result.cql;
      warnings = result.warnings;
    }

    setPreviewCQL(cql);
    setTransformWarnings(warnings);
  }, [query, denominatorQuery, numeratorQuery, showDenominator, showNumerator, libraryName, libraryVersion, selectedResources, valueSets]);

  // Update preview when query changes
  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  // Toggle resource selection
  const toggleResource = (resourceType: string) => {
    setSelectedResources((prev) =>
      prev.includes(resourceType)
        ? prev.filter((r) => r !== resourceType)
        : [...prev, resourceType]
    );
  };

  // Apply CQL to editor
  const handleApplyCQL = () => {
    onCQLGenerated(previewCQL);
  };

  // Copy CQL to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewCQL);
  };

  // Add value set
  const addValueSet = () => {
    setValueSets([...valueSets, { name: '', oid: '' }]);
  };

  // Update value set
  const updateValueSet = (index: number, field: 'name' | 'oid', value: string) => {
    const updated = [...valueSets];
    updated[index][field] = value;
    setValueSets(updated);
  };

  // Remove value set
  const removeValueSet = (index: number) => {
    setValueSets(valueSets.filter((_, i) => i !== index));
  };

  // Custom styles for the query builder
  const queryBuilderClassNames = {
    queryBuilder: 'qb-container',
    ruleGroup: 'qb-group bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 my-2',
    combinators: 'qb-combinators',
    addRule: 'qb-add-rule',
    addGroup: 'qb-add-group',
    removeGroup: 'qb-remove-group',
    rule: 'qb-rule bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded p-2 my-1 flex items-center gap-2 flex-wrap',
    fields: 'qb-fields',
    operators: 'qb-operators',
    value: 'qb-value',
    removeRule: 'qb-remove-rule',
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Resource Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            FHIR Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableResources.map((resource) => (
              <Badge
                key={resource.value}
                variant={selectedResources.includes(resource.value) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => toggleResource(resource.value)}
              >
                {resource.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      <Card>
        <CardHeader
          className="pb-2 cursor-pointer"
          onClick={() => setShowSettings(!showSettings)}
        >
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Library Settings
            </div>
            {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardTitle>
        </CardHeader>
        {showSettings && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Library Name</label>
                <Input
                  value={libraryName}
                  onChange={(e) => setLibraryName(e.target.value)}
                  placeholder="MyMeasure"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Version</label>
                <Input
                  value={libraryVersion}
                  onChange={(e) => setLibraryVersion(e.target.value)}
                  placeholder="1.0.0"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Value Sets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">Value Sets</label>
                <Button size="sm" variant="outline" onClick={addValueSet}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              {valueSets.map((vs, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    value={vs.name}
                    onChange={(e) => updateValueSet(idx, 'name', e.target.value)}
                    placeholder="Value Set Name"
                    className="flex-1"
                  />
                  <Input
                    value={vs.oid}
                    onChange={(e) => updateValueSet(idx, 'oid', e.target.value)}
                    placeholder="OID (e.g., 2.16.840.1.113883...)"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeValueSet(idx)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Initial Population Query Builder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-500" />
            Initial Population
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QueryBuilder
            fields={fields}
            query={query}
            onQueryChange={setQuery}
            operators={cqlOperators}
            controlClassnames={queryBuilderClassNames}
            showCombinatorsBetweenRules
            showNotToggle
            addRuleToNewGroups
            resetOnFieldChange={false}
          />
        </CardContent>
      </Card>

      {/* Optional Population Sections */}
      <div className="flex gap-2">
        <Button
          variant={showDenominator ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowDenominator(!showDenominator)}
        >
          {showDenominator ? 'Hide' : 'Add'} Denominator
        </Button>
        <Button
          variant={showNumerator ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowNumerator(!showNumerator)}
        >
          {showNumerator ? 'Hide' : 'Add'} Numerator
        </Button>
      </div>

      {/* Denominator Query Builder */}
      {showDenominator && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4 text-green-500" />
              Denominator (additional criteria)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QueryBuilder
              fields={fields}
              query={denominatorQuery}
              onQueryChange={setDenominatorQuery}
              operators={cqlOperators}
              controlClassnames={queryBuilderClassNames}
              showCombinatorsBetweenRules
              showNotToggle
            />
          </CardContent>
        </Card>
      )}

      {/* Numerator Query Builder */}
      {showNumerator && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-500" />
              Numerator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QueryBuilder
              fields={fields}
              query={numeratorQuery}
              onQueryChange={setNumeratorQuery}
              operators={cqlOperators}
              controlClassnames={queryBuilderClassNames}
              showCombinatorsBetweenRules
              showNotToggle
            />
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {transformWarnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Transformation Warnings</p>
                <ul className="text-xs text-amber-700 mt-1">
                  {transformWarnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CQL Preview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-sm flex items-center gap-2 cursor-pointer"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4" />
              CQL Preview
              {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={updatePreview}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {showPreview && (
          <CardContent>
            <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs max-h-[400px] overflow-y-auto font-mono">
              <code>{previewCQL || '// Build your query above to see CQL'}</code>
            </pre>
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button
          onClick={handleApplyCQL}
          className="bg-clinical hover:bg-clinical-dark"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Apply to Code Editor
        </Button>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .qb-container {
          font-size: 0.875rem;
        }
        .qb-group > .ruleGroup-header {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .qb-group > .ruleGroup-header select {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .qb-group > .ruleGroup-header button {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          cursor: pointer;
        }
        .qb-group > .ruleGroup-header button:hover {
          background: #e2e8f0;
        }
        .qb-rule select,
        .qb-rule input {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #e2e8f0;
          font-size: 0.75rem;
        }
        .qb-rule select {
          min-width: 150px;
        }
        .qb-rule input {
          min-width: 120px;
        }
        .qb-rule button {
          padding: 0.25rem;
          border-radius: 0.25rem;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #ef4444;
        }
        .qb-rule button:hover {
          background: #fef2f2;
        }
        .rule-remove::before {
          content: '×';
          font-size: 1rem;
        }
        .ruleGroup-addRule::before {
          content: '+ Rule';
        }
        .ruleGroup-addGroup::before {
          content: '+ Group';
        }
        .dark .qb-group {
          background: #1e293b;
          border-color: #334155;
        }
        .dark .qb-rule {
          background: #0f172a;
          border-color: #1e293b;
        }
        .dark .qb-group > .ruleGroup-header select,
        .dark .qb-group > .ruleGroup-header button,
        .dark .qb-rule select,
        .dark .qb-rule input {
          background: #1e293b;
          border-color: #334155;
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}

export default VisualQueryBuilder;
