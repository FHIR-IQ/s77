/**
 * FHIR Server Store
 * Zustand store for managing FHIR server configurations with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FhirServerConfig, FhirServerType } from './fhir-server-service';
import { createServerFromPreset, generateServerId } from './fhir-server-service';

interface FhirServerState {
  // Configured servers
  servers: FhirServerConfig[];

  // Currently selected server for uploads
  activeServerId: string | null;

  // Actions
  addServer: (server: FhirServerConfig) => void;
  updateServer: (id: string, updates: Partial<FhirServerConfig>) => void;
  removeServer: (id: string) => void;
  setActiveServer: (id: string | null) => void;
  addServerFromPreset: (type: FhirServerType) => FhirServerConfig;
  getActiveServer: () => FhirServerConfig | null;
  clearAll: () => void;
}

export const useFhirServerStore = create<FhirServerState>()(
  persist(
    (set, get) => ({
      servers: [],
      activeServerId: null,

      addServer: (server) =>
        set((state) => ({
          servers: [...state.servers, server],
          // Auto-select if this is the first server
          activeServerId: state.activeServerId || server.id,
        })),

      updateServer: (id, updates) =>
        set((state) => ({
          servers: state.servers.map((server) =>
            server.id === id ? { ...server, ...updates } : server
          ),
        })),

      removeServer: (id) =>
        set((state) => {
          const newServers = state.servers.filter((s) => s.id !== id);
          return {
            servers: newServers,
            // Clear active if removed
            activeServerId:
              state.activeServerId === id
                ? newServers[0]?.id || null
                : state.activeServerId,
          };
        }),

      setActiveServer: (id) =>
        set({ activeServerId: id }),

      addServerFromPreset: (type) => {
        const server = createServerFromPreset(type);
        get().addServer(server);
        return server;
      },

      getActiveServer: () => {
        const state = get();
        if (!state.activeServerId) return null;
        return state.servers.find((s) => s.id === state.activeServerId) || null;
      },

      clearAll: () =>
        set({
          servers: [],
          activeServerId: null,
        }),
    }),
    {
      name: 'fhir-server-config',
      // Don't persist sensitive credentials in localStorage
      partialize: (state) => ({
        servers: state.servers.map((server) => ({
          ...server,
          // Clear sensitive fields from persistence
          password: undefined,
          accessToken: undefined,
          clientSecret: undefined,
        })),
        activeServerId: state.activeServerId,
      }),
    }
  )
);
