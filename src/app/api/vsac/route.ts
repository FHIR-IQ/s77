import { NextRequest, NextResponse } from 'next/server';
import { commonValueSets } from '@/lib/cql-knowledge-base';
import type { ClinicalDomain, ValueSetReference } from '@/types/cql';

// VSAC Value Set Search API
// Provides access to common value sets and search functionality
// For production, integrate with VSAC FHIR API

interface SearchResult {
  valueSets: ValueSetReference[];
  total: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase() || '';
  const domain = searchParams.get('domain') as ClinicalDomain | null;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    let results: ValueSetReference[] = [];

    // If domain specified, search within that domain
    if (domain && commonValueSets[domain]) {
      results = commonValueSets[domain];
    } else {
      // Search across all domains
      results = Object.values(commonValueSets).flat();
    }

    // Apply search query
    if (query) {
      results = results.filter(
        (vs) =>
          vs.name.toLowerCase().includes(query) ||
          vs.oid.includes(query) ||
          vs.purpose?.toLowerCase().includes(query)
      );
    }

    // Remove duplicates by OID
    const uniqueResults = Array.from(
      new Map(results.map((vs) => [vs.oid, vs])).values()
    );

    // Apply pagination
    const paginatedResults = uniqueResults.slice(offset, offset + limit);

    const response: SearchResult = {
      valueSets: paginatedResults,
      total: uniqueResults.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('VSAC search error:', error);
    return NextResponse.json(
      { error: 'Search failed', valueSets: [], total: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Validate a specific OID or fetch details
  try {
    const body = await request.json();
    const oid = body.oid;

    if (!oid) {
      return NextResponse.json(
        { error: 'Missing OID' },
        { status: 400 }
      );
    }

    // Search for the OID in our known value sets
    const allValueSets = Object.values(commonValueSets).flat();
    const found = allValueSets.find((vs) => vs.oid === oid);

    if (found) {
      return NextResponse.json({
        valid: true,
        valueSet: {
          ...found,
          url: `http://cts.nlm.nih.gov/fhir/ValueSet/${oid}`,
        },
      });
    }

    // For unknown OIDs, we can't validate without VSAC API access
    // Return as potentially valid with a warning
    return NextResponse.json({
      valid: true, // Assume valid, let CQL compiler catch issues
      warning: 'OID not found in local cache. Verify with VSAC.',
      valueSet: {
        name: 'Custom Value Set',
        oid,
        url: `http://cts.nlm.nih.gov/fhir/ValueSet/${oid}`,
        purpose: 'User-specified value set',
      },
    });
  } catch (error) {
    console.error('VSAC validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}

