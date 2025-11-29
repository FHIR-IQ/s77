'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Editor, { OnMount, OnChange, loader } from '@monaco-editor/react';
import type { editor as MonacoEditor, languages, IDisposable } from 'monaco-editor';
import { cqlMonarchLanguage, cqlLanguageConfiguration, cqlCompletionItemProvider } from '@/lib/cql/monarch-grammar';
import { clinicalDarkTheme, clinicalLightTheme } from '@/lib/cql/clinical-dark-theme';
import { Loader2, Sun, Moon, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for Monaco
type Monaco = typeof import('monaco-editor');
type IStandaloneCodeEditor = MonacoEditor.IStandaloneCodeEditor;

export interface MonacoWrapperProps {
  value: string;
  onChange?: (value: string) => void;
  onMount?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
  height?: string | number;
  theme?: 'clinical-dark' | 'clinical-light';
  readOnly?: boolean;
  showMinimap?: boolean;
  showLineNumbers?: boolean;
  fontSize?: number;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  className?: string;
  compilationStatus?: 'idle' | 'compiling' | 'success' | 'error';
  compilationTime?: number | null;
  errorCount?: number;
  warningCount?: number;
  onThemeChange?: (theme: 'clinical-dark' | 'clinical-light') => void;
}

// Pre-configure Monaco loader
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
  },
});

