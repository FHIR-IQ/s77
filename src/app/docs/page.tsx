'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileCode2,
  Book,
  HelpCircle,
  Lightbulb,
  Github,
  ExternalLink,
  ChevronRight,
  Blocks,
  Code2,
  TestTube,
  Package,
  Zap,
  Search,
  FileJson,
  Play,
  Download,
  Settings,
  Users,
  Target,
  ArrowLeft,
} from 'lucide-react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: Play },
    { id: 'code-editor', label: 'Code Editor', icon: Code2 },
    { id: 'visual-builder', label: 'Visual Builder', icon: Blocks },
    { id: 'validation', label: 'Validation & Compilation', icon: Zap },
    { id: 'testing', label: 'Test Harness', icon: TestTube },
    { id: 'export', label: 'Export & FHIR Packaging', icon: Package },
    { id: 'vsac', label: 'VSAC Integration', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Book className="w-5 h-5 text-clinical" />
                Documentation
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/faq">
                <Button variant="ghost" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  FAQ
                </Button>
              </Link>
              <Link href="/vision">
                <Button variant="ghost" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  Vision
                </Button>
              </Link>
              <a
                href="https://github.com/FHIR-IQ/s77"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Contents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-clinical text-white'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </nav>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-8">
            {/* Getting Started */}
            <section id="getting-started" className={activeSection === 'getting-started' ? '' : 'hidden'}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-clinical" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <h3>What is FHIR IQ CQL Builder?</h3>
                  <p>
                    FHIR IQ CQL Builder is a comprehensive tool for creating, validating, and testing
                    Clinical Quality Language (CQL) measures. It provides both a code editor with full
                    syntax highlighting and a visual query builder for no-code measure creation.
                  </p>

                  <h3>Quick Start</h3>
                  <ol>
                    <li>
                      <strong>Define Requirements:</strong> Start by describing your measure's purpose,
                      target population, and clinical criteria.
                    </li>
                    <li>
                      <strong>Generate CQL:</strong> Use AI-assisted generation or the visual builder
                      to create your CQL code.
                    </li>
                    <li>
                      <strong>Validate & Compile:</strong> Check your CQL for syntax errors and compile
                      to ELM for execution.
                    </li>
                    <li>
                      <strong>Test:</strong> Use the test harness to validate against sample patient data.
                    </li>
                    <li>
                      <strong>Export:</strong> Download your measure as a FHIR Bundle for deployment.
                    </li>
                  </ol>

                  <h3>Keyboard Shortcuts</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-slate-100 rounded">
                      <span>Save</span>
                      <kbd className="px-2 py-1 bg-white rounded shadow">Ctrl+S</kbd>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-100 rounded">
                      <span>Format</span>
                      <kbd className="px-2 py-1 bg-white rounded shadow">Shift+Alt+F</kbd>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-100 rounded">
                      <span>Find</span>
                      <kbd className="px-2 py-1 bg-white rounded shadow">Ctrl+F</kbd>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-100 rounded">
                      <span>Go to Line</span>
                      <kbd className="px-2 py-1 bg-white rounded shadow">Ctrl+G</kbd>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Code Editor */}
            <section id="code-editor" className={activeSection === 'code-editor' ? '' : 'hidden'}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-clinical" />
                    Code Editor
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <h3>Monaco Editor Features</h3>
                  <p>
                    The code editor is powered by Monaco (the same editor used in VS Code) with
                    custom CQL syntax highlighting using the Monarch tokenizer.
                  </p>

                  <h4>Syntax Highlighting</h4>
                  <ul>
                    <li><strong>Keywords:</strong> library, define, context, using, include</li>
                    <li><strong>Types:</strong> Boolean, Integer, Decimal, DateTime, Interval</li>
                    <li><strong>FHIR Resources:</strong> Patient, Condition, Encounter, Observation</li>
                    <li><strong>Built-in Functions:</strong> AgeInYears, Count, Exists, Now, Today</li>
                    <li><strong>Date Literals:</strong> @2024-01-01, @T12:00:00</li>
                  </ul>

                  <h4>Editor Themes</h4>
                  <p>Toggle between Clinical Dark and Clinical Light themes using the theme button.</p>

                  <h4>Live Compilation Status</h4>
                  <p>
                    The status bar shows real-time compilation status, error count, warning count,
                    and compilation time.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Visual Builder */}
            <section id="visual-builder" className={activeSection === 'visual-builder' ? '' : 'hidden'}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Blocks className="w-5 h-5 text-clinical" />
                    Visual Query Builder
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <h3>No-Code CQL Creation</h3>
                  <p>
                    The Visual Query Builder lets you create CQL measures without writing code.
                    Build queries by selecting FHIR resources and defining conditions.
                  </p>

                  <h4>Supported FHIR Resources</h4>
                  <div className="flex flex-wrap gap-2 not-prose">
                    {['Patient', 'Condition', 'Encounter', 'Observation', 'Procedure',
                      'MedicationRequest', 'Immunization', 'AllergyIntolerance', 'DiagnosticReport'].map(r => (
                      <Badge key={r} variant="outline">{r}</Badge>
                    ))}
                  </div>

                  <h4>Building Queries</h4>
                  <ol>
                    <li>Select the FHIR resources you need (click badges to toggle)</li>
                    <li>Add rules using the "+ Rule" button</li>
                    <li>Choose field, operator, and value for each rule</li>
                    <li>Group rules with AND/OR combinators</li>
                    <li>Preview the generated CQL in real-time</li>
                    <li>Click "Apply to Code Editor" to use the generated CQL</li>
                  </ol>

                  <h4>Operators</h4>
                  <ul>
                    <li><code>=</code>, <code>!=</code> - Equality comparison</li>
                    <li><code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code> - Numeric/date comparison</li>
                    <li><code>in</code> - Value set membership</li>
                    <li><code>during</code> - During measurement period</li>
                    <li><code>is null</code>, <code>is not null</code> - Null checks</li>
                    <li><code>~</code> - CQL equivalence for CodeableConcept</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Validation */}
            <section id="validation" className={activeSection === 'validation' ? '' : 'hidden'}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-clinical" />
                    Validation & Compilation
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <h3>CQL Validation</h3>
                  <p>
                    Click "Validate CQL" to check your code for syntax errors. The validator performs:
                  </p>
                  <ul>
                    <li>Syntax validation (parentheses, brackets matching)</li>
                    <li>Keyword and structure validation</li>
                    <li>FHIR path expression validation</li>
                    <li>Value set reference checking</li>
                  </ul>

                  <h3>ELM Compilation</h3>
                  <p>
                    Click "Compile to ELM" to translate your CQL to Expression Logical Model (ELM),
                    the executable format used by CQL engines.
                  </p>

                  <h4>Translation Service</h4>
                  <p>
                    Compilation uses the CQL Translation Service. Multiple public endpoints are
                    tried automatically with fallback. For production use, consider self-hosting:
                  </p>
                  <ul>
                    <li><strong>Railway.app:</strong> ~$5/month</li>
                    <li><strong>Render:</strong> Free tier available</li>
                    <li><strong>Docker:</strong> <code>docker run -p 8080:8080 cqframework/cql-translation-service</code></li>
                  </ul>

                  <h3>Auto-Fix</h3>
                  <p>
                    If validation finds errors, click "Auto-Fix Errors with AI" to automatically
                    correct common issues like unbalanced parentheses, incorrect syntax, and
                    type mismatches.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Testing */}
            <section id="testing" className={activeSection === 'testing' ? '' : 'hidden'}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-clinical" />
                    Test Harness
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <h3>Test Panel</h3>
                  <p>
                    The Test Panel (bottom-right button) lets you run your CQL against sample
                    patient data to verify measure logic.
                  </p>

                  <h4>Test Cases</h4>
                  <ul>
                    <li><strong>Create:</strong> Build test cases with the Patient Builder</li>
                    <li><strong>Import:</strong> Load FHIR Bundles from JSON files</li>
                    <li><strong>Export:</strong> Save test cases for sharing</li>
                    <li><strong>Duplicate:</strong> Clone existing test cases</li>
                  </ul>

                  <h4>Patient Builder</h4>
                  <p>Create test patients with:</p>
                  <ul>
                    <li>Demographics (name, birth date, gender)</li>
                    <li>Conditions with SNOMED codes</li>
                    <li>Medications with RxNorm codes</li>
                    <li>Encounters with dates and types</li>
                  </ul>

                  <h4>Expected Results</h4>
                  <p>
                    Define expected values for expressions to automatically validate test results.
                    Failed assertions are highlighted in red.
                  </p>

                  <h4>Synthea Test Data</h4>
                  <p>
                    Generate realistic synthetic patient data with Synthea. Configure population
                    size, state, and disease modules in the Synthea panel.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Export */}
            <section id="export" className={activeSection === 'export' ? '' : 'hidden'}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-clinical" />
                    Export & FHIR Packaging
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <h3>Download Options</h3>

                  <h4>CQL File (.cql)</h4>
                  <p>Download the raw CQL source code for use in other tools.</p>

                  <h4>ELM JSON (.json)</h4>
                  <p>Download the compiled ELM for execution by CQL engines.</p>

                  <h4>FHIR Bundle</h4>
                  <p>
                    Download a complete FHIR Bundle containing:
                  </p>
                  <ul>
                    <li><strong>Library Resource:</strong> CQL and ELM content (base64 encoded)</li>
                    <li><strong>Measure Resource:</strong> Population definitions and scoring</li>
                    <li><strong>Related Artifacts:</strong> Value set references</li>
                  </ul>

                  <h4>FHIR Library Structure</h4>
                  <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
{`{
  "resourceType": "Library",
  "type": { "coding": [{ "code": "logic-library" }] },
  "content": [
    { "contentType": "text/cql", "data": "<base64>" },
    { "contentType": "application/elm+json", "data": "<base64>" }
  ]
}`}
                  </pre>
                </CardContent>
              </Card>
            </section>

            {/* VSAC */}
            <section id="vsac" className={activeSection === 'vsac' ? '' : 'hidden'}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-clinical" />
                    VSAC Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <h3>Value Set Authority Center</h3>
                  <p>
                    Search and import value sets from the NLM Value Set Authority Center (VSAC).
                  </p>

                  <h4>Searching Value Sets</h4>
                  <ol>
                    <li>Enter search terms in the VSAC Search panel</li>
                    <li>Browse results with OIDs and descriptions</li>
                    <li>Click to add value sets to your measure</li>
                  </ol>

                  <h4>API Key</h4>
                  <p>
                    For production use, obtain a UMLS API key from{' '}
                    <a href="https://uts.nlm.nih.gov/uts/" target="_blank" rel="noopener noreferrer">
                      NLM UTS
                    </a>.
                  </p>

                  <h4>Common Value Sets</h4>
                  <div className="not-prose space-y-2">
                    {[
                      { name: 'Diabetes', oid: '2.16.840.1.113883.3.464.1003.103.12.1001' },
                      { name: 'Hypertension', oid: '2.16.840.1.113883.3.464.1003.104.12.1011' },
                      { name: 'Office Visit', oid: '2.16.840.1.113883.3.464.1003.101.12.1001' },
                    ].map(vs => (
                      <div key={vs.oid} className="flex justify-between p-2 bg-slate-100 rounded text-sm">
                        <span>{vs.name}</span>
                        <code className="text-xs">{vs.oid}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
