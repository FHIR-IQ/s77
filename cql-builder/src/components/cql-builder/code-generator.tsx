'use client';

import { useEffect, useState } from 'react';
import { useCQLBuilderStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, Code2, Sparkles } from 'lucide-react';

const generationSteps = [
  { id: 1, label: 'Analyzing requirements', duration: 1500 },
  { id: 2, label: 'Identifying clinical patterns', duration: 1200 },
  { id: 3, label: 'Generating library structure', duration: 1800 },
  { id: 4, label: 'Creating population definitions', duration: 2000 },
  { id: 5, label: 'Adding value set references', duration: 1000 },
  { id: 6, label: 'Optimizing expressions', duration: 1500 },
  { id: 7, label: 'Validating CQL syntax', duration: 1200 },
];

export function CodeGenerator() {
  const { requirements, setGeneratedCQL, setStep, addMessage } = useCQLBuilderStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateCQL();
  }, []);

  async function generateCQL() {
    try {
      // Animate through steps while API call is in progress
      const stepAnimation = animateSteps();

      // Make API call to generate CQL
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate CQL');
      }

      const data = await response.json();

      // Wait for animation to complete
      await stepAnimation;

      setGeneratedCQL({
        library: data.cql,
        suggestions: data.suggestions,
      });

      setIsComplete(true);
      addMessage('assistant', 'Your CQL library has been generated! Review the code below and make any adjustments needed.');

      // Short delay before transitioning to review
      setTimeout(() => {
        setStep('review');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addMessage('assistant', 'I encountered an error generating the CQL. Please try again or adjust your requirements.');
    }
  }

  function animateSteps(): Promise<void> {
    return new Promise((resolve) => {
      let stepIndex = 0;
      let totalProgress = 0;

      const animate = () => {
        if (stepIndex >= generationSteps.length) {
          setProgress(100);
          resolve();
          return;
        }

        setCurrentStepIndex(stepIndex);
        const step = generationSteps[stepIndex];
        const stepProgress = 100 / generationSteps.length;

        // Animate progress within step
        const startProgress = totalProgress;
        const endProgress = totalProgress + stepProgress;
        const startTime = Date.now();

        const animateProgress = () => {
          const elapsed = Date.now() - startTime;
          const stepProgressRatio = Math.min(elapsed / step.duration, 1);
          setProgress(startProgress + (endProgress - startProgress) * stepProgressRatio);

          if (elapsed < step.duration) {
            requestAnimationFrame(animateProgress);
          } else {
            totalProgress = endProgress;
            stepIndex++;
            animate();
          }
        };

        animateProgress();
      };

      animate();
    });
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="text-destructive mb-4">
            <Code2 className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Generation Error</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-clinical" />
          Generating Your CQL Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="h-2" />

        <div className="space-y-3">
          {generationSteps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex || isComplete;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-clinical-light' : isCompleted ? 'bg-muted/50' : ''
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-clinical" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-clinical animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted" />
                )}
                <span
                  className={`text-sm ${
                    isActive ? 'font-medium text-clinical' : isCompleted ? '' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {isComplete && (
          <div className="text-center pt-4">
            <CheckCircle className="w-12 h-12 text-clinical mx-auto mb-2" />
            <p className="font-medium">CQL Library Generated Successfully!</p>
            <p className="text-sm text-muted-foreground">Redirecting to review...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
