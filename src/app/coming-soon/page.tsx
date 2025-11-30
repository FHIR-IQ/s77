'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Rocket,
  Book,
  HelpCircle,
  Target,
  Github,
  ArrowLeft,
  ArrowRight,
  Database,
  Share2,
  Globe,
  Zap,
  Users,
  Shield,
  FileCode2,
  Server,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  GitBranch,
  Cloud,
  Lock,
  BarChart3,
  Workflow,
} from 'lucide-react';

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const exchangeFeatures: FeatureItem[] = [
  {
    title: 'Measure Repository',
    description: 'Browse and discover quality measures shared by the community with full versioning support',
    icon: Database,
  },
  {
    title: 'One-Click Publishing',
    description: 'Publish your CQL measures directly to the exchange with metadata and documentation',
    icon: Share2,
  },
  {
    title: 'FHIR Server Integration',
    description: 'Deploy measures to any FHIR R4 server with automatic Library and Measure resource creation',
    icon: Server,
  },
  {
    title: 'Version Control',
    description: 'Track measure versions, view change history, and manage measure lifecycle',
    icon: GitBranch,
  },
  {
    title: 'Collaborative Authoring',
    description: 'Work together on measures with role-based access control and review workflows',
    icon: Users,
  },
  {
    title: 'Quality Certification',
    description: 'Community-driven review and certification process for published measures',
    icon: Shield,
  },
];

const sqlFeatures: FeatureItem[] = [
  {
    title: 'Automated CQL to SQL',
    description: 'Convert CQL expressions to optimized SQL queries targeting your data warehouse',
    icon: RefreshCw,
  },
  {
    title: 'Multiple Dialects',
    description: 'Support for PostgreSQL, BigQuery, Snowflake, Databricks, and more SQL dialects',
    icon: Database,
  },
  {
    title: 'FHIR Path Support',
    description: 'Full FHIRPath expression translation with proper null handling and type coercion',
    icon: Workflow,
  },
  {
    title: 'Performance Optimized',
    description: 'Generated SQL is optimized for large-scale analytics with proper indexing hints',
    icon: Zap,
  },
  {
    title: 'Schema Mapping',
    description: 'Flexible mapping between FHIR resources and your existing database schemas',
    icon: FileCode2,
  },
  {
    title: 'Validation & Testing',
    description: 'Verify SQL output matches CQL semantics with automated test generation',
    icon: CheckCircle2,
  },
];

const integrationBenefits = [
  {
    title: 'Unified Workflow',
    description: 'Author in CQL, execute anywhere - from FHIR servers to data warehouses',
    icon: Cloud,
  },
  {
    title: 'Standards Compliance',
    description: 'Maintain HL7 CQL and FHIR compliance while leveraging SQL performance',
    icon: Lock,
  },
  {
    title: 'Analytics Ready',
    description: 'Connect quality measures directly to BI tools and reporting dashboards',
    icon: BarChart3,
  },
];

export default function ComingSoonPage() {
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
                <Rocket className="w-5 h-5 text-clinical" />
                Coming Soon
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-200">
            <Sparkles className="w-3 h-3 mr-1" />
            In Development
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            The Future of Quality Measure Development
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We&apos;re building powerful new capabilities to transform how healthcare organizations
            create, share, and execute clinical quality measures.
          </p>
        </div>

        {/* Open Quality Measure Exchange */}
        <section className="mb-16">
          <Card className="overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
            <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Globe className="w-8 h-8" />
                </div>
                <div>
                  <Badge className="mb-2 bg-white/20 text-white border-white/30">Phase 5</Badge>
                  <CardTitle className="text-2xl">Open Quality Measure Exchange</CardTitle>
                  <p className="text-purple-100 mt-1">
                    A community-driven marketplace for sharing and discovering clinical quality measures
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {exchangeFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 h-fit">
                      <feature.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-purple-100/50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  Why an Open Exchange?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Quality measure development is often duplicated across organizations. The Open Quality
                  Measure Exchange creates a shared repository where healthcare organizations can
                  contribute, discover, and reuse validated measures—accelerating adoption of
                  value-based care while reducing development costs.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SQL on FHIR Integration */}
        <section className="mb-16">
          <Card className="overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Database className="w-8 h-8" />
                </div>
                <div>
                  <Badge className="mb-2 bg-white/20 text-white border-white/30">Phase 4</Badge>
                  <CardTitle className="text-2xl">SQL on FHIR Integration</CardTitle>
                  <p className="text-emerald-100 mt-1">
                    Automated CQL to SQL conversion for analytics and data warehouse execution
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {sqlFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 h-fit">
                      <feature.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FHIR Query Converter Link */}
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-lg border border-emerald-200">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      Try FHIR Query Converter Today
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Our companion project for converting FHIR queries to SQL is already available.
                      Convert FHIRPath expressions and FHIR search queries to SQL for BigQuery,
                      PostgreSQL, and more.
                    </p>
                  </div>
                  <a
                    href="https://fhir-query-converter.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open FHIR Query Converter
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Integration Benefits */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Unified Quality Measurement Workflow</h3>
            <p className="text-muted-foreground">
              From authoring to execution, a seamless experience across platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {integrationBenefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex p-4 rounded-full bg-clinical/10 mb-4">
                    <benefit.icon className="w-8 h-8 text-clinical" />
                  </div>
                  <h4 className="font-semibold mb-2">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Workflow Diagram */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">End-to-End Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-center gap-4 py-4">
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                  <FileCode2 className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">Author CQL</span>
                  <span className="text-xs text-muted-foreground">Visual or Code</span>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
                <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                  <Share2 className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium">Publish</span>
                  <span className="text-xs text-muted-foreground">To Exchange</span>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
                <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg">
                  <RefreshCw className="w-8 h-8 text-emerald-600 mb-2" />
                  <span className="text-sm font-medium">Convert</span>
                  <span className="text-xs text-muted-foreground">CQL to SQL</span>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
                <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
                  <Database className="w-8 h-8 text-amber-600 mb-2" />
                  <span className="text-sm font-medium">Execute</span>
                  <span className="text-xs text-muted-foreground">On Data Warehouse</span>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
                <div className="flex flex-col items-center p-4 bg-pink-50 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-pink-600 mb-2" />
                  <span className="text-sm font-medium">Analyze</span>
                  <span className="text-xs text-muted-foreground">BI Dashboards</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stay Updated / Call to Action */}
        <section>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-10 h-10 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-2xl font-bold mb-2">Be Part of the Future</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                These features are actively being developed. Star the repository to stay updated,
                or contribute to help shape the future of open quality measurement.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="https://github.com/FHIR-IQ/s77"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                    <Github className="w-5 h-5 mr-2" />
                    Star on GitHub
                  </Button>
                </a>
                <a
                  href="https://github.com/FHIR-IQ/s77/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Users className="w-5 h-5 mr-2" />
                    Join Discussion
                  </Button>
                </a>
                <a
                  href="https://fhir-query-converter.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="border-emerald-400 text-emerald-400 hover:bg-emerald-400/10">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Try Query Converter
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
