/**
 * Export Service
 * Handles packaging CQL and ELM into FHIR Library resources and bundles
 */

import { saveAs } from 'file-saver';

/**
 * Generate a UUID v4 for FHIR resource IDs
 * Medplum and other FHIR servers expect proper UUIDs
 */
function generateUUID(): string {
  // Use crypto.randomUUID if available (browser and Node 19+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// FHIR Library resource structure
export interface FhirLibrary {
  resourceType: 'Library';
  id?: string;
  meta?: {
    profile?: string[];
  };
  url?: string;
  identifier?: Array<{
    system: string;
    value: string;
  }>;
  version: string;
  name: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  experimental?: boolean;
  type: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  };
  date?: string;
  publisher?: string;
  description?: string;
  content: Array<{
    contentType: string;
    data?: string;
    url?: string;
    title?: string;
  }>;
  relatedArtifact?: Array<{
    type: string;
    display?: string;
    resource?: string;
  }>;
  parameter?: Array<{
    name: string;
    use: 'in' | 'out';
    min: number;
    max: string;
    type: string;
  }>;
  dataRequirement?: Array<{
    type: string;
    profile?: string[];
    codeFilter?: Array<{
      path: string;
      valueSet?: string;
    }>;
  }>;
}

// Generic FHIR Resource type
export interface FhirResource {
  resourceType: string;
  id?: string;
  [key: string]: unknown;
}

// FHIR Bundle for export
export interface FhirBundle {
  resourceType: 'Bundle';
  id?: string;
  type: 'collection' | 'transaction' | 'batch';
  timestamp?: string;
  entry: Array<{
    fullUrl?: string;
    resource: FhirLibrary | FhirResource;
    request?: {
      method: 'POST' | 'PUT' | 'DELETE';
      url: string;
    };
  }>;
}

export interface ExportOptions {
  libraryName: string;
  libraryVersion: string;
  title?: string;
  description?: string;
  publisher?: string;
  status?: 'draft' | 'active' | 'retired' | 'unknown';
  experimental?: boolean;
  baseUrl?: string;
  valueSets?: Array<{ name: string; oid: string }>;
  scoringType?: 'proportion' | 'ratio' | 'continuous-variable' | 'cohort';
}

/**
 * Generate a FHIR Library resource from CQL and ELM
 */
export function generateLibraryResource(
  cql: string,
  elm: unknown | null,
  options: ExportOptions
): FhirLibrary {
  const {
    libraryName,
    libraryVersion,
    title,
    description,
    publisher = 'CQL Builder',
    status = 'draft',
    experimental = true,
    baseUrl = 'http://example.org/fhir',
    valueSets = [],
  } = options;

  // Sanitize library name for use in URLs and identifiers
  const sanitizedName = libraryName.replace(/[^a-zA-Z0-9-]/g, '');

  // Base64 encode the CQL content
  const cqlBase64 = btoa(unescape(encodeURIComponent(cql)));

  // Generate UUID for the resource ID (required by Medplum and other FHIR servers)
  const resourceId = generateUUID();

  // Build the Library resource
  const library: FhirLibrary = {
    resourceType: 'Library',
    id: resourceId,
    meta: {
      profile: [
        'http://hl7.org/fhir/uv/cql/StructureDefinition/cql-library',
      ],
    },
    url: `${baseUrl}/Library/${sanitizedName}`,
    identifier: [
      {
        system: `${baseUrl}/Library`,
        value: sanitizedName,
      },
    ],
    version: libraryVersion,
    name: sanitizedName,
    title: title || libraryName,
    status,
    experimental,
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/library-type',
          code: 'logic-library',
          display: 'Logic Library',
        },
      ],
    },
    date: new Date().toISOString(),
    publisher,
    description: description || `Generated CQL library: ${libraryName}`,
    content: [
      {
        contentType: 'text/cql',
        data: cqlBase64,
        title: `${sanitizedName}.cql`,
      },
    ],
  };

  // Add ELM content if available
  if (elm) {
    const elmJson = JSON.stringify(elm);
    const elmBase64 = btoa(unescape(encodeURIComponent(elmJson)));
    library.content.push({
      contentType: 'application/elm+json',
      data: elmBase64,
      title: `${sanitizedName}.json`,
    });
  }

  // Add related artifacts for value sets
  if (valueSets.length > 0) {
    library.relatedArtifact = valueSets.map((vs) => ({
      type: 'depends-on',
      display: vs.name,
      resource: vs.oid.startsWith('http')
        ? vs.oid
        : `http://cts.nlm.nih.gov/fhir/ValueSet/${vs.oid}`,
    }));
  }

  // Add standard parameters
  library.parameter = [
    {
      name: 'Measurement Period',
      use: 'in',
      min: 0,
      max: '1',
      type: 'Period',
    },
    {
      name: 'Patient',
      use: 'out',
      min: 0,
      max: '1',
      type: 'Patient',
    },
  ];

  return library;
}

