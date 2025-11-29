'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { editor } from 'monaco-editor';
import { useCqlEditor, type CqlAnnotation, type ElmLibrary, annotationsToMarkers } from '@/lib/cql/editor-context';

interface CompileResponse {
  type: 'compile-result';
  requestId: string;
  success: boolean;
  elm?: ElmLibrary;
  annotations: CqlAnnotation[];
  compilationTime: number;
  error?: string;
}

interface UseCqlCompilerOptions {
  debounceMs?: number;
  autoCompile?: boolean;
}

export function useCqlCompiler(options: UseCqlCompilerOptions = {}) {
  const { debounceMs = 500, autoCompile = true } = options;

  const {
    state,
    setCode,
    setCompilationStatus,
    setAnnotations,
    setElm,
    setMarkers,
    setCompilationTime,
    clearErrors,
  } = useCqlEditor();

  const workerRef = useRef<Worker | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRequestRef = useRef<string | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);

  const [isWorkerReady, setIsWorkerReady] = useState(false);

  // Initialize Web Worker
  useEffect(() => {
    try {
      // Create worker using Blob for Next.js compatibility
      const workerCode = `
        // Message types handled inline for worker
        const TRANSLATION_SERVICES = [
          'https://cql-translation-service.herokuapp.com/cql/translator',
          'http://localhost:8080/cql/translator',
        ];

        function parseAnnotations(response) {
          const annotations = [];
          if (response.library?.annotation) {
            for (const ann of response.library.annotation) {
              if (ann.message) {
                const severity = ann.errorSeverity?.toLowerCase();
                const type = severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'info';
                annotations.push({
                  row: ann.s?.startLine ?? 1,
                  col: ann.s?.startChar ?? 1,
                  endRow: ann.s?.endLine,
                  endCol: ann.s?.endChar,
                  text: ann.message,
                  type,
                });
              }
            }
          }
          return annotations;
        }

        function localValidation(code) {
          const annotations = [];
          const lines = code.split('\\n');
          let hasLibrary = false;
          let hasContext = false;
          let hasUsing = false;
          let openParens = 0;
          let openBrackets = 0;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;

            if (/^\\s*library\\s+/.test(line)) hasLibrary = true;
            if (/^\\s*context\\s+/.test(line)) hasContext = true;
            if (/^\\s*using\\s+/.test(line)) hasUsing = true;

            for (const char of line) {
              if (char === '(') openParens++;
              if (char === ')') openParens--;
              if (char === '[') openBrackets++;
              if (char === ']') openBrackets--;
            }

            if (/\\bdefine\\s+"[^"]+"\s*$/.test(line)) {
              annotations.push({
                row: lineNum,
                col: line.indexOf('define') + 1,
                text: 'Define statement is missing a colon (:) and expression',
                type: 'error',
              });
            }
          }

          if (!hasLibrary) {
            annotations.push({ row: 1, col: 1, text: 'Missing library declaration', type: 'error' });
          }
          if (hasLibrary && !hasUsing) {
            annotations.push({ row: 1, col: 1, text: "Missing using declaration", type: 'warning' });
          }
          if (openParens !== 0) {
            annotations.push({ row: lines.length, col: 1, text: 'Mismatched parentheses', type: 'error' });
          }
          if (openBrackets !== 0) {
            annotations.push({ row: lines.length, col: 1, text: 'Mismatched brackets', type: 'error' });
          }

          return annotations;
        }

        async function compileWithService(code) {
          for (const serviceUrl of TRANSLATION_SERVICES) {
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 10000);
              const response = await fetch(serviceUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/cql', 'Accept': 'application/elm+json' },
                body: code,
                signal: controller.signal,
              });
              clearTimeout(timeout);
              if (response.ok) {
                const result = await response.json();
                return { elm: result, annotations: parseAnnotations(result) };
              }
            } catch { continue; }
          }
          return { elm: null, annotations: localValidation(code) };
        }

        self.onmessage = async (event) => {
          const { type, code, requestId } = event.data;
          if (type === 'compile') {
            const startTime = performance.now();
            try {
              const { elm, annotations } = await compileWithService(code);
              const hasErrors = annotations.some(a => a.type === 'error');
              self.postMessage({
                type: 'compile-result',
                requestId,
                success: !hasErrors,
                elm,
                annotations,
                compilationTime: performance.now() - startTime,
              });
            } catch (error) {
              self.postMessage({
                type: 'compile-result',
                requestId,
                success: false,
                annotations: [{ row: 1, col: 1, text: error.message || 'Unknown error', type: 'error' }],
                compilationTime: performance.now() - startTime,
                error: error.message,
              });
            }
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      workerRef.current = new Worker(workerUrl);

      workerRef.current.onmessage = (event: MessageEvent<CompileResponse>) => {
        const { requestId, success, elm, annotations, compilationTime } = event.data;

        // Only process if this is the most recent request
        if (requestId !== pendingRequestRef.current) {
          return;
        }

        pendingRequestRef.current = null;

        setAnnotations(annotations);
        setElm(elm ?? null);
        setCompilationTime(compilationTime);
        setCompilationStatus(success ? 'success' : 'error');

        // Update Monaco markers if editor is available
        if (state.editorInstance && monacoRef.current) {
          const model = state.editorInstance.getModel();
          if (model) {
            const markers = annotationsToMarkers(annotations, model);
            setMarkers(markers);
            monacoRef.current.editor.setModelMarkers(model, 'cql-compiler', markers);
          }
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('CQL Compiler Worker error:', error);
        setCompilationStatus('error');
      };

      setIsWorkerReady(true);

      return () => {
        workerRef.current?.terminate();
        URL.revokeObjectURL(workerUrl);
      };
    } catch (error) {
      console.error('Failed to initialize CQL compiler worker:', error);
    }
  }, [setAnnotations, setCompilationStatus, setCompilationTime, setElm, setMarkers, state.editorInstance]);

  // Compile function
  const compile = useCallback((code: string) => {
    if (!workerRef.current || !isWorkerReady) {
      console.warn('CQL Compiler worker not ready');
      return;
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    pendingRequestRef.current = requestId;

    setCompilationStatus('compiling');

    workerRef.current.postMessage({
      type: 'compile',
      code,
      requestId,
    });
  }, [isWorkerReady, setCompilationStatus]);

  // Debounced compile
  const debouncedCompile = useCallback((code: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      compile(code);
    }, debounceMs);
  }, [compile, debounceMs]);

  // Handle code changes
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);

    if (autoCompile) {
      debouncedCompile(newCode);
    }
  }, [setCode, autoCompile, debouncedCompile]);

  // Set Monaco reference for marker updates
  const setMonacoRef = useCallback((monaco: typeof import('monaco-editor')) => {
    monacoRef.current = monaco;
  }, []);

  // Manual compile trigger
  const triggerCompile = useCallback(() => {
    compile(state.code);
  }, [compile, state.code]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    code: state.code,
    compilationStatus: state.compilationStatus,
    annotations: state.annotations,
    elm: state.elm,
    markers: state.markers,
    lastCompilationTime: state.lastCompilationTime,
    isWorkerReady,
    handleCodeChange,
    triggerCompile,
    clearErrors,
    setMonacoRef,
  };
}

// Hook for simple use cases without full context
export function useSimpleCqlCompiler(initialCode: string = '', options: UseCqlCompilerOptions = {}) {
  const { debounceMs = 500 } = options;

  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<'idle' | 'compiling' | 'success' | 'error'>('idle');
  const [annotations, setAnnotations] = useState<CqlAnnotation[]>([]);
  const [elm, setElm] = useState<ElmLibrary | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const workerCode = `
      function localValidation(code) {
        const annotations = [];
        const lines = code.split('\\n');
        let hasLibrary = false;
        for (let i = 0; i < lines.length; i++) {
          if (/^\\s*library\\s+/.test(lines[i])) hasLibrary = true;
        }
        if (!hasLibrary) {
          annotations.push({ row: 1, col: 1, text: 'Missing library declaration', type: 'error' });
        }
        return annotations;
      }

      self.onmessage = async (event) => {
        const { code, requestId } = event.data;
        const annotations = localValidation(code);
        self.postMessage({
          type: 'compile-result',
          requestId,
          success: annotations.filter(a => a.type === 'error').length === 0,
          annotations,
          compilationTime: 0,
        });
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);

    workerRef.current.onmessage = (event) => {
      const { success, annotations: newAnnotations, elm: newElm } = event.data;
      setStatus(success ? 'success' : 'error');
      setAnnotations(newAnnotations);
      setElm(newElm ?? null);
    };

    return () => {
      workerRef.current?.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  const handleChange = useCallback((newCode: string) => {
    setCode(newCode);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setStatus('compiling');
      workerRef.current?.postMessage({
        type: 'compile',
        code: newCode,
        requestId: Date.now().toString(),
      });
    }, debounceMs);
  }, [debounceMs]);

  return { code, status, annotations, elm, handleChange };
}
