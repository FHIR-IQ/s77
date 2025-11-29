'use client';

import { useState } from 'react';
import { useCQLBuilderStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileCode2,
  Play,
  BookOpen,
  Lightbulb,
  RotateCcw,
  Terminal,
  ExternalLink,
  FileJson,
  Zap,
  Wrench,
  TestTube,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { syntheaModules, usStates } from '@/lib/cql-knowledge-base';

interface ValidationResult {
  valid: boolean;
  errors: Array<{ message: string; line?: number; severity: string }>;
  warnings: Array<{ message: string; line?: number; severity: string }>;
  metadata?: {
    library?: { name: string; version: string };
    valueSets: Array<{ name: string; oid: string }>;
    defines: Array<{ name: string; isFunction: boolean }>;
  };
  compilationDetails?: {
    elmGenerated: boolean;
    translatorUsed: string;
  };
}

interface CompilationResult {
  success: boolean;
  elm?: unknown;
  errors?: Array<{ message: string; startLine?: number }>;
  warnings?: Array<{ message: string; startLine?: number }>;
  metadata?: {
    library?: { name: string; version: string };
    valueSets: Array<{ name: string; oid: string }>;
    defines: Array<{ name: string; isFunction: boolean }>;
  };
}

export function CodeReview() {
  const { generatedCQL, requirements, reset, setGeneratedCQL } = useCQLBuilderStore();
  const [copied, setCopied] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'cql' | 'elm'>('cql');
  const [fixAttempts, setFixAttempts] = useState(0);

  // Synthea configuration state
  const [showSyntheaConfig, setShowSyntheaConfig] = useState(false);
  const [syntheaConfig, setSyntheaConfig] = useState({
    population: 100,
    state: 'Massachusetts',
    modules: [] as string[],
  });

  if (!generatedCQL) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p>No generated CQL available. Please start the process again.</p>
          <Button onClick={reset} className="mt-4">
            <RotateCcw className="w-4 h-4 mr-2" /> Start Over
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleCopy = async () => {
    const content = activeTab === 'cql'
      ? generatedCQL.library
      : JSON.stringify(compilationResult?.elm, null, 2);
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (type: 'cql' | 'elm') => {
    const libraryName = requirements.purpose
      ? requirements.purpose.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)
      : 'CQLMeasure';

    let content: string;
    let filename: string;
    let mimeType: string;

    if (type === 'cql') {
      content = generatedCQL.library;
      filename = `${libraryName}.cql`;
      mimeType = 'text/plain';
    } else {
      content = JSON.stringify(compilationResult?.elm, null, 2);
      filename = `${libraryName}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cql: generatedCQL.library, fullValidation: true }),
      });
      const data = await response.json();
      setValidationResult(data);
    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [{ message: 'Failed to validate CQL', severity: 'error' }],
        warnings: [],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompilationResult(null);
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cql: generatedCQL.library }),
      });
      const data = await response.json();
      setCompilationResult(data);
      if (data.success) {
        setActiveTab('elm');
      }
    } catch (err) {
      setCompilationResult({
        success: false,
        errors: [{ message: 'Failed to compile CQL' }],
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleStartOver = () => {
    reset();
  };

  const handleAutoFix = async () => {
    if (!validationResult || validationResult.valid || !generatedCQL) return;

    setIsFixing(true);
    try {
      const errorMessages = validationResult.errors
        .map(e => `Line ${e.line || '?'}: ${e.message}`)
        .join('\n');

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements: {
            ...requirements,
            existingCQL: generatedCQL.library,
            validationErrors: errorMessages,
            fixMode: true,
          },
        }),
      });

      const data = await response.json();

      if (data.cql) {
        setGeneratedCQL({
          library: data.cql,
          suggestions: [
            `Auto-fixed ${validationResult.errors.length} validation error(s)`,
            ...(data.suggestions || []),
          ],
        });
        setValidationResult(null);
        setCompilationResult(null);
        setFixAttempts(prev => prev + 1);

        // Auto-validate after fix
        setTimeout(() => handleValidate(), 500);
      }
    } catch (err) {
      console.error('Auto-fix failed:', err);
    } finally {
      setIsFixing(false);
    }
  };

  const openInPlayground = () => {
    // CQL Playground URL with encoded CQL
    const playgroundUrl = 'https://cqframework.org/clinical_quality_language/playground/';
    window.open(playgroundUrl, '_blank');
  };

  // Count lines of code
  const lineCount = generatedCQL.library.split('\n').length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileCode2 className="w-6 h-6 text-clinical" />
            Generated CQL Library
          </h2>
          <p className="text-muted-foreground">
            Review, validate, compile, and download your CQL code
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openInPlayground}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Playground
          </Button>
          <Button variant="outline" size="sm" onClick={handleStartOver}>
            <RotateCcw className="w-4 h-4 mr-2" /> New Measure
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="clinical" className="text-sm py-1 px-3">
          {lineCount} lines
        </Badge>
        <Badge variant="secondary" className="text-sm py-1 px-3">
          {requirements.scoringType || 'proportion'} measure
        </Badge>
        <Badge variant="secondary" className="text-sm py-1 px-3">
          {requirements.valueSets?.length || 0} value sets
        </Badge>
        {validationResult && (
          <Badge
            variant={validationResult.valid ? 'success' : 'destructive'}
            className="text-sm py-1 px-3"
          >
            {validationResult.valid ? 'Valid CQL' : `${validationResult.errors.length} errors`}
          </Badge>
        )}
        {compilationResult?.success && (
          <Badge variant="success" className="text-sm py-1 px-3">
            ELM Generated
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Code Editor */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'cql' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('cql')}
                >
                  <FileCode2 className="w-4 h-4 mr-1" />
                  CQL
                </Button>
                <Button
                  variant={activeTab === 'elm' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('elm')}
                  disabled={!compilationResult?.elm}
                >
                  <FileJson className="w-4 h-4 mr-1" />
                  ELM
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(activeTab)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm max-h-[600px] overflow-y-auto font-mono">
                <code>
                  {activeTab === 'cql'
                    ? generatedCQL.library
                    : compilationResult?.elm
                      ? JSON.stringify(compilationResult.elm, null, 2)
                      : '// Compile CQL to generate ELM'
                  }
                </code>
              </pre>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
                  {activeTab === 'cql' ? '.cql' : '.json'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleValidate}
                disabled={isValidating}
                className="w-full bg-clinical hover:bg-clinical-dark"
              >
                {isValidating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Validate CQL
              </Button>
              <Button
                onClick={handleCompile}
                disabled={isCompiling}
                variant="outline"
                className="w-full"
              >
                {isCompiling ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Compile to ELM
              </Button>
              <Button variant="outline" onClick={() => handleDownload('cql')} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download .cql File
              </Button>
              {compilationResult?.elm ? (
                <Button variant="outline" onClick={() => handleDownload('elm')} className="w-full">
                  <FileJson className="w-4 h-4 mr-2" />
                  Download ELM .json
                </Button>
              ) : null}
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {validationResult.valid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  Validation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {validationResult.valid ? (
                  <p className="text-sm text-green-600">
                    CQL is syntactically valid and ready for use!
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {validationResult.errors.map((error, i) => (
                        <div key={i} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                          {error.line && <span className="font-mono mr-2">Line {error.line}:</span>}
                          {error.message}
                        </div>
                      ))}
                    </div>
                    {fixAttempts < 3 && (
                      <Button
                        onClick={handleAutoFix}
                        disabled={isFixing}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                      >
                        {isFixing ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Wrench className="w-4 h-4 mr-2" />
                        )}
                        Auto-Fix Errors with AI
                      </Button>
                    )}
                    {fixAttempts >= 3 && (
                      <p className="text-xs text-muted-foreground">
                        Max auto-fix attempts reached. Please review errors manually.
                      </p>
                    )}
                  </div>
                )}
                {validationResult.warnings.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-600">Warnings:</p>
                    {validationResult.warnings.map((warning, i) => (
                      <div key={i} className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        {warning.line && <span className="font-mono mr-2">Line {warning.line}:</span>}
                        {warning.message}
                      </div>
                    ))}
                  </div>
                )}
                {validationResult.compilationDetails && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <p>Translator: {validationResult.compilationDetails.translatorUsed}</p>
                    <p>ELM Generated: {validationResult.compilationDetails.elmGenerated ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Library Metadata */}
          {(validationResult?.metadata || compilationResult?.metadata) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Library Metadata</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {(validationResult?.metadata?.library || compilationResult?.metadata?.library) && (
                  <p>
                    <strong>Name:</strong>{' '}
                    {validationResult?.metadata?.library?.name || compilationResult?.metadata?.library?.name} v
                    {validationResult?.metadata?.library?.version || compilationResult?.metadata?.library?.version}
                  </p>
                )}
                <p>
                  <strong>Value Sets:</strong>{' '}
                  {validationResult?.metadata?.valueSets?.length || compilationResult?.metadata?.valueSets?.length || 0}
                </p>
                <p>
                  <strong>Definitions:</strong>{' '}
                  {validationResult?.metadata?.defines?.length || compilationResult?.metadata?.defines?.length || 0}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {generatedCQL.suggestions && generatedCQL.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {generatedCQL.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-clinical">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Synthea Test Data Generator */}
          <Card className="border-purple-200">
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowSyntheaConfig(!showSyntheaConfig)}
            >
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-purple-600" />
                  Synthea Test Data
                </div>
                {showSyntheaConfig ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </CardTitle>
            </CardHeader>
            {showSyntheaConfig && (
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate synthetic patient data with Synthea for testing your CQL measure.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium">Population Size</label>
                    <Input
                      type="number"
                      value={syntheaConfig.population}
                      onChange={(e) => setSyntheaConfig(prev => ({ ...prev, population: parseInt(e.target.value) || 100 }))}
                      min={1}
                      max={10000}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium">State</label>
                    <select
                      value={syntheaConfig.state}
                      onChange={(e) => setSyntheaConfig(prev => ({ ...prev, state: e.target.value }))}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    >
                      {usStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Disease Modules</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(syntheaModules).slice(0, 8).map(([key, mod]) => (
                        <Badge
                          key={key}
                          variant={syntheaConfig.modules.includes(mod.module) ? 'default' : 'outline'}
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            setSyntheaConfig(prev => ({
                              ...prev,
                              modules: prev.modules.includes(mod.module)
                                ? prev.modules.filter(m => m !== mod.module)
                                : [...prev.modules, mod.module]
                            }));
                          }}
                        >
                          {mod.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs font-mono space-y-1">
                  <p className="text-purple-700 font-medium"># Generate Synthea data</p>
                  <p className="text-slate-700">
                    java -jar synthea-with-dependencies.jar \
                  </p>
                  <p className="text-slate-700 pl-4">
                    -p {syntheaConfig.population} {syntheaConfig.state}
                    {syntheaConfig.modules.length > 0 && ` \\\n    -m ${syntheaConfig.modules.join(',')}`}
                  </p>
                </div>

                <a
                  href="https://github.com/synthetichealth/synthea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                >
                  Download Synthea <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            )}
          </Card>

          {/* CLI Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                CLI Commands
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 font-mono">
              <div className="bg-slate-100 p-2 rounded">
                <p className="text-muted-foreground"># Compile CQL</p>
                <p>npm run cql:compile -- measure.cql</p>
              </div>
              <div className="bg-slate-100 p-2 rounded">
                <p className="text-muted-foreground"># Execute against patients</p>
                <p>npm run cql:execute -- --elm measure.json --patients ./bundles/</p>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <a
                href="https://cql.hl7.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-clinical hover:underline"
              >
                HL7 CQL Specification →
              </a>
              <a
                href="https://cqframework.org/clinical_quality_language/playground/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-clinical hover:underline"
              >
                CQL Playground →
              </a>
              <a
                href="https://github.com/cqframework/cql-execution"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-clinical hover:underline"
              >
                cql-execution (npm) →
              </a>
              <a
                href="https://marketplace.visualstudio.com/items?itemName=cqframework.cql"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-clinical hover:underline"
              >
                VS Code CQL Extension →
              </a>
              <a
                href="https://vsac.nlm.nih.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-clinical hover:underline"
              >
                VSAC Value Sets →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
