'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { editor } from 'monaco-editor';

// Types for compilation annotations/markers
export interface CqlAnnotation {
  row: number;
  col: number;
  endRow?: number;
  endCol?: number;
  text: string;
  type: 'error' | 'warning' | 'info';
}

// Types for ELM output
export interface ElmLibrary {
  library: {
    identifier: {
      id: string;
      version?: string;
    };
    schemaIdentifier?: {
      id: string;
      version: string;
    };
    usings?: {
      def: Array<{
        localIdentifier: string;
        uri: string;
        version?: string;
      }>;
    };
    includes?: {
      def: Array<{
        localIdentifier: string;
        path: string;
        version?: string;
      }>;
    };
    parameters?: {
      def: Array<{
        name: string;
        accessLevel: string;
        parameterTypeSpecifier?: unknown;
        default?: unknown;
      }>;
    };
    valueSets?: {
      def: Array<{
        name: string;
        id: string;
        accessLevel: string;
      }>;
    };
    statements?: {
      def: Array<{
        name: string;
        context: string;
        accessLevel: string;
        expression: unknown;
      }>;
    };
  };
}

// Compilation status
export type CompilationStatus = 'idle' | 'compiling' | 'success' | 'error';

// Editor state
export interface CqlEditorState {
  code: string;
  compilationStatus: CompilationStatus;
  annotations: CqlAnnotation[];
  elm: ElmLibrary | null;
  markers: editor.IMarkerData[];
  lastCompilationTime: number | null;
  editorInstance: editor.IStandaloneCodeEditor | null;
  isDirty: boolean;
  theme: 'clinical-dark' | 'clinical-light';
}

// Actions
type CqlEditorAction =
  | { type: 'SET_CODE'; payload: string }
  | { type: 'SET_COMPILATION_STATUS'; payload: CompilationStatus }
  | { type: 'SET_ANNOTATIONS'; payload: CqlAnnotation[] }
  | { type: 'SET_ELM'; payload: ElmLibrary | null }
  | { type: 'SET_MARKERS'; payload: editor.IMarkerData[] }
  | { type: 'SET_COMPILATION_TIME'; payload: number }
  | { type: 'SET_EDITOR_INSTANCE'; payload: editor.IStandaloneCodeEditor | null }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'clinical-dark' | 'clinical-light' }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET' };

// Initial state
const initialState: CqlEditorState = {
  code: '',
  compilationStatus: 'idle',
  annotations: [],
  elm: null,
  markers: [],
  lastCompilationTime: null,
  editorInstance: null,
  isDirty: false,
  theme: 'clinical-dark',
};

// Reducer
function cqlEditorReducer(state: CqlEditorState, action: CqlEditorAction): CqlEditorState {
  switch (action.type) {
    case 'SET_CODE':
      return {
        ...state,
        code: action.payload,
        isDirty: action.payload !== state.code,
      };
    case 'SET_COMPILATION_STATUS':
      return {
        ...state,
        compilationStatus: action.payload,
      };
    case 'SET_ANNOTATIONS':
      return {
        ...state,
        annotations: action.payload,
      };
    case 'SET_ELM':
      return {
        ...state,
        elm: action.payload,
      };
    case 'SET_MARKERS':
      return {
        ...state,
        markers: action.payload,
      };
    case 'SET_COMPILATION_TIME':
      return {
        ...state,
        lastCompilationTime: action.payload,
      };
    case 'SET_EDITOR_INSTANCE':
      return {
        ...state,
        editorInstance: action.payload,
      };
    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.payload,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        annotations: [],
        markers: [],
        compilationStatus: 'idle',
      };
    case 'RESET':
      return {
        ...initialState,
        theme: state.theme, // Preserve theme preference
      };
    default:
      return state;
  }
}

// Context type
interface CqlEditorContextType {
  state: CqlEditorState;
  setCode: (code: string) => void;
  setCompilationStatus: (status: CompilationStatus) => void;
  setAnnotations: (annotations: CqlAnnotation[]) => void;
  setElm: (elm: ElmLibrary | null) => void;
  setMarkers: (markers: editor.IMarkerData[]) => void;
  setCompilationTime: (time: number) => void;
  setEditorInstance: (editor: editor.IStandaloneCodeEditor | null) => void;
  setDirty: (dirty: boolean) => void;
  setTheme: (theme: 'clinical-dark' | 'clinical-light') => void;
  clearErrors: () => void;
  reset: () => void;
}

// Create context
const CqlEditorContext = createContext<CqlEditorContextType | null>(null);

// Provider component
export function CqlEditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cqlEditorReducer, initialState);

  const setCode = useCallback((code: string) => {
    dispatch({ type: 'SET_CODE', payload: code });
  }, []);

  const setCompilationStatus = useCallback((status: CompilationStatus) => {
    dispatch({ type: 'SET_COMPILATION_STATUS', payload: status });
  }, []);

  const setAnnotations = useCallback((annotations: CqlAnnotation[]) => {
    dispatch({ type: 'SET_ANNOTATIONS', payload: annotations });
  }, []);

  const setElm = useCallback((elm: ElmLibrary | null) => {
    dispatch({ type: 'SET_ELM', payload: elm });
  }, []);

  const setMarkers = useCallback((markers: editor.IMarkerData[]) => {
    dispatch({ type: 'SET_MARKERS', payload: markers });
  }, []);

  const setCompilationTime = useCallback((time: number) => {
    dispatch({ type: 'SET_COMPILATION_TIME', payload: time });
  }, []);

  const setEditorInstance = useCallback((editor: editor.IStandaloneCodeEditor | null) => {
    dispatch({ type: 'SET_EDITOR_INSTANCE', payload: editor });
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    dispatch({ type: 'SET_DIRTY', payload: dirty });
  }, []);

  const setTheme = useCallback((theme: 'clinical-dark' | 'clinical-light') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    state,
    setCode,
    setCompilationStatus,
    setAnnotations,
    setElm,
    setMarkers,
    setCompilationTime,
    setEditorInstance,
    setDirty,
    setTheme,
    clearErrors,
    reset,
  };

  return (
    <CqlEditorContext.Provider value={value}>
      {children}
    </CqlEditorContext.Provider>
  );
}

// Hook to use the context
export function useCqlEditor() {
  const context = useContext(CqlEditorContext);
  if (!context) {
    throw new Error('useCqlEditor must be used within a CqlEditorProvider');
  }
  return context;
}

// Helper function to convert annotations to Monaco markers
export function annotationsToMarkers(
  annotations: CqlAnnotation[],
  model: editor.ITextModel
): editor.IMarkerData[] {
  return annotations.map((annotation) => {
    const severity =
      annotation.type === 'error'
        ? 8 // MarkerSeverity.Error
        : annotation.type === 'warning'
        ? 4 // MarkerSeverity.Warning
        : 2; // MarkerSeverity.Info

    // Calculate end position if not provided
    const endRow = annotation.endRow ?? annotation.row;
    const lineContent = model.getLineContent(annotation.row);
    const endCol = annotation.endCol ?? lineContent.length + 1;

    return {
      severity,
      message: annotation.text,
      startLineNumber: annotation.row,
      startColumn: annotation.col,
      endLineNumber: endRow,
      endColumn: endCol,
      source: 'CQL Compiler',
    };
  });
}
