/**
 * FHIR Server Service
 * Handles connections to FHIR servers (Medplum, Fire Metrics, etc.) and
 * uploading Library and Measure FHIR resources
 */

import { FhirLibrary, FhirMeasure, FhirBundle } from './export-service';

// FHIR Server configuration types
export type FhirServerType = 'medplum' | 'firemetrics' | 'hapi' | 'custom';

export interface FhirServerConfig {
  id: string;
  name: string;
  type: FhirServerType;
  baseUrl: string;
  authType: 'none' | 'basic' | 'bearer' | 'client-credentials';
  // For basic auth
  username?: string;
  password?: string;
  // For bearer token
  accessToken?: string;
  // For client credentials (OAuth2)
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
}

export interface FhirServerConnectionResult {
  success: boolean;
  message: string;
  serverInfo?: {
    name?: string;
    version?: string;
    fhirVersion?: string;
  };
}

export interface FhirUploadResult {
  success: boolean;
  message: string;
  resourceId?: string;
  resourceUrl?: string;
  error?: string;
}

export interface FhirBundleUploadResult {
  success: boolean;
  message: string;
  libraryResult?: FhirUploadResult;
  measureResult?: FhirUploadResult;
}

// Default server presets
export const FHIR_SERVER_PRESETS: Record<FhirServerType, Partial<FhirServerConfig>> = {
  medplum: {
    type: 'medplum',
    name: 'Medplum',
    baseUrl: 'https://api.medplum.com/fhir/R4',
    authType: 'client-credentials',
    tokenUrl: 'https://api.medplum.com/oauth2/token',
  },
  firemetrics: {
    type: 'firemetrics',
    name: 'Fire Metrics',
    baseUrl: 'https://fhir.fire-metrics.com/fhir/R4',
    authType: 'bearer',
  },
  hapi: {
    type: 'hapi',
    name: 'HAPI FHIR',
    baseUrl: 'http://hapi.fhir.org/baseR4',
    authType: 'none',
  },
  custom: {
    type: 'custom',
    name: 'Custom FHIR Server',
    baseUrl: '',
    authType: 'none',
  },
};

/**
 * Test connection to a FHIR server by fetching its capability statement
 * Uses the API route to avoid CORS issues
 */
export async function testFhirServerConnection(
  config: FhirServerConfig
): Promise<FhirServerConnectionResult> {
  try {
    // Use the API route to proxy the request
    const response = await fetch('/api/fhir-server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test',
        serverConfig: {
          baseUrl: config.baseUrl,
          authType: config.authType,
          username: config.username,
          password: config.password,
          accessToken: config.accessToken,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          tokenUrl: config.tokenUrl,
        },
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Upload a single FHIR resource to the server
 * Uses the API route to avoid CORS issues
 */
export async function uploadFhirResource(
  config: FhirServerConfig,
  resource: FhirLibrary | FhirMeasure
): Promise<FhirUploadResult> {
  try {
    // Use the API route to proxy the request
    const response = await fetch('/api/fhir-server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upload',
        serverConfig: {
          baseUrl: config.baseUrl,
          authType: config.authType,
          username: config.username,
          password: config.password,
          accessToken: config.accessToken,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          tokenUrl: config.tokenUrl,
        },
        resource,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      message: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload a FHIR Bundle containing Library and Measure resources
 * Uses the API route to avoid CORS issues
 */
export async function uploadFhirBundle(
  config: FhirServerConfig,
  bundle: FhirBundle
): Promise<FhirBundleUploadResult> {
  try {
    // Convert collection bundle to transaction bundle for batch upload
    const transactionBundle: FhirBundle = {
      ...bundle,
      type: 'transaction',
      entry: bundle.entry.map((entry) => ({
        ...entry,
        request: {
          method: 'PUT',
          url: `${entry.resource.resourceType}/${entry.resource.id}`,
        },
      })),
    };

    // Use the API route to proxy the request
    const response = await fetch('/api/fhir-server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upload-bundle',
        serverConfig: {
          baseUrl: config.baseUrl,
          authType: config.authType,
          username: config.username,
          password: config.password,
          accessToken: config.accessToken,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          tokenUrl: config.tokenUrl,
        },
        bundle: transactionBundle,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      message: `Bundle upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Upload Library and Measure resources individually (for servers that don't support bundles)
 */
export async function uploadLibraryAndMeasure(
  config: FhirServerConfig,
  library: FhirLibrary,
  measure: FhirMeasure
): Promise<FhirBundleUploadResult> {
  // Upload Library first (Measure depends on it)
  const libraryResult = await uploadFhirResource(config, library);

  if (!libraryResult.success) {
    return {
      success: false,
      message: `Failed to upload Library: ${libraryResult.error}`,
      libraryResult,
    };
  }

  // Then upload Measure
  const measureResult = await uploadFhirResource(config, measure);

  if (!measureResult.success) {
    return {
      success: false,
      message: `Library uploaded but Measure failed: ${measureResult.error}`,
      libraryResult,
      measureResult,
    };
  }

  return {
    success: true,
    message: 'Library and Measure uploaded successfully',
    libraryResult,
    measureResult,
  };
}

/**
 * Generate a unique server configuration ID
 */
export function generateServerId(): string {
  return `fhir-server-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a new server configuration from a preset
 */
export function createServerFromPreset(type: FhirServerType): FhirServerConfig {
  const preset = FHIR_SERVER_PRESETS[type];
  return {
    id: generateServerId(),
    name: preset.name || 'New Server',
    type,
    baseUrl: preset.baseUrl || '',
    authType: preset.authType || 'none',
    tokenUrl: preset.tokenUrl,
  };
}
