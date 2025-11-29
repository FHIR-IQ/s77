import { NextRequest, NextResponse } from 'next/server';
import {
  compileCQLToELM,
  validateCQLStructure,
  extractValueSetReferences,
  extractDefineStatements,
  extractLibraryIdentifier,
  CQL_TRANSLATOR_CONFIG,
} from '@/lib/cql-execution-service';

/**
 * CQL Validation API
 *
 * Validates CQL code using:
 * 1. Quick structural validation (local)
 * 2. Full compilation validation via CQL Translation Service
 *
 * POST /api/validate
 * Body: { cql: string, fullValidation?: boolean }
 *
 * Based on:
 * - https://github.com/cqframework/cql-translation-service
 * - https://cqframework.org/clinical_quality_language/playground/
 */

interface ValidationResult {
  valid: boolean;
  errors: Array<{
    message: string;
    line?: number;
    severity: 'error' | 'fatal';
  }>;
  warnings: Array<{
    message: string;
    line?: number;
    severity: 'warning' | 'info';
  }>;
  metadata?: {
    library?: { name: string; version: string } | null;
    valueSets: Array<{ name: string; oid: string }>;
    defines: Array<{ name: string; isFunction: boolean }>;
  };
  compilationDetails?: {
    elmGenerated: boolean;
    translatorUsed: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cql: string = body.cql;
    const fullValidation: boolean = body.fullValidation ?? true;

    if (!cql) {
      return NextResponse.json(
        { error: 'Missing CQL code' },
        { status: 400 }
      );
    }

    // Step 1: Quick structural validation
    const structureValidation = validateCQLStructure(cql);

    // Extract metadata
    const libraryInfo = extractLibraryIdentifier(cql);
    const valueSets = extractValueSetReferences(cql);
    const defines = extractDefineStatements(cql);

    const errors: ValidationResult['errors'] = structureValidation.issues
      .filter((i) => i.type === 'error')
      .map((i) => ({
        message: i.message,
        line: i.line,
        severity: 'error' as const,
      }));

    const warnings: ValidationResult['warnings'] = structureValidation.issues
      .filter((i) => i.type === 'warning')
      .map((i) => ({
        message: i.message,
        line: i.line,
        severity: 'warning' as const,
      }));

    // If structural validation fails or fullValidation not requested, return early
    if (!structureValidation.valid || !fullValidation) {
      return NextResponse.json({
        valid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          library: libraryInfo,
          valueSets: valueSets.map((vs) => ({ name: vs.name, oid: vs.oid })),
          defines: defines.map((d) => ({ name: d.name, isFunction: d.isFunction })),
        },
      });
    }

    // Step 2: Full compilation validation
    try {
      const compilationResult = await compileCQLToELM(
        cql,
        CQL_TRANSLATOR_CONFIG.publicEndpoint
      );

      // Add compilation errors
      if (compilationResult.errors) {
        compilationResult.errors.forEach((err) => {
          errors.push({
            message: err.message,
            line: err.startLine,
            severity: 'error',
          });
        });
      }

      // Add compilation warnings
      if (compilationResult.warnings) {
        compilationResult.warnings.forEach((warn) => {
          warnings.push({
            message: warn.message,
            line: warn.startLine,
            severity: 'warning',
          });
        });
      }

      return NextResponse.json({
        valid: compilationResult.success && errors.length === 0,
        errors,
        warnings,
        metadata: {
          library: libraryInfo,
          valueSets: valueSets.map((vs) => ({ name: vs.name, oid: vs.oid })),
          defines: defines.map((d) => ({ name: d.name, isFunction: d.isFunction })),
        },
        compilationDetails: {
          elmGenerated: !!compilationResult.elm,
          translatorUsed: CQL_TRANSLATOR_CONFIG.publicEndpoint,
        },
      });
    } catch (compileError) {
      // Compilation service unavailable - return structural validation only
      warnings.push({
        message: `Full compilation unavailable: ${compileError instanceof Error ? compileError.message : 'Service error'}. Using structural validation only.`,
        severity: 'info',
      });

      return NextResponse.json({
        valid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          library: libraryInfo,
          valueSets: valueSets.map((vs) => ({ name: vs.name, oid: vs.oid })),
          defines: defines.map((d) => ({ name: d.name, isFunction: d.isFunction })),
        },
        compilationDetails: {
          elmGenerated: false,
          translatorUsed: 'none (service unavailable)',
        },
      });
    }
  } catch (error) {
    console.error('CQL validation error:', error);
    return NextResponse.json(
      {
        valid: false,
        errors: [
          {
            message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'fatal' as const,
          },
        ],
        warnings: [],
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validate
 *
 * Returns validation service information
 */
export async function GET() {
  return NextResponse.json({
    service: 'CQL Validation Service',
    description: 'Validates CQL code using structural checks and the CQL Translation Service',
    validationLevels: {
      structural: 'Quick local validation of CQL structure',
      full: 'Complete validation via CQL Translation Service (default)',
    },
    usage: {
      quickValidation: 'POST with { cql: "...", fullValidation: false }',
      fullValidation: 'POST with { cql: "..." }',
    },
    checks: [
      'Library declaration presence and format',
      'FHIR data model declaration',
      'Context statement',
      'Bracket/parenthesis balancing',
      'Define statement syntax',
      'Value set declarations',
      'Measurement period parameter',
      'FHIRHelpers inclusion',
      'Full ELM compilation (when fullValidation: true)',
    ],
    translationService: {
      endpoint: CQL_TRANSLATOR_CONFIG.publicEndpoint,
      localSetup: CQL_TRANSLATOR_CONFIG.dockerCommand,
    },
    references: {
      cqlSpec: 'https://cql.hl7.org/',
      translationService: 'https://github.com/cqframework/cql-translation-service',
      playground: 'https://cqframework.org/clinical_quality_language/playground/',
      vscodeExtension: 'https://marketplace.visualstudio.com/items?itemName=cqframework.cql',
    },
  });
}
