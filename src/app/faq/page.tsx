'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  Book,
  Target,
  Github,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Code2,
  Blocks,
  TestTube,
  Package,
  Search,
  Zap,
  FileJson,
  Shield,
  Rocket,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // General
  {
    category: 'General',
    question: 'What is FHIR IQ CQL Builder?',
    answer: 'FHIR IQ CQL Builder is a web-based tool for authoring, validating, and testing Clinical Quality Language (CQL) expressions. It provides both a code editor with syntax highlighting and a visual query builder for creating clinical quality measures without writing code.',
  },
  {
    category: 'General',
    question: 'Who is this tool designed for?',
    answer: 'This tool is designed for clinical informaticists, quality measure developers, healthcare IT professionals, and anyone who needs to create or maintain CQL-based clinical quality measures. Both technical and non-technical users can benefit from the visual builder interface.',
  },
  {
    category: 'General',
    question: 'Is this tool free to use?',
    answer: 'Yes, FHIR IQ CQL Builder is open source and free to use. You can access the full source code on GitHub and contribute to its development.',
  },
  {
    category: 'General',
    question: 'What FHIR version does this support?',
    answer: 'FHIR IQ CQL Builder supports FHIR R4 (4.0.1), which is the current standard for US healthcare interoperability. CQL libraries are compiled against FHIR R4 model definitions.',
  },
  // Code Editor
  {
    category: 'Code Editor',
    question: 'What features does the code editor have?',
    answer: 'The Monaco-based code editor includes CQL syntax highlighting, real-time error detection, auto-completion for keywords, bracket matching, line numbers, and support for multiple CQL libraries. It provides the same editing experience as VS Code.',
  },
  {
    category: 'Code Editor',
    question: 'Can I import existing CQL files?',
    answer: 'Yes, you can paste existing CQL code directly into the editor. Future versions will support file upload functionality for importing .cql files from your file system.',
  },
  {
    category: 'Code Editor',
    question: 'How do I add comments to my CQL code?',
    answer: 'CQL supports two comment styles: single-line comments starting with // and multi-line comments enclosed in /* */. The editor will highlight comments in a distinct color.',
  },
  // Visual Builder
  {
    category: 'Visual Builder',
    question: 'What is the Visual Query Builder?',
    answer: 'The Visual Query Builder is a no-code interface for creating CQL expressions. You can select FHIR resources, add conditions using dropdowns and value inputs, and the tool automatically generates valid CQL code.',
  },
  {
    category: 'Visual Builder',
    question: 'Which FHIR resources are supported?',
    answer: 'Currently supported resources include Patient, Condition, Encounter, Observation, MedicationRequest, Procedure, Immunization, DiagnosticReport, and Claim. More resources will be added in future updates.',
  },
  {
    category: 'Visual Builder',
    question: 'Can I switch between visual and code modes?',
    answer: 'Yes, you can toggle between Visual and Code modes using the buttons in the editor header. Note that switching from Code to Visual mode may not preserve complex CQL expressions that cannot be represented visually.',
  },
  {
    category: 'Visual Builder',
    question: 'How do I create measure populations?',
    answer: 'The Visual Builder provides three separate query builders for Initial Population, Denominator, and Numerator. Each can have different FHIR resources and conditions. The generated CQL automatically creates the appropriate population definitions.',
  },
  // Validation & Compilation
  {
    category: 'Validation',
    question: 'What validation does the tool perform?',
    answer: 'The tool validates CQL syntax, checks for undefined references, verifies type compatibility, and compiles CQL to ELM (Expression Logical Model). Errors are displayed inline in the editor with descriptive messages.',
  },
  {
    category: 'Validation',
    question: 'What is ELM and why is it important?',
    answer: 'ELM (Expression Logical Model) is the compiled, machine-executable form of CQL. It\'s required for CQL execution engines to run your quality measures. The tool automatically generates ELM when your CQL compiles successfully.',
  },
  {
    category: 'Validation',
    question: 'Why am I getting compilation errors?',
    answer: 'Common causes include: undefined value sets or code systems, incorrect FHIR path expressions, type mismatches in comparisons, missing library declarations, or syntax errors. Check the error messages for specific line numbers and descriptions.',
  },
  // Testing
  {
    category: 'Testing',
    question: 'How does the Test Harness work?',
    answer: 'The Test Harness allows you to test your CQL logic against FHIR patient bundles. You can create test cases with expected outcomes, run them individually or in batch, and see detailed results showing which populations each patient falls into.',
  },
  {
    category: 'Testing',
    question: 'Where can I get test patient data?',
    answer: 'You can use Synthea to generate synthetic FHIR patient data, or create your own test bundles. The tool accepts standard FHIR R4 Bundle resources containing Patient and related clinical resources.',
  },
  {
    category: 'Testing',
    question: 'Can I save my test cases?',
    answer: 'Yes, test cases are automatically saved to your browser\'s local storage. They persist across sessions and can be exported as JSON for sharing or backup.',
  },
  // Export & FHIR
  {
    category: 'Export',
    question: 'What export formats are available?',
    answer: 'You can export: raw CQL files (.cql), compiled ELM JSON, FHIR Library resources (containing both CQL and ELM), FHIR Measure resources, and complete FHIR Bundles containing all artifacts.',
  },
  {
    category: 'Export',
    question: 'What is a FHIR Library resource?',
    answer: 'A FHIR Library resource is a standard way to package CQL logic for use in FHIR-based systems. It contains base64-encoded CQL and ELM content, along with metadata like version, status, and related value sets.',
  },
  {
    category: 'Export',
    question: 'Can I use the exported artifacts with other tools?',
    answer: 'Yes, the exported FHIR resources conform to HL7 FHIR specifications and can be used with CQL execution engines like cql-execution, quality reporting platforms, and FHIR servers that support Library resources.',
  },
  // VSAC
  {
    category: 'VSAC',
    question: 'What is VSAC?',
    answer: 'VSAC (Value Set Authority Center) is the official repository for value sets used in US clinical quality measures. It\'s maintained by the National Library of Medicine and provides standardized clinical code groupings.',
  },
  {
    category: 'VSAC',
    question: 'Do I need a VSAC account?',
    answer: 'To browse and retrieve value sets from VSAC, you\'ll need a free UMLS Terminology Services account. You can register at https://uts.nlm.nih.gov/uts/signup-login',
  },
  {
    category: 'VSAC',
    question: 'How do I search for value sets?',
    answer: 'Use the VSAC panel in the tool to search by keyword, OID, or steward. Results show the value set name, OID, and version. You can view the contained codes and insert value set references directly into your CQL.',
  },
  // Technical
  {
    category: 'Technical',
    question: 'What browsers are supported?',
    answer: 'FHIR IQ CQL Builder works best in modern browsers including Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported.',
  },
  {
    category: 'Technical',
    question: 'Is my data stored on a server?',
    answer: 'No, all CQL code, test cases, and settings are stored locally in your browser. Nothing is sent to our servers except for CQL compilation requests to the translation service.',
  },
  {
    category: 'Technical',
    question: 'Can I run this tool locally?',
    answer: 'Yes, you can clone the repository from GitHub and run the Next.js development server locally. See the README for installation instructions.',
  },
];

