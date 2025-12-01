/**
 * FHIR Server API Route
 * Proxies requests to FHIR servers to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';

interface FhirServerRequest {
  action: 'test' | 'upload' | 'upload-bundle';
  serverConfig: {
    baseUrl: string;
    authType: 'none' | 'basic' | 'bearer' | 'client-credentials';
    username?: string;
    password?: string;
    accessToken?: string;
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
  };
  resource?: unknown;
  bundle?: unknown;
}

async function buildAuthHeaders(config: FhirServerRequest['serverConfig']): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/fhir+json',
    'Accept': 'application/fhir+json',
  };

  switch (config.authType) {
    case 'basic':
      if (config.username && config.password) {
        const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }
      break;

    case 'bearer':
      if (config.accessToken) {
        headers['Authorization'] = `Bearer ${config.accessToken}`;
      }
      break;

    case 'client-credentials':
      if (config.clientId && config.clientSecret && config.tokenUrl) {
        try {
          const tokenResponse = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'client_credentials',
              client_id: config.clientId,
              client_secret: config.clientSecret,
            }),
          });

          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            headers['Authorization'] = `Bearer ${tokenData.access_token}`;
          }
        } catch (error) {
          console.error('Failed to obtain OAuth2 token:', error);
        }
      }
      break;

    case 'none':
    default:
      break;
  }

  return headers;
}

export async function POST(request: NextRequest) {
  try {
    const body: FhirServerRequest = await request.json();
    const { action, serverConfig, resource, bundle } = body;

    if (!serverConfig?.baseUrl) {
      return NextResponse.json(
        { error: 'Server base URL is required' },
        { status: 400 }
      );
    }

    const headers = await buildAuthHeaders(serverConfig);

    switch (action) {
      case 'test': {
        // Test connection by fetching capability statement
        const testHeaders = { ...headers };
        delete testHeaders['Content-Type'];

        const response = await fetch(`${serverConfig.baseUrl}/metadata`, {
          method: 'GET',
          headers: testHeaders,
        });

        if (!response.ok) {
          return NextResponse.json({
            success: false,
            message: `Connection failed: ${response.status} ${response.statusText}`,
          });
        }

        const capabilityStatement = await response.json();

        return NextResponse.json({
          success: true,
          message: 'Successfully connected to FHIR server',
          serverInfo: {
            name: capabilityStatement.software?.name || capabilityStatement.name,
            version: capabilityStatement.software?.version,
            fhirVersion: capabilityStatement.fhirVersion,
          },
        });
      }

      case 'upload': {
        if (!resource) {
          return NextResponse.json(
            { error: 'Resource is required for upload' },
            { status: 400 }
          );
        }

        const resourceType = (resource as { resourceType: string }).resourceType;
        const resourceId = (resource as { id?: string }).id;

        const url = resourceId
          ? `${serverConfig.baseUrl}/${resourceType}/${resourceId}`
          : `${serverConfig.baseUrl}/${resourceType}`;

        const response = await fetch(url, {
          method: resourceId ? 'PUT' : 'POST',
          headers,
          body: JSON.stringify(resource),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;

          try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.issue) {
              errorMessage = errorJson.issue
                .map((i: { diagnostics?: string; details?: { text?: string } }) =>
                  i.diagnostics || i.details?.text || 'Unknown error')
                .join('; ');
            }
          } catch {
            if (errorBody) errorMessage = errorBody;
          }

          return NextResponse.json({
            success: false,
            message: errorMessage,
            error: errorMessage,
          });
        }

        const responseData = await response.json();

        return NextResponse.json({
          success: true,
          message: `Successfully uploaded ${resourceType}/${responseData.id || resourceId}`,
          resourceId: responseData.id,
          resourceUrl: `${serverConfig.baseUrl}/${resourceType}/${responseData.id}`,
        });
      }

      case 'upload-bundle': {
        if (!bundle) {
          return NextResponse.json(
            { error: 'Bundle is required for bundle upload' },
            { status: 400 }
          );
        }

        const response = await fetch(serverConfig.baseUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(bundle),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          let errorMessage = `Bundle upload failed: ${response.status} ${response.statusText}`;

          try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.issue) {
              errorMessage = errorJson.issue
                .map((i: { diagnostics?: string; details?: { text?: string } }) =>
                  i.diagnostics || i.details?.text || 'Unknown error')
                .join('; ');
            }
          } catch {
            if (errorBody) errorMessage = errorBody;
          }

          return NextResponse.json({
            success: false,
            message: errorMessage,
          });
        }

        const responseBundle = await response.json();

        // Parse response to extract Library and Measure results
        let libraryResult = null;
        let measureResult = null;

        if (responseBundle.entry) {
          for (const entry of responseBundle.entry) {
            const entryResource = entry.resource;
            if (entryResource?.resourceType === 'Library') {
              libraryResult = {
                success: true,
                message: 'Library uploaded successfully',
                resourceId: entryResource.id,
                resourceUrl: `${serverConfig.baseUrl}/Library/${entryResource.id}`,
              };
            } else if (entryResource?.resourceType === 'Measure') {
              measureResult = {
                success: true,
                message: 'Measure uploaded successfully',
                resourceId: entryResource.id,
                resourceUrl: `${serverConfig.baseUrl}/Measure/${entryResource.id}`,
              };
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Bundle uploaded successfully',
          libraryResult,
          measureResult,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('FHIR Server API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
