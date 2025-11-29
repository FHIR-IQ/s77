'use client';

import { useCQLBuilderStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Sparkles,
  Database,
  ArrowRight,
  Layers,
  TestTube,
  Wrench,
} from 'lucide-react';

export function WelcomeScreen() {
  const { setStep, addMessage } = useCQLBuilderStore();

  const handleStart = () => {
    addMessage(
      'assistant',
      "Welcome to FHIR IQ CQL Builder! I'll help you create a CQL (Clinical Quality Language) measure. Let's start with the basics. What is the purpose of the measure you want to create?"
    );
    setStep('purpose');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">IQ</span>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold tracking-tight">FHIR IQ CQL Builder</h1>
              <p className="text-sm text-muted-foreground">Open Quality Platform</p>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
            Create production-ready Clinical Quality Language measures using natural language.
            Powered by AI, validated against official HL7 specifications.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              HL7 CQL v1.5.3
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              FHIR R4
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              QI-Core / US Core
            </Badge>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <Sparkles className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">AI-Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Describe your measure in plain English and let AI generate compliant CQL code.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Layers className="w-8 h-8 text-cyan-600 mb-2" />
              <CardTitle className="text-lg">Multi-IG Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate code for US Core, QI-Core, CARIN BB, HEDIS, and more IGs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Database className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">VSAC Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access value sets from VSAC with standard OIDs for clinical coding.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <TestTube className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Synthea Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate custom synthetic patient data for measure testing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Measure Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supported Measure Types</CardTitle>
            <CardDescription>
              Create measures for various healthcare quality and analytics needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Clinical Quality (eCQM)</Badge>
              <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100">Operational Metrics</Badge>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Population Health</Badge>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Consumer Insights</Badge>
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Clinical Decision Support</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Process Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Simple 6-Step Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2 text-center">
              {[
                { step: 'A', label: 'Purpose' },
                { step: 'B', label: 'Problem' },
                { step: 'C', label: 'Type' },
                { step: 'D', label: 'FHIR IG' },
                { step: 'E', label: 'Value Sets' },
                { step: 'F', label: 'Evidence' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-sm font-medium">
                    {item.step}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auto-Fix Feature Highlight */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Auto-Fix Validation Errors</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              When CQL validation fails, our AI automatically analyzes the errors and suggests fixes.
              One-click to apply corrections and regenerate valid CQL code.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" onClick={handleStart} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg">
            Start Building Your CQL Measure
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Based on{' '}
            <a
              href="https://cql.hl7.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              HL7 CQL Specification
            </a>{' '}
            and{' '}
            <a
              href="https://build.fhir.org/ig/HL7/cqf-measures/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              CQF Measures IG
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
