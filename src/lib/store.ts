import { create } from 'zustand';
import type {
  MeasureRequirement,
  MeasureType,
  MeasureScoringType,
  ValueSetReference,
  EvidenceReference,
  GeneratedCQL,
} from '@/types/cql';

export type ConversationStep =
  | 'welcome'
  | 'purpose'
  | 'problem'
  | 'measure-type'
  | 'scoring-type'
  | 'value-sets'
  | 'evidence'
  | 'additional-details'
  | 'generating'
  | 'review';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface CQLBuilderState {
  // Conversation state
  currentStep: ConversationStep;
  messages: Message[];
  isProcessing: boolean;

  // Measure requirements being built
  requirements: Partial<MeasureRequirement>;

  // Generated output
  generatedCQL: GeneratedCQL | null;

  // Actions
  setStep: (step: ConversationStep) => void;
  addMessage: (role: 'assistant' | 'user', content: string) => void;
  setProcessing: (processing: boolean) => void;
  updateRequirements: (updates: Partial<MeasureRequirement>) => void;
  setGeneratedCQL: (cql: GeneratedCQL | null) => void;
  reset: () => void;

  // Derived actions
  setPurpose: (purpose: string) => void;
  setProblem: (problem: string) => void;
  setMeasureType: (type: MeasureType) => void;
  setScoringType: (type: MeasureScoringType) => void;
  addValueSet: (valueSet: ValueSetReference) => void;
  removeValueSet: (oid: string) => void;
  addEvidence: (evidence: EvidenceReference) => void;
  removeEvidence: (title: string) => void;
}

const initialState = {
  currentStep: 'welcome' as ConversationStep,
  messages: [],
  isProcessing: false,
  requirements: {},
  generatedCQL: null,
};

export const useCQLBuilderStore = create<CQLBuilderState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          role,
          content,
          timestamp: new Date(),
        },
      ],
    })),

  setProcessing: (processing) => set({ isProcessing: processing }),

  updateRequirements: (updates) =>
    set((state) => ({
      requirements: { ...state.requirements, ...updates },
    })),

  setGeneratedCQL: (cql) => set({ generatedCQL: cql }),

  reset: () => set(initialState),

  // Derived actions
  setPurpose: (purpose) => {
    get().updateRequirements({ purpose });
  },

  setProblem: (problem) => {
    get().updateRequirements({ problemStatement: problem });
  },

  setMeasureType: (type) => {
    get().updateRequirements({ measureType: type });
  },

  setScoringType: (type) => {
    get().updateRequirements({ scoringType: type });
  },

  addValueSet: (valueSet) => {
    const current = get().requirements.valueSets || [];
    if (!current.find((vs) => vs.oid === valueSet.oid)) {
      get().updateRequirements({ valueSets: [...current, valueSet] });
    }
  },

  removeValueSet: (oid) => {
    const current = get().requirements.valueSets || [];
    get().updateRequirements({
      valueSets: current.filter((vs) => vs.oid !== oid),
    });
  },

  addEvidence: (evidence) => {
    const current = get().requirements.evidenceReferences || [];
    get().updateRequirements({ evidenceReferences: [...current, evidence] });
  },

  removeEvidence: (title) => {
    const current = get().requirements.evidenceReferences || [];
    get().updateRequirements({
      evidenceReferences: current.filter((e) => e.title !== title),
    });
  },
}));
