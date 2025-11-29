'use client';

import { useState, useEffect, useRef } from 'react';
import { useCQLBuilderStore, ConversationStep } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  measureTypeDescriptions,
  scoringTypeDescriptions,
  commonValueSets,
  fhirIGInfo,
} from '@/lib/cql-knowledge-base';
import type { MeasureType, MeasureScoringType, ClinicalDomain, ValueSetReference, FHIRImplementationGuide } from '@/types/cql';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Search,
  BookOpen,
  Target,
  Activity,
  Database,
  FileText,
  Sparkles,
  Layers,
  ExternalLink,
} from 'lucide-react';

// Step A: Purpose
function PurposeStep() {
  const { requirements, setPurpose, setStep, addMessage } = useCQLBuilderStore();
  const [purpose, setLocalPurpose] = useState(requirements.purpose || '');

  const handleNext = () => {
    if (purpose.trim()) {
      setPurpose(purpose.trim());
      addMessage('user', purpose.trim());
      addMessage(
        'assistant',
        "Great! Now let's understand the clinical problem this measure addresses. What specific healthcare challenge or gap in care are you trying to measure or improve?"
      );
      setStep('problem');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-clinical mb-2">
          <Target className="w-5 h-5" />
          <span className="text-sm font-medium">Step A</span>
        </div>
        <CardTitle>What is the purpose of this CQL measure?</CardTitle>
        <CardDescription>
          Describe what you want to measure or evaluate. Be specific about the clinical outcome,
          process, or population you're targeting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={purpose}
          onChange={(e) => setLocalPurpose(e.target.value)}
          placeholder="Example: Measure the percentage of patients aged 18-75 with diabetes who had their HbA1c tested in the past year"
          className="min-h-[120px]"
        />
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Examples:</span>
          {[
            'Cancer screening compliance',
            'Medication adherence rates',
            'Preventive care gaps',
            'Hospital readmission risk',
          ].map((example) => (
            <Badge
              key={example}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => setLocalPurpose(example)}
            >
              {example}
            </Badge>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} disabled={!purpose.trim()}>
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step B: Problem
function ProblemStep() {
  const { requirements, setProblem, setStep, addMessage } = useCQLBuilderStore();
  const [problem, setLocalProblem] = useState(requirements.problemStatement || '');

  const handleNext = () => {
    if (problem.trim()) {
      setProblem(problem.trim());
      addMessage('user', problem.trim());
      addMessage(
        'assistant',
        'Now, let me understand what type of measure this is. Is this for clinical quality reporting, operational efficiency, population health, consumer insights, or clinical decision support?'
      );
      setStep('measure-type');
    }
  };

  const handleBack = () => {
    setStep('purpose');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-clinical mb-2">
          <Activity className="w-5 h-5" />
          <span className="text-sm font-medium">Step B</span>
        </div>
        <CardTitle>What problem is this measure solving?</CardTitle>
        <CardDescription>
          Describe the clinical challenge, care gap, or quality issue that this measure addresses.
          Include why this matters for patient care or outcomes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={problem}
          onChange={(e) => setLocalProblem(e.target.value)}
          placeholder="Example: Many patients with diabetes are not receiving regular HbA1c testing, leading to uncontrolled blood sugar and preventable complications. This measure helps identify care gaps and improve diabetes management."
          className="min-h-[120px]"
        />
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Consider mentioning the clinical evidence or guidelines that support
            the importance of this measure (e.g., ADA guidelines for diabetes care).
          </p>
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!problem.trim()}>
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step C: Measure Type
function MeasureTypeStep() {
  const { requirements, setMeasureType, setStep, addMessage } = useCQLBuilderStore();
  const [selected, setSelected] = useState<MeasureType | null>(requirements.measureType || null);

  const handleNext = () => {
    if (selected) {
      setMeasureType(selected);
      addMessage('user', `This is a ${measureTypeDescriptions[selected].title}`);
      addMessage(
        'assistant',
        'Now choose the scoring methodology. How should this measure calculate results?'
      );
      setStep('scoring-type');
    }
  };

  const handleBack = () => {
    setStep('problem');
  };

  const measureTypes: MeasureType[] = [
    'clinical-quality',
    'operational',
    'population-health',
    'consumer-insight',
    'decision-support',
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-clinical mb-2">
          <FileText className="w-5 h-5" />
          <span className="text-sm font-medium">Step C - Part 1</span>
        </div>
        <CardTitle>What type of measure is this?</CardTitle>
        <CardDescription>
          Select the category that best describes your measure's purpose.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {measureTypes.map((type) => {
            const info = measureTypeDescriptions[type];
            return (
              <div
                key={type}
                onClick={() => setSelected(type)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selected === type
                    ? 'border-clinical bg-clinical-light'
                    : 'border-border hover:border-clinical/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{info.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {info.examples.slice(0, 3).map((ex) => (
                        <Badge key={ex} variant="secondary" className="text-xs">
                          {ex}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selected === type ? 'border-clinical bg-clinical' : 'border-muted-foreground'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!selected}>
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step C Part 2: Scoring Type
function ScoringTypeStep() {
  const { requirements, setScoringType, setStep, addMessage } = useCQLBuilderStore();
  const [selected, setSelected] = useState<MeasureScoringType | null>(
    requirements.scoringType || null
  );

  const handleNext = () => {
    if (selected) {
      setScoringType(selected);
      addMessage('user', `Using ${scoringTypeDescriptions[selected].title} scoring`);
      addMessage(
        'assistant',
        'Now select the FHIR Implementation Guide that best fits your use case. This determines the data model and profiles used in your CQL library.'
      );
      setStep('fhir-ig');
    }
  };

  const handleBack = () => {
    setStep('measure-type');
  };

  const scoringTypes: MeasureScoringType[] = ['proportion', 'ratio', 'continuous-variable', 'cohort'];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-clinical mb-2">
          <FileText className="w-5 h-5" />
          <span className="text-sm font-medium">Step C - Part 2</span>
        </div>
        <CardTitle>How should results be calculated?</CardTitle>
        <CardDescription>
          Select the scoring methodology for your measure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {scoringTypes.map((type) => {
            const info = scoringTypeDescriptions[type];
            return (
              <div
                key={type}
                onClick={() => setSelected(type)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selected === type
                    ? 'border-clinical bg-clinical-light'
                    : 'border-border hover:border-clinical/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{info.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selected === type ? 'border-clinical bg-clinical' : 'border-muted-foreground'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!selected}>
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step D: FHIR Implementation Guide Selection
function FHIRIGStep() {
  const { requirements, setFHIRIG, setStep, addMessage } = useCQLBuilderStore();
  const [selected, setSelected] = useState<FHIRImplementationGuide | null>(
    requirements.fhirIG || null
  );

  const handleNext = () => {
    if (selected) {
      setFHIRIG(selected);
      addMessage('user', `Using ${fhirIGInfo[selected].name} Implementation Guide`);
      addMessage(
        'assistant',
        'Now let\'s identify the clinical value sets needed to define your measure populations. Value sets contain the clinical codes (like diagnoses, procedures, medications) that identify relevant patients.'
      );
      setStep('value-sets');
    }
  };

  const handleBack = () => {
    setStep('scoring-type');
  };

  const igOptions: FHIRImplementationGuide[] = ['qi-core', 'us-core', 'hedis', 'carin-bb', 'davinci-pdex', 'mcode'];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Layers className="w-5 h-5" />
          <span className="text-sm font-medium">Step D</span>
        </div>
        <CardTitle>Select FHIR Implementation Guide</CardTitle>
        <CardDescription>
          Choose the FHIR IG that best fits your measure's use case. This determines the profiles and data model used in your CQL library.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {igOptions.map((ig) => {
            const info = fhirIGInfo[ig];
            return (
              <div
                key={ig}
                onClick={() => setSelected(ig)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selected === ig
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-border hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{info.name}</h4>
                      <Badge variant="outline" className="text-xs">v{info.version}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                    <a
                      href={info.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View IG <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      selected === ig ? 'border-blue-500 bg-blue-500' : 'border-muted-foreground'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800">
            <strong>Recommendation:</strong> For clinical quality measures (eCQMs), use <strong>QI-Core</strong>.
            For general US healthcare interoperability, use <strong>US Core</strong>.
            For payer/claims data, use <strong>CARIN Blue Button</strong>.
          </p>
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!selected} className="bg-blue-600 hover:bg-blue-700">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step E: Value Sets
function ValueSetsStep() {
  const { requirements, addValueSet, removeValueSet, setStep, addMessage, updateRequirements } =
    useCQLBuilderStore();
  const [selectedDomain, setSelectedDomain] = useState<ClinicalDomain | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customOid, setCustomOid] = useState('');
  const [customName, setCustomName] = useState('');

  const selectedValueSets = requirements.valueSets || [];

  const handleAddCustom = () => {
    if (customOid && customName) {
      addValueSet({
        name: customName,
        oid: customOid,
        purpose: 'Custom value set',
      });
      setCustomOid('');
      setCustomName('');
    }
  };

  const handleNext = () => {
    if (selectedValueSets.length > 0) {
      const vsNames = selectedValueSets.map((vs) => vs.name).join(', ');
      addMessage('user', `Selected value sets: ${vsNames}`);
      addMessage(
        'assistant',
        'Is there any clinical evidence or research that supports this measure? This helps establish the validity and importance of what you\'re measuring.'
      );
      setStep('evidence');
    }
  };

  const handleBack = () => {
    setStep('fhir-ig');
  };

  const domains = Object.keys(commonValueSets) as ClinicalDomain[];

  const filteredValueSets = selectedDomain
    ? commonValueSets[selectedDomain].filter(
        (vs) =>
          vs.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vs.oid.includes(searchTerm)
      )
    : [];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-clinical mb-2">
          <Database className="w-5 h-5" />
          <span className="text-sm font-medium">Step D</span>
        </div>
        <CardTitle>Select Value Sets (VSAC)</CardTitle>
        <CardDescription>
          Value sets define the clinical concepts (diagnoses, procedures, medications) used in your
          measure. Select from common sets or add custom OIDs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Value Sets */}
        {selectedValueSets.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Value Sets</h4>
            <div className="flex flex-wrap gap-2">
              {selectedValueSets.map((vs) => (
                <Badge key={vs.oid} variant="clinical" className="flex items-center gap-1">
                  {vs.name}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeValueSet(vs.oid)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Domain Selection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Browse by Clinical Domain</h4>
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <Badge
                key={domain}
                variant={selectedDomain === domain ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedDomain(domain === selectedDomain ? null : domain)}
              >
                {domain.replace(/-/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Value Set List */}
        {selectedDomain && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search value sets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
              {filteredValueSets.map((vs) => {
                const isSelected = selectedValueSets.some((s) => s.oid === vs.oid);
                return (
                  <div
                    key={vs.oid}
                    onClick={() => (isSelected ? removeValueSet(vs.oid) : addValueSet(vs))}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      isSelected ? 'bg-clinical-light' : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{vs.name}</span>
                      {isSelected && <Badge variant="clinical">Added</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">OID: {vs.oid}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Value Set */}
        <div className="space-y-2 border-t pt-4">
          <h4 className="text-sm font-medium">Add Custom VSAC Value Set</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Value Set Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="OID (e.g., 2.16.840.1.113883...)"
              value={customOid}
              onChange={(e) => setCustomOid(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleAddCustom}
              disabled={!customOid || !customName}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handleNext} disabled={selectedValueSets.length === 0}>
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step E: Evidence
function EvidenceStep() {
  const { requirements, addEvidence, removeEvidence, setStep, addMessage } = useCQLBuilderStore();
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [relevance, setRelevance] = useState('');

  const evidenceRefs = requirements.evidenceReferences || [];

  const handleAdd = () => {
    if (title && source && relevance) {
      addEvidence({ title, source, relevance });
      setTitle('');
      setSource('');
      setRelevance('');
    }
  };

  const handleNext = () => {
    addMessage('user', 'Evidence provided for measure justification');
    addMessage(
      'assistant',
      'Excellent! Let me now generate your CQL library based on all the information you\'ve provided. This will create production-ready code following HL7 CQL v1.5.3 standards.'
    );
    setStep('generating');
  };

  const handleBack = () => {
    setStep('value-sets');
  };

  const handleSkip = () => {
    addMessage('user', 'Skipping evidence step');
    addMessage(
      'assistant',
      'No problem! Let me generate your CQL library based on the information provided.'
    );
    setStep('generating');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-clinical mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="text-sm font-medium">Step E</span>
        </div>
        <CardTitle>Clinical Evidence (Optional)</CardTitle>
        <CardDescription>
          Add references to clinical guidelines, research studies, or evidence that supports this
          measure. This strengthens the validity of your measure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Added Evidence */}
        {evidenceRefs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Added References</h4>
            {evidenceRefs.map((ev) => (
              <div key={ev.title} className="p-3 bg-muted rounded-lg flex justify-between">
                <div>
                  <p className="font-medium text-sm">{ev.title}</p>
                  <p className="text-xs text-muted-foreground">{ev.source}</p>
                </div>
                <X
                  className="w-4 h-4 cursor-pointer hover:text-destructive"
                  onClick={() => removeEvidence(ev.title)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Add Evidence Form */}
        <div className="space-y-3">
          <Input
            placeholder="Title (e.g., ADA Standards of Medical Care 2024)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Source (e.g., American Diabetes Association)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <Textarea
            placeholder="Relevance to this measure..."
            value={relevance}
            onChange={(e) => setRelevance(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            variant="outline"
            onClick={handleAdd}
            disabled={!title || !source || !relevance}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Reference
          </Button>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleNext}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate CQL
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Conversation Flow Component
export function ConversationFlow() {
  const { currentStep } = useCQLBuilderStore();

  switch (currentStep) {
    case 'purpose':
      return <PurposeStep />;
    case 'problem':
      return <ProblemStep />;
    case 'measure-type':
      return <MeasureTypeStep />;
    case 'scoring-type':
      return <ScoringTypeStep />;
    case 'fhir-ig':
      return <FHIRIGStep />;
    case 'value-sets':
      return <ValueSetsStep />;
    case 'evidence':
      return <EvidenceStep />;
    default:
      return null;
  }
}
