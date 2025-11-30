'use client';

import { useCQLBuilderStore } from '@/lib/store';
import { StepIndicator } from '@/components/cql-builder/step-indicator';
import { WelcomeScreen } from '@/components/cql-builder/welcome-screen';
import { ConversationFlow } from '@/components/cql-builder/conversation-flow';
import { CodeGenerator } from '@/components/cql-builder/code-generator';
import { CodeReview } from '@/components/cql-builder/code-review';
import { Github, Book, HelpCircle, Target, Rocket } from 'lucide-react';
import Link from 'next/link';

function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">FHIR IQ</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Open Quality</span>
            </div>
          </div>
          <div className="h-6 w-px bg-border mx-1" />
          <span className="font-medium text-base">CQL Builder</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/docs"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Book className="w-4 h-4" />
            Docs
          </Link>
          <Link
            href="/faq"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            FAQ
          </Link>
          <Link
            href="/vision"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Target className="w-4 h-4" />
            Vision
          </Link>
          <Link
            href="/coming-soon"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Rocket className="w-4 h-4" />
            Coming Soon
          </Link>
          <a
            href="https://github.com/FHIR-IQ/s77"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">IQ</span>
              </div>
              <span className="text-sm font-medium">FHIR IQ Open Quality</span>
            </div>
            <span className="text-sm text-muted-foreground">|</span>
            <div className="text-sm text-muted-foreground">
              Based on{' '}
              <a
                href="https://cql.hl7.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-clinical hover:underline"
              >
                HL7 CQL v1.5.3
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
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground">
              Documentation
            </Link>
            <Link href="/vision" className="hover:text-foreground">
              Roadmap
            </Link>
            <a
              href="https://github.com/FHIR-IQ/s77/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Contribute
            </a>
            <a
              href="https://vsac.nlm.nih.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              VSAC
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function MainContent() {
  const { currentStep } = useCQLBuilderStore();

  switch (currentStep) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'purpose':
    case 'problem':
    case 'measure-type':
    case 'scoring-type':
    case 'fhir-ig':
    case 'value-sets':
    case 'evidence':
    case 'additional-details':
      return (
        <div className="flex-1 flex flex-col">
          <StepIndicator />
          <div className="flex-1 flex items-start justify-center py-8 px-4">
            <ConversationFlow />
          </div>
        </div>
      );
    case 'generating':
      return (
        <div className="flex-1 flex flex-col">
          <StepIndicator />
          <div className="flex-1 flex items-center justify-center py-8 px-4">
            <CodeGenerator />
          </div>
        </div>
      );
    case 'review':
      return (
        <div className="flex-1 flex flex-col">
          <StepIndicator />
          <div className="flex-1 py-8">
            <CodeReview />
          </div>
        </div>
      );
    default:
      return <WelcomeScreen />;
  }
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        <MainContent />
      </main>
      <Footer />
    </>
  );
}
