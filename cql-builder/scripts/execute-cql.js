#!/usr/bin/env node
/**
 * CQL Execution Script
 *
 * Executes CQL/ELM against FHIR patient bundles using:
 * - cql-execution: Core CQL engine
 * - cql-exec-fhir: FHIR R4 patient source
 * - cql-exec-vsac: VSAC value set resolution
 *
 * Usage:
 *   npm run cql:execute -- --elm path/to/library.json --patients path/to/bundles/
 *   npm run cql:execute -- --cql path/to/library.cql --patients path/to/bundles/
 *
 * Environment Variables:
 *   UMLS_API_KEY: Required for VSAC value set resolution
 *
 * References:
 *   - https://github.com/cqframework/cql-execution
 *   - https://github.com/cqframework/cql-exec-fhir
 *   - https://github.com/cqframework/cql-exec-vsac
 */

const fs = require('fs');
const path = require('path');

// These will be imported dynamically to handle ESM modules
let cql, cqlfhir, vsac;

async function loadDependencies() {
  try {
    // cql-execution
    cql = require('cql-execution');
    console.log('✓ Loaded cql-execution');

    // cql-exec-fhir
    cqlfhir = require('cql-exec-fhir');
    console.log('✓ Loaded cql-exec-fhir');

    // cql-exec-vsac
    vsac = require('cql-exec-vsac');
    console.log('✓ Loaded cql-exec-vsac');

    return true;
  } catch (error) {
    console.error('Failed to load dependencies:', error.message);
    console.log('\nMake sure to run: npm install');
    return false;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    elm: null,
    cql: null,
    patients: null,
    vsacCache: './vsac_cache',
    measurementPeriodStart: `${new Date().getFullYear()}-01-01`,
    measurementPeriodEnd: `${new Date().getFullYear() + 1}-01-01`,
    output: null,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--elm':
        options.elm = args[++i];
        break;
      case '--cql':
        options.cql = args[++i];
        break;
      case '--patients':
        options.patients = args[++i];
        break;
      case '--vsac-cache':
        options.vsacCache = args[++i];
        break;
      case '--measurement-period-start':
        options.measurementPeriodStart = args[++i];
        break;
      case '--measurement-period-end':
        options.measurementPeriodEnd = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
CQL Execution Script
====================

Executes CQL/ELM against FHIR patient bundles.

Usage:
  npm run cql:execute -- [options]

Options:
  --elm <path>                    Path to compiled ELM JSON file
  --cql <path>                    Path to CQL file (will be compiled)
  --patients <path>               Path to directory with FHIR bundles
  --vsac-cache <path>             Path to VSAC cache directory (default: ./vsac_cache)
  --measurement-period-start      Start of measurement period (default: Jan 1 current year)
  --measurement-period-end        End of measurement period (default: Jan 1 next year)
  --output <path>                 Output file for results (default: stdout)
  --help, -h                      Show this help message

Environment Variables:
  UMLS_API_KEY                    Required for downloading VSAC value sets

Examples:
  # Execute ELM against patient bundles
  npm run cql:execute -- --elm ./library.json --patients ./synthea_output/fhir/

  # Execute CQL (compiles automatically)
  npm run cql:execute -- --cql ./measure.cql --patients ./bundles/

  # Save results to file
  npm run cql:execute -- --elm ./library.json --patients ./bundles/ --output ./results.json
`);
}

async function loadPatientBundles(patientsPath) {
  const bundles = [];
  const files = fs.readdirSync(patientsPath);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(patientsPath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const bundle = JSON.parse(content);

        if (bundle.resourceType === 'Bundle') {
          bundles.push(bundle);
        }
      } catch (error) {
        console.warn(`Warning: Could not parse ${file}: ${error.message}`);
      }
    }
  }

  return bundles;
}

async function compileCQL(cqlPath) {
  const cqlCode = fs.readFileSync(cqlPath, 'utf-8');

  console.log('Compiling CQL to ELM...');

  // Use the public CQL translation service
  const response = await fetch(
    'https://cql-translation.alphora.com/cql/translator?annotations=true&locators=true&result-types=true',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/cql',
        Accept: 'application/elm+json',
      },
      body: cqlCode,
    }
  );

  if (!response.ok) {
    throw new Error(`Compilation failed: ${response.status} ${await response.text()}`);
  }

  const elm = await response.json();
  console.log('✓ CQL compiled successfully');

  return elm;
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // Validate arguments
  if (!options.elm && !options.cql) {
    console.error('Error: Either --elm or --cql is required');
    printHelp();
    process.exit(1);
  }

  if (!options.patients) {
    console.error('Error: --patients is required');
    printHelp();
    process.exit(1);
  }

  // Load dependencies
  const loaded = await loadDependencies();
  if (!loaded) {
    process.exit(1);
  }

  console.log('\n--- CQL Execution ---\n');

  // Load or compile ELM
  let elm;
  if (options.elm) {
    console.log(`Loading ELM from: ${options.elm}`);
    elm = JSON.parse(fs.readFileSync(options.elm, 'utf-8'));
  } else {
    console.log(`Compiling CQL from: ${options.cql}`);
    elm = await compileCQL(options.cql);
  }

  const libraryName = elm.library?.identifier?.id || 'Unknown';
  const libraryVersion = elm.library?.identifier?.version || '0.0.0';
  console.log(`Library: ${libraryName} v${libraryVersion}`);

  // Load patient bundles
  console.log(`\nLoading patient bundles from: ${options.patients}`);
  const bundles = await loadPatientBundles(options.patients);
  console.log(`Loaded ${bundles.length} patient bundles`);

  if (bundles.length === 0) {
    console.error('No patient bundles found');
    process.exit(1);
  }

  // Set up VSAC code service if API key available
  let codeService = null;
  const umlsApiKey = process.env.UMLS_API_KEY;

  if (umlsApiKey) {
    console.log('\nSetting up VSAC code service...');
    codeService = new vsac.CodeService(options.vsacCache, true);

    try {
      await codeService.ensureValueSetsInLibraryWithApiKey(elm, true, umlsApiKey);
      console.log('✓ Value sets loaded from VSAC');
    } catch (error) {
      console.warn(`Warning: Could not load value sets: ${error.message}`);
    }
  } else {
    console.log('\nNote: UMLS_API_KEY not set. Value sets will not be resolved.');
  }

  // Create library and executor
  console.log('\nCreating CQL executor...');
  const library = new cql.Library(elm);
  const executor = new cql.Executor(library, codeService);

  // Create patient source
  const patientSource = cqlfhir.PatientSource.FHIRv401();
  patientSource.loadBundles(bundles);

  // Set up parameters
  const parameters = {
    'Measurement Period': new cql.Interval(
      cql.DateTime.parse(options.measurementPeriodStart),
      cql.DateTime.parse(options.measurementPeriodEnd),
      true,
      false
    ),
  };

  console.log(
    `Measurement Period: ${options.measurementPeriodStart} to ${options.measurementPeriodEnd}`
  );

  // Execute
  console.log('\nExecuting CQL...\n');
  const results = await executor.exec(patientSource, parameters);

  // Format results
  const output = {
    library: `${libraryName} v${libraryVersion}`,
    measurementPeriod: {
      start: options.measurementPeriodStart,
      end: options.measurementPeriodEnd,
    },
    patientCount: bundles.length,
    executedAt: new Date().toISOString(),
    results: {},
  };

  // Process results by patient
  for (const [patientId, patientResults] of Object.entries(results.patientResults)) {
    output.results[patientId] = patientResults;
  }

  // Calculate summary if this is a proportion measure
  const defines = Object.keys(output.results[Object.keys(output.results)[0]] || {});
  if (
    defines.includes('Initial Population') ||
    defines.includes('Numerator') ||
    defines.includes('Denominator')
  ) {
    const summary = {
      initialPopulation: 0,
      denominator: 0,
      denominatorExclusions: 0,
      numerator: 0,
      numeratorExclusions: 0,
    };

    for (const patientResults of Object.values(output.results)) {
      if (patientResults['Initial Population']) summary.initialPopulation++;
      if (patientResults['Denominator']) summary.denominator++;
      if (patientResults['Denominator Exclusions']) summary.denominatorExclusions++;
      if (patientResults['Numerator']) summary.numerator++;
      if (patientResults['Numerator Exclusions']) summary.numeratorExclusions++;
    }

    const effectiveDenominator = summary.denominator - summary.denominatorExclusions;
    const effectiveNumerator = summary.numerator - summary.numeratorExclusions;

    output.summary = {
      ...summary,
      effectiveDenominator,
      effectiveNumerator,
      rate: effectiveDenominator > 0 ? (effectiveNumerator / effectiveDenominator) * 100 : 0,
    };

    console.log('=== Measure Results ===');
    console.log(`Initial Population: ${summary.initialPopulation}`);
    console.log(`Denominator: ${summary.denominator}`);
    console.log(`Denominator Exclusions: ${summary.denominatorExclusions}`);
    console.log(`Numerator: ${summary.numerator}`);
    console.log(`Numerator Exclusions: ${summary.numeratorExclusions}`);
    console.log(`\nEffective Rate: ${output.summary.rate.toFixed(2)}%`);
  }

  // Output results
  const jsonOutput = JSON.stringify(output, null, 2);

  if (options.output) {
    fs.writeFileSync(options.output, jsonOutput);
    console.log(`\nResults saved to: ${options.output}`);
  } else {
    console.log('\n--- Full Results ---');
    console.log(jsonOutput);
  }

  console.log('\n✓ Execution complete');
}

main().catch((error) => {
  console.error('Execution failed:', error);
  process.exit(1);
});