const categories = ['General', 'Code Editor', 'Visual Builder', 'Validation', 'Testing', 'Export', 'VSAC', 'Technical'];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  General: HelpCircle,
  'Code Editor': Code2,
  'Visual Builder': Blocks,
  Validation: Zap,
  Testing: TestTube,
  Export: Package,
  VSAC: Search,
  Technical: Shield,
};

export default function FAQPage() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = activeCategory
    ? faqData.filter((item) => item.category === activeCategory)
    : faqData;

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
                <HelpCircle className="w-5 h-5 text-clinical" />
                FAQ
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/docs">
                <Button variant="ghost" size="sm">
                  <Book className="w-4 h-4 mr-2" />
                  Docs
                </Button>
              </Link>
              <Link href="/vision">
                <Button variant="ghost" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  Vision
                </Button>
              </Link>
              <Link href="/coming-soon">
                <Button variant="ghost" size="sm">
                  <Rocket className="w-4 h-4 mr-2" />
                  Coming Soon
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Find answers to common questions about FHIR IQ CQL Builder
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Button
            variant={activeCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category)}
              >
                <Icon className="w-4 h-4 mr-1" />
                {category}
              </Button>
            );
          })}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.map((item, index) => {
            const globalIndex = faqData.indexOf(item);
            const isExpanded = expandedItems.has(globalIndex);
            const Icon = categoryIcons[item.category];

            return (
              <Card key={globalIndex} className="overflow-hidden">
                <button
                  className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors"
                  onClick={() => toggleItem(globalIndex)}
                >
                  <Icon className="w-5 h-5 mt-0.5 text-clinical flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <h3 className="font-medium">{item.question}</h3>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pl-12">
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can&apos;t find the answer you&apos;re looking for? Open an issue on GitHub or contribute to the project.
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="https://github.com/FHIR-IQ/s77/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Ask a Question
                </Button>
              </a>
              <a
                href="https://github.com/FHIR-IQ/s77/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>
                  <Github className="w-4 h-4 mr-2" />
                  Contribute
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