export function MonacoWrapper({
  value,
  onChange,
  onMount,
  height = '500px',
  theme = 'clinical-dark',
  readOnly = false,
  showMinimap = true,
  showLineNumbers = true,
  fontSize = 14,
  wordWrap = 'on',
  className,
  compilationStatus = 'idle',
  compilationTime,
  errorCount = 0,
  warningCount = 0,
  onThemeChange,
}: MonacoWrapperProps) {
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const completionDisposableRef = useRef<IDisposable | null>(null);

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(theme);

  // Register CQL language and theme
  const registerCqlLanguage = useCallback((monaco: Monaco) => {
    // Check if language is already registered
    const languages = monaco.languages.getLanguages();
    const cqlRegistered = languages.some((lang) => lang.id === 'cql');

    if (!cqlRegistered) {
      // Register CQL language
      monaco.languages.register({
        id: 'cql',
        extensions: ['.cql'],
        aliases: ['CQL', 'Clinical Quality Language'],
        mimetypes: ['text/x-cql'],
      });

      // Set Monarch tokens
      monaco.languages.setMonarchTokensProvider('cql', cqlMonarchLanguage);

      // Set language configuration
      monaco.languages.setLanguageConfiguration('cql', cqlLanguageConfiguration);

      // Register completion provider
      completionDisposableRef.current = monaco.languages.registerCompletionItemProvider('cql', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const suggestions: languages.CompletionItem[] = [];

          // Add keyword suggestions
          cqlCompletionItemProvider.keywords.forEach((keyword) => {
            suggestions.push({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range,
              detail: 'CQL Keyword',
            });
          });

          // Add type suggestions
          cqlCompletionItemProvider.types.forEach((type) => {
            suggestions.push({
              label: type,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: type,
              range,
              detail: 'CQL Type',
            });
          });

          // Add function suggestions with snippets
          cqlCompletionItemProvider.functions.forEach((func) => {
            suggestions.push({
              label: func,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: `${func}($1)`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'CQL Function',
            });
          });

          // Add FHIR resource suggestions
          cqlCompletionItemProvider.fhirResources.forEach((resource) => {
            suggestions.push({
              label: resource,
              kind: monaco.languages.CompletionItemKind.Struct,
              insertText: resource,
              range,
              detail: 'FHIR Resource',
            });
          });

          // Add common snippets
          const snippets = [
            {
              label: 'library',
              insertText: 'library ${1:LibraryName} version \'${2:1.0.0}\'\n\nusing FHIR version \'4.0.1\'\n\ninclude FHIRHelpers version \'4.0.1\' called FHIRHelpers\n\ncontext Patient\n\n$0',
              documentation: 'Create a new CQL library with FHIR setup',
            },
            {
              label: 'define',
              insertText: 'define "${1:DefinitionName}":\n  $0',
              documentation: 'Create a new definition',
            },
            {
              label: 'define-function',
              insertText: 'define function "${1:FunctionName}"(${2:param Type}):\n  $0',
              documentation: 'Create a new function',
            },
            {
              label: 'valueset',
              insertText: 'valueset "${1:ValueSet Name}": \'http://cts.nlm.nih.gov/fhir/ValueSet/${2:OID}\'',
              documentation: 'Declare a value set reference',
            },
            {
              label: 'retrieve',
              insertText: '[${1:ResourceType}: ${2:valueSetReference}]',
              documentation: 'FHIR resource retrieve expression',
            },
            {
              label: 'interval',
              insertText: 'Interval[@${1:2024}-01-01T00:00:00.0, @${2:2025}-01-01T00:00:00.0)',
              documentation: 'Create a date/time interval',
            },
            {
              label: 'exists',
              insertText: 'exists (\n  $0\n)',
              documentation: 'Check if a list has any elements',
            },
            {
              label: 'where',
              insertText: 'where ${1:condition}',
              documentation: 'Filter expression',
            },
          ];

          snippets.forEach((snippet) => {
            suggestions.push({
              label: snippet.label,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: snippet.insertText,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'CQL Snippet',
              documentation: snippet.documentation,
            });
          });

          return { suggestions };
        },
      });
    }

    // Define themes
    monaco.editor.defineTheme('clinical-dark', clinicalDarkTheme);
    monaco.editor.defineTheme('clinical-light', clinicalLightTheme);
  }, []);

  // Handle editor mount
  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register CQL language
    registerCqlLanguage(monaco);

    // Set theme
    monaco.editor.setTheme(currentTheme);

    // Configure editor options
    editor.updateOptions({
      fontSize,
      minimap: { enabled: showMinimap },
      lineNumbers: showLineNumbers ? 'on' : 'off',
      wordWrap,
      readOnly,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      folding: true,
      foldingHighlight: true,
      showFoldingControls: 'always',
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showClasses: true,
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      parameterHints: { enabled: true },
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save action - could be customized
      console.log('Save triggered');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      // Format action
      editor.getAction('editor.action.formatDocument')?.run();
    });

    setIsEditorReady(true);

    // Call onMount callback
    if (onMount) {
      onMount(editor, monaco);
    }
  }, [currentTheme, fontSize, showMinimap, showLineNumbers, wordWrap, readOnly, registerCqlLanguage, onMount]);

  // Handle content changes
  const handleEditorChange: OnChange = useCallback((value) => {
    if (onChange && value !== undefined) {
      onChange(value);
    }
  }, [onChange]);

  // Update theme
  useEffect(() => {
    if (monacoRef.current && isEditorReady) {
      monacoRef.current.editor.setTheme(currentTheme);
    }
  }, [currentTheme, isEditorReady]);

  // Update editor options when props change
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      editorRef.current.updateOptions({
        fontSize,
        minimap: { enabled: showMinimap },
        lineNumbers: showLineNumbers ? 'on' : 'off',
        wordWrap,
        readOnly,
      });
    }
  }, [fontSize, showMinimap, showLineNumbers, wordWrap, readOnly, isEditorReady]);

  // Theme toggle handler
  const handleThemeToggle = () => {
    const newTheme = currentTheme === 'clinical-dark' ? 'clinical-light' : 'clinical-dark';
    setCurrentTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (completionDisposableRef.current) {
        completionDisposableRef.current.dispose();
      }
    };
  }, []);

  // Status bar renderer
  const renderStatusBar = () => {
    const statusConfig = {
      idle: { icon: null, text: 'Ready', className: 'text-muted-foreground' },
      compiling: { icon: <Loader2 className="w-3 h-3 animate-spin" />, text: 'Compiling...', className: 'text-blue-500' },
      success: { icon: <CheckCircle2 className="w-3 h-3" />, text: 'Valid', className: 'text-green-500' },
      error: { icon: <AlertCircle className="w-3 h-3" />, text: `${errorCount} error${errorCount !== 1 ? 's' : ''}`, className: 'text-red-500' },
    };

    const status = statusConfig[compilationStatus];

    return (
      <div className={cn(
        'flex items-center justify-between px-3 py-1.5 text-xs border-t',
        currentTheme === 'clinical-dark' ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
      )}>
        <div className="flex items-center gap-4">
          {/* Compilation status */}
          <div className={cn('flex items-center gap-1.5', status.className)}>
            {status.icon}
            <span>{status.text}</span>
          </div>

          {/* Warnings */}
          {warningCount > 0 && (
            <div className="flex items-center gap-1 text-amber-500">
              <AlertCircle className="w-3 h-3" />
              <span>{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Compilation time */}
          {compilationTime !== null && compilationTime !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{compilationTime.toFixed(0)}ms</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Language indicator */}
          <span className="text-muted-foreground">CQL</span>

          {/* Theme toggle */}
          <button
            onClick={handleThemeToggle}
            className={cn(
              'p-1 rounded hover:bg-opacity-20',
              currentTheme === 'clinical-dark' ? 'hover:bg-white' : 'hover:bg-black'
            )}
            title={`Switch to ${currentTheme === 'clinical-dark' ? 'light' : 'dark'} theme`}
          >
            {currentTheme === 'clinical-dark' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col rounded-lg overflow-hidden border', className,
      currentTheme === 'clinical-dark' ? 'border-slate-700' : 'border-slate-200'
    )}>
      {/* Editor */}
      <div style={{ height }} className="relative">
        <Editor
          language="cql"
          value={value}
          theme={currentTheme}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full bg-slate-900">
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading CQL Editor...</span>
              </div>
            </div>
          }
          options={{
            fontSize,
            minimap: { enabled: showMinimap },
            lineNumbers: showLineNumbers ? 'on' : 'off',
            wordWrap,
            readOnly,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Status bar */}
      {renderStatusBar()}
    </div>
  );
}

export default MonacoWrapper;
