#!/usr/bin/env node
/**
 * CQL Compilation Script
 *
 * Compiles CQL to ELM (Expression Logical Model) using the CQL Translation Service.
 *
 * Usage:
 *   npm run cql:compile -- path/to/library.cql
 *   npm run cql:compile -- path/to/library.cql --output path/to/output.json
 *   npm run cql:compile -- path/to/library.cql --local
 *
 * Options:
 *   --output, -o    Output file path (default: same as input with .json extension)
 *   --local         Use local Docker translation service instead of public
 *   --validate      Only validate, don't save ELM
 *   --help, -h      Show help
 *
 * References:
 *   - https://github.com/cqframework/cql-translation-service
 *   - https://cqframework.org/clinical_quality_language/playground/
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_ENDPOINT = 'https://cql-translation.alphora.com/cql/translator';
const LOCAL_ENDPOINT = 'http://localhost:8080/cql/translator';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    output: null,
    local: false,
    validate: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--local') {
      options.local = true;
    } else if (arg === '--validate') {
      options.validate = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (!arg.startsWith('-')) {
      options.input = arg;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
CQL Compilation Script
======================

Compiles CQL to ELM using the CQL Translation Service.

Usage:
  npm run cql:compile -- <input.cql> [options]

Arguments:
  input.cql                 Path to CQL file to compile

Options:
  --output, -o <path>       Output file path (default: <input>.json)
  --local                   Use local Docker translation service
  --validate                Only validate, don't save output
  --help, -h                Show this help message

Examples:
  # Compile CQL to ELM
  npm run cql:compile -- ./measure.cql

  # Compile with custom output
  npm run cql:compile -- ./measure.cql -o ./output/measure-elm.json

  # Validate only
  npm run cql:compile -- ./measure.cql --validate

  # Use local Docker service
  npm run cql:compile -- ./measure.cql --local

Local Service Setup:
  docker run -d -p 8080:8080 cqframework/cql-translation-service:latest
`);
}

async function compileCQL(cqlCode, endpoint) {
  const params = new URLSearchParams({
    annotations: 'true',
    locators: 'true',
    'result-types': 'true',
    signatures: 'All',
    'detailed-errors': 'true',
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/cql',
      Accept: 'application/elm+json',
    },
    body: cqlCode,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Compilation failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

function extractErrors(elm) {
  const errors = [];
  const warnings = [];

  if (elm.library && elm.library.annotation) {
    for (const ann of elm.library.annotation) {
      if (ann.errorSeverity === 'error') {
        errors.push({
          message: ann.message,
          line: ann.startLine,
          column: ann.startChar,
        });
      } else if (ann.errorSeverity === 'warning') {
        warnings.push({
          message: ann.message,
          line: ann.startLine,
          column: ann.startChar,
        });
      }
    }
  }

  return { errors, warnings };
}

function printLibraryInfo(elm) {
  const lib = elm.library;

  console.log('\n=== Library Info ===');
  console.log(`Name: ${lib.identifier?.id || 'Unknown'}`);
  console.log(`Version: ${lib.identifier?.version || 'Unknown'}`);

  if (lib.usings?.def) {
    console.log('\nData Models:');
    for (const using of lib.usings.def) {
      if (using.localIdentifier !== 'System') {
        console.log(`  - ${using.localIdentifier} v${using.version || 'unknown'}`);
      }
    }
  }

  if (lib.includes?.def) {
    console.log('\nIncludes:');
    for (const inc of lib.includes.def) {
      console.log(`  - ${inc.path} v${inc.version || 'unknown'} as ${inc.localIdentifier}`);
    }
  }

  if (lib.valueSets?.def) {
    console.log(`\nValue Sets: ${lib.valueSets.def.length}`);
    for (const vs of lib.valueSets.def.slice(0, 5)) {
      console.log(`  - ${vs.name}`);
    }
    if (lib.valueSets.def.length > 5) {
      console.log(`  ... and ${lib.valueSets.def.length - 5} more`);
    }
  }

  if (lib.statements?.def) {
    const defines = lib.statements.def.filter((s) => s.name !== 'Patient');
    console.log(`\nDefine Statements: ${defines.length}`);
    for (const def of defines.slice(0, 10)) {
      const type = def.expression?.type || 'unknown';
      console.log(`  - ${def.name} (${type})`);
    }
    if (defines.length > 10) {
      console.log(`  ... and ${defines.length - 10} more`);
    }
  }
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (!options.input) {
    console.error('Error: Input CQL file is required');
    printHelp();
    process.exit(1);
  }

  // Read input file
  if (!fs.existsSync(options.input)) {
    console.error(`Error: File not found: ${options.input}`);
    process.exit(1);
  }

  const cqlCode = fs.readFileSync(options.input, 'utf-8');
  const inputBasename = path.basename(options.input, '.cql');
  const inputDir = path.dirname(options.input);

  // Determine output path
  const outputPath = options.output || path.join(inputDir, `${inputBasename}.json`);

  // Choose endpoint
  const endpoint = options.local ? LOCAL_ENDPOINT : PUBLIC_ENDPOINT;

  console.log(`\n--- CQL Compilation ---\n`);
  console.log(`Input: ${options.input}`);
  console.log(`Translation Service: ${endpoint}`);

  if (!options.validate) {
    console.log(`Output: ${outputPath}`);
  }

  // Compile
  console.log('\nCompiling...');

  try {
    const elm = await compileCQL(cqlCode, endpoint);

    // Extract and display errors/warnings
    const { errors, warnings } = extractErrors(elm);

    if (warnings.length > 0) {
      console.log('\n⚠ Warnings:');
      for (const warn of warnings) {
        console.log(`  Line ${warn.line || '?'}: ${warn.message}`);
      }
    }

    if (errors.length > 0) {
      console.log('\n✗ Errors:');
      for (const err of errors) {
        console.log(`  Line ${err.line || '?'}: ${err.message}`);
      }
      console.log('\nCompilation failed with errors.');
      process.exit(1);
    }

    // Print library info
    printLibraryInfo(elm);

    // Save output
    if (!options.validate) {
      fs.writeFileSync(outputPath, JSON.stringify(elm, null, 2));
      console.log(`\n✓ ELM saved to: ${outputPath}`);
    } else {
      console.log('\n✓ Validation successful');
    }

    // Calculate file sizes
    const cqlSize = Buffer.byteLength(cqlCode, 'utf-8');
    const elmSize = Buffer.byteLength(JSON.stringify(elm), 'utf-8');
    console.log(`\nCQL size: ${(cqlSize / 1024).toFixed(2)} KB`);
    console.log(`ELM size: ${(elmSize / 1024).toFixed(2)} KB`);

    console.log('\n✓ Compilation complete');
  } catch (error) {
    console.error(`\n✗ Compilation failed: ${error.message}`);

    if (options.local) {
      console.log('\nTip: Make sure the local translation service is running:');
      console.log('  docker run -d -p 8080:8080 cqframework/cql-translation-service:latest');
    }

    process.exit(1);
  }
}

main();