/**
 * Generate a FHIR Bundle containing the Library and related resources
 */
export function generateFhirBundle(
  library: FhirLibrary,
  options: {
    bundleType?: 'collection' | 'transaction';
    includeValueSets?: boolean;
  } = {}
): FhirBundle {
  const { bundleType = 'collection' } = options;

  const bundle: FhirBundle = {
    resourceType: 'Bundle',
    id: `${library.id}-bundle`,
    type: bundleType,
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: library.url,
        resource: library,
        ...(bundleType === 'transaction' && {
          request: {
            method: 'PUT',
            url: `Library/${library.id}`,
          },
        }),
      },
    ],
  };

  return bundle;
}

/**
 * Download CQL file
 */
export function downloadCQL(cql: string, filename: string): void {
  const blob = new Blob([cql], { type: 'text/plain;charset=utf-8' });
  const finalFilename = filename.endsWith('.cql') ? filename : `${filename}.cql`;
  saveAs(blob, finalFilename);
}

/**
 * Download ELM JSON file
 */
export function downloadELM(elm: unknown, filename: string): void {
  const content = JSON.stringify(elm, null, 2);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  saveAs(blob, finalFilename);
}

/**
 * Download FHIR Library resource
 */
export function downloadLibrary(library: FhirLibrary, filename: string): void {
  const content = JSON.stringify(library, null, 2);
  const blob = new Blob([content], { type: 'application/fhir+json;charset=utf-8' });
  const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  saveAs(blob, finalFilename);
}

/**
 * Download FHIR Bundle
 */
export function downloadBundle(bundle: FhirBundle, filename: string): void {
  const content = JSON.stringify(bundle, null, 2);
  const blob = new Blob([content], { type: 'application/fhir+json;charset=utf-8' });
  const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  saveAs(blob, finalFilename);
}

/**
 * Download all artifacts as a zip file (requires JSZip in production)
 * For MVP, we'll provide individual downloads
 */
export interface ExportArtifacts {
  cql: string;
  elm: unknown | null;
  library: FhirLibrary;
  bundle: FhirBundle;
}

export function generateAllArtifacts(
  cql: string,
  elm: unknown | null,
  options: ExportOptions
): ExportArtifacts {
  const library = generateLibraryResource(cql, elm, options);
  const bundle = generateFhirBundle(library);

  return {
    cql,
    elm,
    library,
    bundle,
  };
}

/**
 * Export all artifacts (multiple file downloads)
 */
export function exportAllArtifacts(
  artifacts: ExportArtifacts,
  baseFilename: string
): void {
  // Download CQL
  downloadCQL(artifacts.cql, `${baseFilename}.cql`);

  // Download ELM if available
  if (artifacts.elm) {
    downloadELM(artifacts.elm, `${baseFilename}-elm.json`);
  }

  // Download Library
  downloadLibrary(artifacts.library, `${baseFilename}-library.json`);

  // Download Bundle
  downloadBundle(artifacts.bundle, `${baseFilename}-bundle.json`);
}

/**
 * Create a Measure resource that references the Library
 */
export interface FhirMeasure extends FhirResource {
  resourceType: 'Measure';
  id: string;
  url: string;
  version: string;
  name: string;
  title: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  experimental: boolean;
  date: string;
  publisher: string;
  description?: string;
  library: string[];
  scoring: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  group: Array<{
    population: Array<{
      code: {
        coding: Array<{
          system: string;
          code: string;
          display: string;
        }>;
      };
      criteria: {
        language: string;
        expression: string;
      };
    }>;
  }>;
}

