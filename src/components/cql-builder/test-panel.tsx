'use client';

import { useState, useCallback, useRef } from 'react';
import { useTestStore, SAMPLE_TEST_CASES, type TestCase, type FhirBundle, type FhirResource } from '@/lib/test-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Plus,
  Trash2,
  Copy,
  Upload,
  Download,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  FileJson,
  User,
  Stethoscope,
  Pill,
  Activity,
  Calendar,
  Loader2,
  TestTube,
  PanelRightClose,
  PanelRight,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestPanelProps {
  elm: unknown | null;
  onExecute?: (testCase: TestCase) => Promise<void>;
  className?: string;
}

export function TestPanel({ elm, onExecute, className }: TestPanelProps) {
  const {
    testCases,
    activeTestCaseId,
    isExecuting,
    lastExecutionResult,
    isPanelOpen,
    activeTab,
    setActiveTestCase,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    duplicateTestCase,
    importTestCase,
    exportTestCase,
    setExecuting,
    addExecutionResult,
    togglePanel,
    setActiveTab,
    createEmptyPatientBundle,
  } = useTestStore();

  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['patient']));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTestCase = testCases.find((tc) => tc.id === activeTestCaseId);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Create new test case
  const handleCreateTestCase = useCallback(() => {
    const patientBundle = createEmptyPatientBundle(`patient-${Date.now()}`);
    addTestCase({
      name: `Test Case ${testCases.length + 1}`,
      patientBundle,
    });
    setActiveTab('builder');
  }, [addTestCase, createEmptyPatientBundle, testCases.length, setActiveTab]);

  // Load sample test cases
  const handleLoadSamples = useCallback(() => {
    SAMPLE_TEST_CASES.forEach((sample) => {
      addTestCase(sample);
    });
  }, [addTestCase]);

  // Import from JSON
  const handleImportJson = useCallback(() => {
    setImportError(null);
    const result = importTestCase(jsonInput);
    if (result.success) {
      setJsonInput('');
      setActiveTab('cases');
    } else {
      setImportError(result.error || 'Import failed');
    }
  }, [importTestCase, jsonInput, setActiveTab]);

  // Import from file
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
      setActiveTab('json');
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [setActiveTab]);

  // Export test case
  const handleExport = useCallback((id: string) => {
    const json = exportTestCase(id);
    if (!json) return;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-case-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportTestCase]);

  // Execute test case
  const handleExecute = useCallback(async (testCase: TestCase) => {
    if (!elm) {
      alert('No ELM available. Please compile your CQL first.');
      return;
    }

    setExecuting(true);

    try {
      // Simulate execution (in production, this would use the web worker)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create mock result
      const result = {
        testCaseId: testCase.id,
        success: true,
        results: {
          'Initial Population': {
            name: 'Initial Population',
            value: true,
            formattedValue: 'true',
            type: 'Boolean',
            passed: testCase.expectedResults?.['Initial Population']
              ? true === testCase.expectedResults['Initial Population'].expectedValue
              : undefined,
            expected: testCase.expectedResults?.['Initial Population']?.expectedValue,
          },
          'Denominator': {
            name: 'Denominator',
            value: true,
            formattedValue: 'true',
            type: 'Boolean',
          },
          'Numerator': {
            name: 'Numerator',
            value: false,
            formattedValue: 'false',
            type: 'Boolean',
          },
        },
        executionTime: 234,
        timestamp: new Date().toISOString(),
      };

      addExecutionResult(result);
      setActiveTab('results');

      if (onExecute) {
        await onExecute(testCase);
      }
    } catch (error) {
      addExecutionResult({
        testCaseId: testCase.id,
        success: false,
        results: {},
        executionTime: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Execution failed',
      });
    } finally {
      setExecuting(false);
    }
  }, [elm, setExecuting, addExecutionResult, setActiveTab, onExecute]);

  // Render resource icon
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'Patient':
        return <User className="w-4 h-4" />;
      case 'Condition':
        return <Stethoscope className="w-4 h-4" />;
      case 'MedicationRequest':
        return <Pill className="w-4 h-4" />;
      case 'Observation':
        return <Activity className="w-4 h-4" />;
      case 'Encounter':
        return <Calendar className="w-4 h-4" />;
      default:
        return <FileJson className="w-4 h-4" />;
    }
  };

  // Render test case list
  const renderTestCaseList = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Test Cases ({testCases.length})</h3>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={handleCreateTestCase}>
            <Plus className="w-3 h-3 mr-1" /> New
          </Button>
          {testCases.length === 0 && (
            <Button size="sm" variant="outline" onClick={handleLoadSamples}>
              Load Samples
            </Button>
          )}
        </div>
      </div>

      {testCases.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <TestTube className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No test cases yet</p>
          <p className="text-xs mt-1">Create one or load sample cases</p>
        </div>
      ) : (
        <div className="space-y-2">
          {testCases.map((tc) => (
            <div
              key={tc.id}
              className={cn(
                'p-3 rounded-lg border cursor-pointer transition-colors',
                activeTestCaseId === tc.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              )}
              onClick={() => setActiveTestCase(tc.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{tc.name}</p>
                  {tc.description && (
                    <p className="text-xs text-muted-foreground truncate">{tc.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {tc.patientBundle.entry?.length || 0} resources
                    </Badge>
                    {tc.expectedResults && Object.keys(tc.expectedResults).length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {Object.keys(tc.expectedResults).length} assertions
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExecute(tc);
                    }}
                    disabled={isExecuting || !elm}
                    title="Run test"
                  >
                    {isExecuting && activeTestCaseId === tc.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateTestCase(tc.id);
                    }}
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(tc.id);
                    }}
                    title="Export"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this test case?')) {
                        deleteTestCase(tc.id);
                      }
                    }}
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render patient builder
  const renderPatientBuilder = () => {
    if (!activeTestCase) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a test case to edit</p>
        </div>
      );
    }

    const bundle = activeTestCase.patientBundle;
    const patient = bundle.entry?.find((e) => e.resource.resourceType === 'Patient')?.resource;
    const conditions = bundle.entry?.filter((e) => e.resource.resourceType === 'Condition') || [];
    const medications = bundle.entry?.filter((e) => e.resource.resourceType === 'MedicationRequest') || [];
    const observations = bundle.entry?.filter((e) => e.resource.resourceType === 'Observation') || [];
    const encounters = bundle.entry?.filter((e) => e.resource.resourceType === 'Encounter') || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            value={activeTestCase.name}
            onChange={(e) => updateTestCase(activeTestCase.id, { name: e.target.value })}
            className="font-medium"
            placeholder="Test case name"
          />
        </div>

        <Input
          value={activeTestCase.description || ''}
          onChange={(e) => updateTestCase(activeTestCase.id, { description: e.target.value })}
          placeholder="Description (optional)"
          className="text-sm"
        />

        {/* Patient section */}
        <div className="border rounded-lg">
          <button
            className="flex items-center justify-between w-full p-3 text-left"
            onClick={() => toggleSection('patient')}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">Patient</span>
            </div>
            {expandedSections.has('patient') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedSections.has('patient') && patient && (
            <div className="px-3 pb-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Given Name</label>
                  <Input
                    value={(patient as FhirResource & { name?: Array<{ given?: string[] }> }).name?.[0]?.given?.[0] || ''}
                    onChange={() => {
                      // TODO: Implement patient update via updateTestCase
                    }}
                    placeholder="First name"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Family Name</label>
                  <Input
                    value={(patient as FhirResource & { name?: Array<{ family?: string }> }).name?.[0]?.family || ''}
                    onChange={() => {
                      // TODO: Implement patient update via updateTestCase
                    }}
                    placeholder="Last name"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Birth Date</label>
                  <Input
                    type="date"
                    value={(patient as FhirResource & { birthDate?: string }).birthDate || ''}
                    onChange={() => {
                      // TODO: Implement patient update via updateTestCase
                    }}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Gender</label>
                  <select
                    className="w-full h-9 px-3 rounded-md border text-sm"
                    value={(patient as FhirResource & { gender?: string }).gender || 'unknown'}
                    onChange={() => {
                      // TODO: Implement patient update via updateTestCase
                    }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conditions section */}
        <div className="border rounded-lg">
          <button
            className="flex items-center justify-between w-full p-3 text-left"
            onClick={() => toggleSection('conditions')}
          >
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span className="font-medium text-sm">Conditions</span>
              <Badge variant="secondary" className="text-xs">{conditions.length}</Badge>
            </div>
            {expandedSections.has('conditions') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedSections.has('conditions') && (
            <div className="px-3 pb-3 space-y-2">
              {conditions.map((entry, idx) => (
                <div key={idx} className="p-2 bg-muted/50 rounded text-xs">
                  {(entry.resource as { code?: { coding?: Array<{ display?: string }> } }).code?.coding?.[0]?.display || 'Unknown condition'}
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full">
                <Plus className="w-3 h-3 mr-1" /> Add Condition
              </Button>
            </div>
          )}
        </div>

        {/* Medications section */}
        <div className="border rounded-lg">
          <button
            className="flex items-center justify-between w-full p-3 text-left"
            onClick={() => toggleSection('medications')}
          >
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              <span className="font-medium text-sm">Medications</span>
              <Badge variant="secondary" className="text-xs">{medications.length}</Badge>
            </div>
            {expandedSections.has('medications') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedSections.has('medications') && (
            <div className="px-3 pb-3 space-y-2">
              {medications.map((entry, idx) => (
                <div key={idx} className="p-2 bg-muted/50 rounded text-xs">
                  {(entry.resource as { medicationCodeableConcept?: { coding?: Array<{ display?: string }> } }).medicationCodeableConcept?.coding?.[0]?.display || 'Unknown medication'}
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full">
                <Plus className="w-3 h-3 mr-1" /> Add Medication
              </Button>
            </div>
          )}
        </div>

        {/* Encounters section */}
        <div className="border rounded-lg">
          <button
            className="flex items-center justify-between w-full p-3 text-left"
            onClick={() => toggleSection('encounters')}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium text-sm">Encounters</span>
              <Badge variant="secondary" className="text-xs">{encounters.length}</Badge>
            </div>
            {expandedSections.has('encounters') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedSections.has('encounters') && (
            <div className="px-3 pb-3 space-y-2">
              {encounters.map((entry, idx) => (
                <div key={idx} className="p-2 bg-muted/50 rounded text-xs">
                  {(entry.resource as { type?: Array<{ coding?: Array<{ display?: string }> }> }).type?.[0]?.coding?.[0]?.display || 'Unknown encounter'}
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full">
                <Plus className="w-3 h-3 mr-1" /> Add Encounter
              </Button>
            </div>
          )}
        </div>

        {/* Run button */}
        <Button
          className="w-full"
          onClick={() => handleExecute(activeTestCase)}
          disabled={isExecuting || !elm}
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Test
            </>
          )}
        </Button>
      </div>
    );
  };

  // Render results
  const renderResults = () => {
    if (!lastExecutionResult) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No results yet</p>
          <p className="text-xs mt-1">Run a test to see results</p>
        </div>
      );
    }

    const result = lastExecutionResult;
    const testCase = testCases.find((tc) => tc.id === result.testCaseId);

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">{testCase?.name || 'Test Results'}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{result.executionTime}ms</span>
              <span>•</span>
              <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
          {result.success ? (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Success
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Failed
            </Badge>
          )}
        </div>

        {result.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            {result.error}
          </div>
        )}

        {/* Results table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2 font-medium">Expression</th>
                <th className="text-left p-2 font-medium">Result</th>
                <th className="text-left p-2 font-medium">Type</th>
                <th className="text-center p-2 font-medium w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(result.results).map((expr, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    'border-t',
                    expr.passed === false && 'bg-red-50 dark:bg-red-950/20'
                  )}
                >
                  <td className="p-2 font-mono text-xs">{expr.name}</td>
                  <td className="p-2">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs">{expr.formattedValue}</span>
                      {expr.expected !== undefined && expr.passed === false && (
                        <span className="text-xs text-red-600 mt-0.5">
                          Expected: {String(expr.expected)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      {expr.type}
                    </Badge>
                  </td>
                  <td className="p-2 text-center">
                    {expr.passed === true && (
                      <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                    )}
                    {expr.passed === false && (
                      <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                    )}
                    {expr.passed === undefined && (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render JSON editor
  const renderJsonEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Import/Export JSON</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3 h-3 mr-1" /> Import File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
        </div>
      </div>

      <Textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Paste FHIR Bundle JSON here..."
        className="font-mono text-xs min-h-[300px]"
      />

      {importError && (
        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {importError}
        </div>
      )}

      <Button onClick={handleImportJson} disabled={!jsonInput.trim()}>
        <Upload className="w-4 h-4 mr-2" /> Import as Test Case
      </Button>
    </div>
  );

  // Panel content
  const renderPanelContent = () => {
    switch (activeTab) {
      case 'cases':
        return renderTestCaseList();
      case 'builder':
        return renderPatientBuilder();
      case 'results':
        return renderResults();
      case 'json':
        return renderJsonEditor();
      default:
        return null;
    }
  };

  if (!isPanelOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('fixed bottom-4 right-4 z-50 shadow-lg', className)}
        onClick={togglePanel}
      >
        <TestTube className="w-4 h-4 mr-2" />
        Test Panel
        <PanelRight className="w-4 h-4 ml-2" />
      </Button>
    );
  }

  return (
    <Card className={cn('w-[400px] h-[600px] flex flex-col', className)}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Harness
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={togglePanel}>
            <PanelRightClose className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-2">
          {(['cases', 'builder', 'results', 'json'] as const).map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={activeTab === tab ? 'default' : 'ghost'}
              className="text-xs capitalize"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {renderPanelContent()}
      </CardContent>
    </Card>
  );
}

export default TestPanel;
