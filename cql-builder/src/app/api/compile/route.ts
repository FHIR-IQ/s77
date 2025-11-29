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
 * CQL Compilation API
 *
 * Compiles CQL to ELM (Expression Logical Model) using the CQL Translation Service
 * Based on: https://github.com/cqframework/cql-translation-service
 *
 * POST /api/compile
 * Body: { cql: string, options?: { useLocalTranslator?: boolean } }
 *
 * Returns:
 * - success: boolean
 * - elm: ELM JSON (if successful)
 * - errors: compilation errors
 * - warnings: compilation warnings
 * - metadata: library info, value sets, defines
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cqlCode: string = body.cql;
    const useLocalTranslator: boolean = body.options?.useLocalTranslator ?? false;

    if (!cqlCode || typeof cqlCode !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid CQL code',
        },
        { status: 400 }
      );
    }

    // First, do a quick structural validation
    const structureValidation = validateCQLStructure(cqlCode);

    // Extract metadata before compilation
    const libraryInfo = extractLibraryIdentifier(cqlCode);
    const valueSets = extractValueSetReferences(cqlCode);
    const defines = extractDefineStatements(cqlCode);

    // If there are structural errors, return them without calling the translator
    if (!structureValidation.valid) {
      return NextResponse.json({
        success: false,
        errors: structureValidation.issues
          .filter((i) => i.type === 'error')
          .map((i) => ({
            severity: 'error',
            message: i.message,
            startLine: i.line,
          })),
        warnings: structureValidation.issues
          .filter((i) => i.type === 'warning')
          .map((i) => ({
            severity: 'warning',
            message: i.message,
            startLine: i.line,
          })),
        metadata: {
          library: libraryInfo,
          valueSets,
          defines,
        },
      });
    }

    // Choose translation endpoint
    const translatorEndpoint = useLocalTranslator
      ? CQL_TRANSLATOR_CONFIG.localEndpoint
      : CQL_TRANSLATOR_CONFIG.publicEndpoint;

    // Compile CQL to ELM
    const compilationResult = await compileCQLToELM(cqlCode, translatorEndpoint);

    return NextResponse.json({
      success: compilationResult.success,
      elm: compilationResult.elm,
      errors: compilationResult.errors,
      warnings: [
        ...(compilationResult.warnings || []),
        ...structureValidation.issues
          .filter((i) => i.type === 'warning')
          .map((i) => ({
            severity: 'warning' as const,
            message: i.message,
            startLine: i.line,
          })),
      ],
      metadata: {
        library: libraryInfo,
        valueSets,
        defines,
        translatorUsed: translatorEndpoint,
      },
    });
  } catch (error) {
    console.error('CQL compilation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compile
 *
 * Returns information about the compilation service
 */
export async function GET() {
  return NextResponse.json({
    service: 'CQL Compilation Service',
    description: 'Compiles CQL to ELM using the CQL Translation Service',
    endpoints: {
      public: CQL_TRANSLATOR_CONFIG.publicEndpoint,
      local: CQL_TRANSLATOR_CONFIG.localEndpoint,
    },
    localSetup: {
      docker: CQL_TRANSLATOR_CONFIG.dockerCommand,
      description: 'Run this command to start a local CQL Translation Service',
    },
    options: {
      useLocalTranslator: 'Set to true to use local Docker instance (faster, offline)',
    },
    references: {
      translationService: 'https://github.com/cqframework/cql-translation-service',
      cqlExecution: 'https://github.com/cqframework/cql-execution',
      playground: 'https://cqframework.org/clinical_quality_language/playground/',
    },
  });
}
