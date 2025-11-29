'use client';

import { useCQLBuilderStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileCode2,
  CheckCircle,
  Sparkles,
  BookOpen,
  Database,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';

export function WelcomeScreen() {
  const { setStep, addMessage } = useCQLBuilderStore();

  const handleStart = () => {
    addMessage(
      'assistant',
      "Welcome! I'll help you build a CQL (Clinical Quality Language) measure. Let's start with the basics. What is the purpose of the measure you want to create?"
    );
    setStep('purpose');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-clinical-light text-clinical px-4 py-2 rounded-full text-sm font-medium">
            <Stethoscope className="w-4 h-4" />
            HL7 CQL v1.5.3 Compliant
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            CQL Code Builder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create production-ready Clinical Quality Language measures using natural language.
            Powered by AI, validated against official specifications.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <Sparkles className="w-8 h-8 text-clinical mb-2" />
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
              <Database className="w-8 h-8 text-clinical mb-2" />
              <CardTitle className="text-lg">VSAC Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access value sets from the Value Set Authority Center with standard OIDs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CheckCircle className="w-8 h-8 text-clinical mb-2" />
              <CardTitle className="text-lg">Validated Output</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generated code works with CQL VS Code extension and CQL-to-ELM compiler.
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
              <Badge variant="clinical">Clinical Quality (eCQM)</Badge>
              <Badge variant="clinical">Operational Metrics</Badge>
              <Badge variant="clinical">Population Health</Badge>
              <Badge variant="clinical">Consumer Insights</Badge>
              <Badge variant="clinical">Clinical Decision Support</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Process Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Simple 5-Step Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { step: 'A', label: 'Purpose' },
                { step: 'B', label: 'Problem' },
                { step: 'C', label: 'Type' },
                { step: 'D', label: 'Value Sets' },
                { step: 'E', label: 'Evidence' },
              ].map((item, index) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-clinical text-white flex items-center justify-center text-sm font-medium">
                    {item.step}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" onClick={handleStart} className="bg-clinical hover:bg-clinical-dark">
            Start Building Your CQL Measure
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Based on{' '}
            <a
              href="https://cql.hl7.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-clinical hover:underline"
            >
              HL7 CQL Specification
            </a>{' '}
            and{' '}
            <a
              href="https://build.fhir.org/ig/HL7/cqf-measures/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-clinical hover:underline"
            >
              CQF Measures IG
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
