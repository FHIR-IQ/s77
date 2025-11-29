'use client';

import { useCQLBuilderStore } from '@/lib/store';
import { StepIndicator } from '@/components/cql-builder/step-indicator';
import { WelcomeScreen } from '@/components/cql-builder/welcome-screen';
import { ConversationFlow } from '@/components/cql-builder/conversation-flow';
import { CodeGenerator } from '@/components/cql-builder/code-generator';
import { CodeReview } from '@/components/cql-builder/code-review';
import { Stethoscope, Github } from 'lucide-react';
import Link from 'next/link';

function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-clinical flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">CQL Builder</span>
        </Link>
        <nav className="flex items-center gap-4">
          <a
            href="https://cql.hl7.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com"
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a
              href="https://build.fhir.org/ig/HL7/cqf-measures/using-cql.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              CQL Best Practices
            </a>
            <a
              href="https://vsac.nlm.nih.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              VSAC
            </a>
            <a
              href="https://build.fhir.org/ig/HL7/cql-ig/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              CQL IG
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
