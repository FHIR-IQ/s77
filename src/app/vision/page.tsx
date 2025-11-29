'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Book,
  HelpCircle,
  Github,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Lightbulb,
  Users,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Blocks,
  Code2,
  TestTube,
  Package,
  Search,
  FileJson,
  Workflow,
  Brain,
  BarChart3,
  Cloud,
} from 'lucide-react';

interface Milestone {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  items: string[];
}

const phases: { phase: string; title: string; milestones: Milestone[] }[] = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    milestones: [
      {
        title: 'Core Editor',
        description: 'Monaco-based CQL editor with syntax highlighting',
        status: 'completed',
        items: [
          'CQL syntax highlighting with Monarch tokenizer',
          'Real-time error detection',
          'Keyword auto-completion',
          'Bracket matching and line numbers',
        ],
      },
      {
        title: 'CQL Compilation',
        description: 'CQL to ELM translation service integration',
        status: 'completed',
        items: [
          'Multiple translation service endpoints',
          'Fallback mechanism for reliability',
          'Error message parsing and display',
          'ELM JSON output generation',
        ],
      },
      {
        title: 'VSAC Integration',
        description: 'Value set search and retrieval',
        status: 'completed',
        items: [
          'Value set search by keyword',
          'OID and steward filtering',
          'Code expansion viewing',
          'Direct CQL insertion',
        ],
      },
    ],
  },
  {
    phase: 'Phase 2',
    title: 'No-Code Experience',
    milestones: [
      {
        title: 'Visual Query Builder',
        description: 'Drag-and-drop interface for CQL creation',
        status: 'completed',
        items: [
          'FHIR resource selection',
          'Condition builder with operators',
          'Population definition panels',
          'Real-time CQL preview',
        ],
      },
      {
        title: 'FHIR Schema Service',
        description: 'Resource field definitions for builder',
        status: 'completed',
        items: [
          '9 FHIR R4 resource schemas',
          'Field type mappings',
          'Operator compatibility',
          'Extensible architecture',
        ],
      },
      {
        title: 'Export & Packaging',
        description: 'FHIR-compliant artifact generation',
        status: 'completed',
        items: [
          'CQL and ELM file downloads',
          'FHIR Library resource generation',
          'FHIR Measure resource creation',
          'Bundle packaging for deployment',
        ],
      },
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Testing & Quality',
    milestones: [
      {
        title: 'Test Harness',
        description: 'CQL execution with test patient data',
        status: 'in-progress',
        items: [
          'Test case management',
          'FHIR bundle input support',
          'Expected outcome validation',
          'Batch test execution',
        ],
      },
      {
        title: 'Synthea Integration',
        description: 'Synthetic patient data generation',
        status: 'in-progress',
        items: [
          'Configurable patient generation',
          'Condition-specific scenarios',
          'Direct test case creation',
          'Population statistics',
        ],
      },
      {
        title: 'Documentation',
        description: 'Comprehensive user guides',
        status: 'in-progress',
        items: [
          'Feature documentation',
          'FAQ section',
          'API reference',
          'Contributing guide',
        ],
      },
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Intelligence',
    milestones: [
      {
        title: 'AI-Assisted Authoring',
        description: 'LLM-powered CQL generation',
        status: 'planned',
        items: [
          'Natural language to CQL conversion',
          'Intelligent code suggestions',
          'Error explanation and fixes',
          'Measure optimization recommendations',
        ],
      },
      {
        title: 'Advanced Validation',
        description: 'Deep semantic analysis',
        status: 'planned',
        items: [
          'Clinical logic validation',
          'Performance optimization hints',
          'Best practice suggestions',
          'Compliance checking',
        ],
      },
    ],
  },
  {
    phase: 'Phase 5',
    title: 'Enterprise',
    milestones: [
      {
        title: 'Collaboration',
        description: 'Team-based measure development',
        status: 'planned',
        items: [
          'User authentication',
          'Project workspaces',
          'Version control integration',
          'Review workflows',
        ],
      },
      {
        title: 'Deployment Pipeline',
        description: 'Measure lifecycle management',
        status: 'planned',
        items: [
          'FHIR server publishing',
          'Environment promotion',
          'Audit logging',
          'Measure analytics',
        ],
      },
    ],
  },
];

const problemStatements = [
  {
    icon: Clock,
    title: 'Time-Consuming Development',
    description: 'Creating clinical quality measures requires specialized CQL knowledge and significant development time. Manual coding is error-prone and difficult to validate.',
  },
  {
    icon: Users,
    title: 'Limited Accessibility',
    description: 'Clinical informaticists and quality measure experts often lack programming backgrounds, creating barriers to measure development and maintenance.',
  },
  {
    icon: Shield,
    title: 'Validation Challenges',
    description: 'Testing CQL logic against patient data is complex. Without proper tooling, errors go undetected until measures are deployed in production.',
  },
  {
    icon: Workflow,
    title: 'Fragmented Workflow',
    description: 'Measure development involves multiple disconnected tools: text editors, compilers, test frameworks, and packaging utilities.',
  },
];

const jobsToBeDone = [
  {
    icon: Code2,
    title: 'Write CQL expressions',
    description: 'Author syntactically correct CQL with real-time feedback and intelligent assistance',
  },
  {
    icon: Blocks,
    title: 'Build measures visually',
    description: 'Create quality measures through intuitive drag-and-drop without writing code',
  },
  {
    icon: Zap,
    title: 'Validate logic instantly',
    description: 'Compile CQL to ELM and catch errors before deployment',
  },
  {
    icon: TestTube,
    title: 'Test with patient data',
    description: 'Execute measures against FHIR bundles and verify expected outcomes',
  },
  {
    icon: Search,
    title: 'Find value sets',
    description: 'Search VSAC for standardized clinical code groupings and insert references',
  },
  {
    icon: Package,
    title: 'Package for deployment',
    description: 'Export FHIR-compliant Library and Measure resources ready for production',
  },
];

export default function VisionPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Planned</Badge>;
    }
  };

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
                <Target className="w-5 h-5 text-clinical" />
                Vision
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/docs">
                <Button variant="ghost" size="sm">
                  <Book className="w-4 h-4 mr-2" />
                  Docs
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="ghost" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  FAQ
                </Button>
              </Link>
              <a
                href="https://github.com/anthropics/s77"
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-clinical/10 text-clinical">Open Source Project</Badge>
          <h2 className="text-4xl font-bold mb-4">
            Democratizing Clinical Quality Measure Development
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            FHIR IQ CQL Builder aims to make clinical quality measure development accessible
            to everyone, from seasoned developers to clinical informaticists with no coding experience.
          </p>
        </div>

        {/* Problem Statement */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">The Problem We&apos;re Solving</h3>
            <p className="text-muted-foreground">
              Healthcare quality measurement faces significant tooling challenges
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {problemStatements.map((problem, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-3 rounded-lg bg-red-50">
                      <problem.icon className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{problem.title}</h4>
                      <p className="text-sm text-muted-foreground">{problem.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Jobs to Be Done */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Jobs to Be Done</h3>
            <p className="text-muted-foreground">
              What users need to accomplish with our tool
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {jobsToBeDone.map((job, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-lg bg-clinical/10 mb-4">
                    <job.icon className="w-6 h-6 text-clinical" />
                  </div>
                  <h4 className="font-semibold mb-2">{job.title}</h4>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Development Roadmap</h3>
            <p className="text-muted-foreground">
              Our journey from foundation to enterprise-ready platform
            </p>
          </div>

          <div className="space-y-8">
            {phases.map((phase, phaseIndex) => (
              <div key={phaseIndex}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="text-sm">
                    {phase.phase}
                  </Badge>
                  <h4 className="text-lg font-semibold">{phase.title}</h4>
                </div>
                <div className="grid md:grid-cols-3 gap-4 pl-4 border-l-2 border-border ml-4">
                  {phase.milestones.map((milestone, milestoneIndex) => (
                    <Card key={milestoneIndex}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          {getStatusIcon(milestone.status)}
                          {getStatusBadge(milestone.status)}
                        </div>
                        <CardTitle className="text-base mt-2">{milestone.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {milestone.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                milestone.status === 'completed' ? 'text-green-500' : 'text-muted-foreground/40'
                              }`} />
                              <span className={milestone.status === 'completed' ? '' : 'text-muted-foreground'}>
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Future Vision */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-clinical/5 to-blue-50 border-clinical/20">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Lightbulb className="w-10 h-10 text-clinical mx-auto mb-3" />
                <h3 className="text-2xl font-bold mb-2">The Future State</h3>
                <p className="text-muted-foreground">Where we&apos;re heading</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Brain className="w-8 h-8 text-clinical mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">AI-Powered</h4>
                  <p className="text-sm text-muted-foreground">
                    Describe measures in plain English and let AI generate the CQL
                  </p>
                </div>
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-clinical mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Analytics-Driven</h4>
                  <p className="text-sm text-muted-foreground">
                    Understand measure performance and optimize for accuracy
                  </p>
                </div>
                <div className="text-center">
                  <Cloud className="w-8 h-8 text-clinical mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Cloud-Native</h4>
                  <p className="text-sm text-muted-foreground">
                    Collaborate in real-time and deploy to any FHIR server
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section>
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Join the Journey</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                FHIR IQ CQL Builder is an open-source project and we welcome contributions of all kinds.
                Whether you&apos;re a developer, clinical informaticist, or quality measure expert,
                your input helps shape the future of healthcare quality measurement.
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="https://github.com/anthropics/s77"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg">
                    <Github className="w-5 h-5 mr-2" />
                    View on GitHub
                  </Button>
                </a>
                <a
                  href="https://github.com/anthropics/s77/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    <Users className="w-5 h-5 mr-2" />
                    Contributing Guide
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
