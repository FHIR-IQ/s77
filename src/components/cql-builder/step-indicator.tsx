'use client';

import { cn } from '@/lib/utils';
import { useCQLBuilderStore, ConversationStep } from '@/lib/store';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const steps: { id: ConversationStep; label: string; shortLabel: string }[] = [
  { id: 'welcome', label: 'Welcome', shortLabel: 'Start' },
  { id: 'purpose', label: 'Purpose', shortLabel: 'A' },
  { id: 'problem', label: 'Problem', shortLabel: 'B' },
  { id: 'measure-type', label: 'Measure Type', shortLabel: 'C' },
  { id: 'scoring-type', label: 'Scoring', shortLabel: 'C' },
  { id: 'value-sets', label: 'Value Sets', shortLabel: 'D' },
  { id: 'evidence', label: 'Evidence', shortLabel: 'E' },
  { id: 'additional-details', label: 'Details', shortLabel: 'F' },
  { id: 'generating', label: 'Generating', shortLabel: 'Gen' },
  { id: 'review', label: 'Review', shortLabel: 'Done' },
];

const stepOrder: ConversationStep[] = [
  'welcome',
  'purpose',
  'problem',
  'measure-type',
  'scoring-type',
  'value-sets',
  'evidence',
  'additional-details',
  'generating',
  'review',
];

export function StepIndicator() {
  const { currentStep, isProcessing } = useCQLBuilderStore();
  const currentIndex = stepOrder.indexOf(currentStep);

  // Filter to show main steps only
  const mainSteps = steps.filter((s) =>
    ['welcome', 'purpose', 'problem', 'measure-type', 'value-sets', 'evidence', 'review'].includes(s.id)
  );

  return (
    <div className="w-full py-4 px-6 bg-card border-b">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {mainSteps.map((step, index) => {
          const stepIndex = stepOrder.indexOf(step.id);
          const isCompleted = currentIndex > stepIndex;
          const isCurrent = currentStep === step.id ||
            (step.id === 'measure-type' && currentStep === 'scoring-type') ||
            (step.id === 'review' && currentStep === 'generating');
          const isUpcoming = currentIndex < stepIndex;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    isCompleted && 'bg-clinical text-white',
                    isCurrent && 'bg-clinical/20 border-2 border-clinical text-clinical',
                    isUpcoming && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent && isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-medium">{step.shortLabel}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1 hidden sm:block',
                    isCurrent && 'font-medium text-clinical',
                    isUpcoming && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < mainSteps.length - 1 && (
                <div
                  className={cn(
                    'w-8 sm:w-12 h-0.5 mx-1',
                    isCompleted ? 'bg-clinical' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
