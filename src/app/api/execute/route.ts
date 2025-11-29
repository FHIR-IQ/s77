import { NextRequest, NextResponse } from 'next/server';

/**
 * CQL Execution API
 *
 * Executes compiled ELM against FHIR patient data using:
 * - cql-execution: Core execution engine
 * - cql-exec-fhir: FHIR R4 patient source
 * - cql-exec-vsac: VSAC value set resolution
 *
 * POST /api/execute
 * Body: {
 *   elm: ELM JSON or CQL string (will be compiled)
 *   patients: FHIR Bundle[] (patient data)
 *   options: {
 *     measurementPeriodStart?: string,
 *     measurementPeriodEnd?: string,
 *     parameters?: Record<string, any>
 *   }
 * }
 *
 * Note: For browser/Vercel execution, this uses a simplified approach.
 * For full execution with VSAC value sets, use the Node.js scripts.
 */

interface ExecutionRequest {
  elm?: unknown;
  cql?: string;
  patients: Array<{
    resourceType: 'Bundle';
    type: string;
    entry?: Array<{ resource: unknown }>;
  }>;
  options?: {
    measurementPeriodStart?: string;
    measurementPeriodEnd?: string;
    parameters?: Record<string, unknown>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecutionRequest = await request.json();

    // Validate request
    if (!body.elm && !body.cql) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either elm or cql must be provided',
        },
        { status: 400 }
      );
    }

    if (!body.patients || !Array.isArray(body.patients)) {
      return NextResponse.json(
        {
          success: false,
          error: 'patients array is required',
        },
        { status: 400 }
      );
    }

    // If CQL provided, compile first
    let elm = body.elm;
    if (!elm && body.cql) {
      const compileResponse = await fetch(new URL('/api/compile', request.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cql: body.cql }),
      });

      const compileResult = await compileResponse.json();
      if (!compileResult.success) {
        return NextResponse.json({
          success: false,
          error: 'CQL compilation failed',
          compilationErrors: compileResult.errors,
        });
      }

      elm = compileResult.elm;
    }

    // Note: Full CQL execution requires Node.js runtime with cql-execution package
    // In Vercel Edge/Serverless, we provide execution guidance instead

    // For demonstration, return execution instructions
    return NextResponse.json({
      success: true,
      message: 'CQL ready for execution',
      executionInfo: {
        elmProvided: !!body.elm,
        patientCount: body.patients.length,
        measurementPeriod: body.options?.measurementPeriodStart
          ? `${body.options.measurementPeriodStart} to ${body.options.measurementPeriodEnd}`
          : 'Default (current year)',
      },
      instructions: {
        serverExecution: 'Use npm run cql:execute for full server-side execution',
        localExecution: 'Download the CQL and run with VS Code CQL extension',
        dockerExecution: 'Use HAPI FHIR + CQL Evaluator for production execution',
      },
      // Include the compiled ELM for client-side or external execution
      elm: elm,
      references: {
        cqlExecution: 'https://github.com/cqframework/cql-execution',
        cqlExecFhir: 'https://github.com/cqframework/cql-exec-fhir',
        playground: 'https://cqframework.org/clinical_quality_language/playground/',
      },
    });
  } catch (error) {
    console.error('CQL execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/execute
 *
 * Returns execution service information and setup instructions
 */
export async function GET() {
  return NextResponse.json({
    service: 'CQL Execution Service',
    description: 'Executes CQL/ELM against FHIR patient data',
    packages: {
      'cql-execution': '3.0.1 - Core CQL execution engine',
      'cql-exec-fhir': '2.1.4 - FHIR R4 patient source',
      'cql-exec-vsac': '2.2.0 - VSAC value set resolution',
    },
    usage: {
      compile: 'POST /api/compile with { cql: "..." }',
      execute: 'POST /api/execute with { elm: {...}, patients: [...] }',
    },
    localExecution: {
      description: 'For full execution with VSAC support, run locally:',
      steps: [
        '1. npm install',
        '2. Set UMLS_API_KEY environment variable',
        '3. npm run cql:execute -- --elm path/to/elm.json --patients path/to/bundles/',
      ],
    },
    vsacIntegration: {
      description: 'VSAC value set resolution requires UMLS API key',
      signup: 'https://uts.nlm.nih.gov/license.html',
      envVar: 'UMLS_API_KEY',
    },
    syntheaIntegration: {
      description: 'Generate test patients with Synthea',
      command: 'java -jar synthea-with-dependencies.jar -p 100 Massachusetts',
      download: 'https://github.com/synthetichealth/synthea/releases',
    },
    references: {
      cqlExecution: 'https://github.com/cqframework/cql-execution',
      cqlExecFhir: 'https://github.com/cqframework/cql-exec-fhir',
      cqlExecVsac: 'https://github.com/cqframework/cql-exec-vsac',
      playground: 'https://cqframework.org/clinical_quality_language/playground/',
    },
  });
}