export function generateMeasureResource(
  libraryUrl: string,
  options: ExportOptions & {
    scoringType?: 'proportion' | 'ratio' | 'continuous-variable' | 'cohort';
    populations?: {
      initialPopulation?: string;
      denominator?: string;
      denominatorExclusion?: string;
      numerator?: string;
      numeratorExclusion?: string;
    };
  }
): FhirMeasure {
  const {
    libraryName,
    libraryVersion,
    title,
    description,
    publisher = 'CQL Builder',
    status = 'draft',
    baseUrl = 'http://example.org/fhir',
    scoringType = 'proportion',
    populations = {},
  } = options;

  const sanitizedName = libraryName.replace(/[^a-zA-Z0-9-]/g, '');

  // Generate UUID for the resource ID (required by Medplum and other FHIR servers)
  const resourceId = generateUUID();

  const scoringDisplay: Record<string, string> = {
    proportion: 'Proportion',
    ratio: 'Ratio',
    'continuous-variable': 'Continuous Variable',
    cohort: 'Cohort',
  };

  const measure: FhirMeasure = {
    resourceType: 'Measure',
    id: resourceId,
    url: `${baseUrl}/Measure/${sanitizedName}Measure`,
    version: libraryVersion,
    name: `${sanitizedName}Measure`,
    title: title ? `${title} Measure` : `${libraryName} Measure`,
    status,
    experimental: true,
    date: new Date().toISOString(),
    publisher,
    description: description || `Measure for ${libraryName}`,
    library: [libraryUrl],
    scoring: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/measure-scoring',
          code: scoringType,
          display: scoringDisplay[scoringType] || 'Proportion',
        },
      ],
    },
    group: [
      {
        population: [
          {
            code: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                  code: 'initial-population',
                  display: 'Initial Population',
                },
              ],
            },
            criteria: {
              language: 'text/cql-identifier',
              expression: populations.initialPopulation || 'Initial Population',
            },
          },
          {
            code: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                  code: 'denominator',
                  display: 'Denominator',
                },
              ],
            },
            criteria: {
              language: 'text/cql-identifier',
              expression: populations.denominator || 'Denominator',
            },
          },
          {
            code: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                  code: 'denominator-exclusion',
                  display: 'Denominator Exclusion',
                },
              ],
            },
            criteria: {
              language: 'text/cql-identifier',
              expression: populations.denominatorExclusion || 'Denominator Exclusions',
            },
          },
          {
            code: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                  code: 'numerator',
                  display: 'Numerator',
                },
              ],
            },
            criteria: {
              language: 'text/cql-identifier',
              expression: populations.numerator || 'Numerator',
            },
          },
          {
            code: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/measure-population',
                  code: 'numerator-exclusion',
                  display: 'Numerator Exclusion',
                },
              ],
            },
            criteria: {
              language: 'text/cql-identifier',
              expression: populations.numeratorExclusion || 'Numerator Exclusions',
            },
          },
        ],
      },
    ],
  };

  return measure;
}

/**
 * Generate a complete measure bundle with Library and Measure resources
 */
export function generateMeasureBundle(
  cql: string,
  elm: unknown | null,
  options: ExportOptions & {
    scoringType?: 'proportion' | 'ratio' | 'continuous-variable' | 'cohort';
  }
): FhirBundle {
  const library = generateLibraryResource(cql, elm, options);
  const measure = generateMeasureResource(library.url || '', options);

  const bundle: FhirBundle = {
    resourceType: 'Bundle',
    id: `${library.id}-measure-bundle`,
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: library.url,
        resource: library,
      },
      {
        fullUrl: measure.url,
        resource: measure,
      },
    ],
  };

  return bundle;
}

/**
 * Download complete measure bundle
 */
export function downloadMeasureBundle(
  cql: string,
  elm: unknown | null,
  options: ExportOptions,
  filename: string
): void {
  const bundle = generateMeasureBundle(cql, elm, options);
  const content = JSON.stringify(bundle, null, 2);
  const blob = new Blob([content], { type: 'application/fhir+json;charset=utf-8' });
  const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  saveAs(blob, finalFilename);
}
