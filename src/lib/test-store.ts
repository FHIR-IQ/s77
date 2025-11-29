/**
 * Test Case Store - Zustand store for managing CQL test cases
 * Persists test cases to localStorage for offline use
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// FHIR Resource types for patient builder
export interface FhirPatient {
  resourceType: 'Patient';
  id: string;
  name?: Array<{
    use?: string;
    family?: string;
    given?: string[];
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    city?: string;
    state?: string;
    postalCode?: string;
  }>;
}

export interface FhirCondition {
  resourceType: 'Condition';
  id: string;
  subject: { reference: string };
  code: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  };
  clinicalStatus?: {
    coding: Array<{
      system: string;
      code: string;
    }>;
  };
  verificationStatus?: {
    coding: Array<{
      system: string;
      code: string;
    }>;
  };
  onsetDateTime?: string;
  recordedDate?: string;
}

export interface FhirEncounter {
  resourceType: 'Encounter';
  id: string;
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
  class: {
    system: string;
    code: string;
    display?: string;
  };
  subject: { reference: string };
  period?: {
    start?: string;
    end?: string;
  };
  type?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  }>;
}

export interface FhirMedicationRequest {
  resourceType: 'MedicationRequest';
  id: string;
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  subject: { reference: string };
  medicationCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  };
  authoredOn?: string;
}

export interface FhirObservation {
  resourceType: 'Observation';
  id: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  code: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  };
  subject: { reference: string };
  effectiveDateTime?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
  valueCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  };
}

export type FhirResource = FhirPatient | FhirCondition | FhirEncounter | FhirMedicationRequest | FhirObservation | Record<string, unknown>;

export interface FhirBundle {
  resourceType: 'Bundle';
  type: 'collection' | 'transaction' | 'batch' | 'searchset';
  entry?: Array<{
    resource: FhirResource;
  }>;
}

// Test case types
export interface TestCase {
  id: string;
  name: string;
  description?: string;
  patientBundle: FhirBundle;
  expectedResults?: Record<string, ExpectedResult>;
  createdAt: string;
  updatedAt: string;
}

export interface ExpectedResult {
  expressionName: string;
  expectedValue: unknown;
  comparator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'truthy' | 'falsy' | 'notNull';
}

export interface ExecutionResult {
  testCaseId: string;
  success: boolean;
  results: Record<string, {
    name: string;
    value: unknown;
    formattedValue: string;
    type: string;
    passed?: boolean;
    expected?: unknown;
  }>;
  executionTime: number;
  timestamp: string;
  error?: string;
}

// Store state
interface TestStoreState {
  // Test cases
  testCases: TestCase[];
  activeTestCaseId: string | null;

  // Execution state
  isExecuting: boolean;
  executionResults: ExecutionResult[];
  lastExecutionResult: ExecutionResult | null;

  // UI state
  isPanelOpen: boolean;
  activeTab: 'cases' | 'builder' | 'results' | 'json';

  // Actions - Test cases
  addTestCase: (testCase: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTestCase: (id: string, updates: Partial<Omit<TestCase, 'id' | 'createdAt'>>) => void;
  deleteTestCase: (id: string) => void;
  duplicateTestCase: (id: string) => string | null;
  setActiveTestCase: (id: string | null) => void;
  importTestCase: (json: string) => { success: boolean; error?: string; id?: string };
  exportTestCase: (id: string) => string | null;

  // Actions - Execution
  setExecuting: (executing: boolean) => void;
  addExecutionResult: (result: ExecutionResult) => void;
  clearExecutionResults: () => void;

  // Actions - UI
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  setActiveTab: (tab: TestStoreState['activeTab']) => void;

  // Actions - Patient builder helpers
  createEmptyPatientBundle: (patientId?: string) => FhirBundle;
  addResourceToBundle: (testCaseId: string, resource: FhirResource) => void;
  removeResourceFromBundle: (testCaseId: string, resourceType: string, resourceId: string) => void;

  // Actions - Expected results
  setExpectedResult: (testCaseId: string, expressionName: string, expected: ExpectedResult) => void;
  removeExpectedResult: (testCaseId: string, expressionName: string) => void;
}

// Generate unique ID
function generateId(): string {
  return `tc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Create default patient bundle
function createDefaultPatientBundle(patientId = 'test-patient-1'): FhirBundle {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: patientId,
          name: [
            {
              use: 'official',
              family: 'Test',
              given: ['Patient'],
            },
          ],
          gender: 'unknown',
          birthDate: '1990-01-01',
        } as FhirPatient,
      },
    ],
  };
}

export const useTestStore = create<TestStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      testCases: [],
      activeTestCaseId: null,
      isExecuting: false,
      executionResults: [],
      lastExecutionResult: null,
      isPanelOpen: false,
      activeTab: 'cases',

      // Test case actions
      addTestCase: (testCase) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newTestCase: TestCase = {
          ...testCase,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          testCases: [...state.testCases, newTestCase],
          activeTestCaseId: id,
        }));
        return id;
      },

      updateTestCase: (id, updates) => {
        set((state) => ({
          testCases: state.testCases.map((tc) =>
            tc.id === id
              ? { ...tc, ...updates, updatedAt: new Date().toISOString() }
              : tc
          ),
        }));
      },

      deleteTestCase: (id) => {
        set((state) => ({
          testCases: state.testCases.filter((tc) => tc.id !== id),
          activeTestCaseId: state.activeTestCaseId === id ? null : state.activeTestCaseId,
          executionResults: state.executionResults.filter((r) => r.testCaseId !== id),
        }));
      },

      duplicateTestCase: (id) => {
        const testCase = get().testCases.find((tc) => tc.id === id);
        if (!testCase) return null;

        const newId = generateId();
        const now = new Date().toISOString();
        const duplicated: TestCase = {
          ...testCase,
          id: newId,
          name: `${testCase.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          testCases: [...state.testCases, duplicated],
          activeTestCaseId: newId,
        }));
        return newId;
      },

      setActiveTestCase: (id) => {
        set({ activeTestCaseId: id });
      },

      importTestCase: (json) => {
        try {
          const parsed = JSON.parse(json);

          // Validate basic structure
          if (!parsed.patientBundle || parsed.patientBundle.resourceType !== 'Bundle') {
            return { success: false, error: 'Invalid FHIR Bundle structure' };
          }

          const id = get().addTestCase({
            name: parsed.name || 'Imported Test Case',
            description: parsed.description,
            patientBundle: parsed.patientBundle,
            expectedResults: parsed.expectedResults,
          });

          return { success: true, id };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to parse JSON',
          };
        }
      },

      exportTestCase: (id) => {
        const testCase = get().testCases.find((tc) => tc.id === id);
        if (!testCase) return null;
        return JSON.stringify(testCase, null, 2);
      },

      // Execution actions
      setExecuting: (executing) => {
        set({ isExecuting: executing });
      },

      addExecutionResult: (result) => {
        set((state) => ({
          executionResults: [...state.executionResults, result],
          lastExecutionResult: result,
        }));
      },

      clearExecutionResults: () => {
        set({ executionResults: [], lastExecutionResult: null });
      },

      // UI actions
      togglePanel: () => {
        set((state) => ({ isPanelOpen: !state.isPanelOpen }));
      },

      setPanelOpen: (open) => {
        set({ isPanelOpen: open });
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      // Patient builder helpers
      createEmptyPatientBundle: (patientId) => {
        return createDefaultPatientBundle(patientId);
      },

      addResourceToBundle: (testCaseId, resource) => {
        set((state) => ({
          testCases: state.testCases.map((tc) => {
            if (tc.id !== testCaseId) return tc;

            const entries = tc.patientBundle.entry || [];
            return {
              ...tc,
              patientBundle: {
                ...tc.patientBundle,
                entry: [...entries, { resource }],
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeResourceFromBundle: (testCaseId, resourceType, resourceId) => {
        set((state) => ({
          testCases: state.testCases.map((tc) => {
            if (tc.id !== testCaseId) return tc;

            return {
              ...tc,
              patientBundle: {
                ...tc.patientBundle,
                entry: tc.patientBundle.entry?.filter(
                  (e) => !(e.resource.resourceType === resourceType && (e.resource as { id?: string }).id === resourceId)
                ),
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Expected results actions
      setExpectedResult: (testCaseId, expressionName, expected) => {
        set((state) => ({
          testCases: state.testCases.map((tc) => {
            if (tc.id !== testCaseId) return tc;

            return {
              ...tc,
              expectedResults: {
                ...tc.expectedResults,
                [expressionName]: expected,
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeExpectedResult: (testCaseId, expressionName) => {
        set((state) => ({
          testCases: state.testCases.map((tc) => {
            if (tc.id !== testCaseId) return tc;

            const { [expressionName]: _, ...rest } = tc.expectedResults || {};
            return {
              ...tc,
              expectedResults: rest,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: 'cql-test-cases',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        testCases: state.testCases,
        activeTestCaseId: state.activeTestCaseId,
      }),
    }
  )
);

// Sample test cases for demo
export const SAMPLE_TEST_CASES: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Adult Patient - Age 45',
    description: 'Test case for adult patient eligibility',
    patientBundle: {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'patient-001',
            name: [{ use: 'official', family: 'Smith', given: ['John'] }],
            gender: 'male',
            birthDate: '1979-06-15',
          } as FhirPatient,
        },
        {
          resource: {
            resourceType: 'Condition',
            id: 'condition-001',
            subject: { reference: 'Patient/patient-001' },
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '73211009',
                  display: 'Diabetes mellitus',
                },
              ],
            },
            clinicalStatus: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'active',
                },
              ],
            },
            onsetDateTime: '2020-03-01',
          } as FhirCondition,
        },
      ],
    },
    expectedResults: {
      'Initial Population': {
        expressionName: 'Initial Population',
        expectedValue: true,
        comparator: 'equals',
      },
    },
  },
  {
    name: 'Pediatric Patient - Age 8',
    description: 'Test case for pediatric exclusion',
    patientBundle: {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'patient-002',
            name: [{ use: 'official', family: 'Johnson', given: ['Emma'] }],
            gender: 'female',
            birthDate: '2016-09-20',
          } as FhirPatient,
        },
      ],
    },
    expectedResults: {
      'Initial Population': {
        expressionName: 'Initial Population',
        expectedValue: false,
        comparator: 'equals',
      },
    },
  },
];
