'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Server,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { useFhirServerStore } from '@/lib/fhir-server-store';
import {
  uploadLibraryAndMeasure,
  FhirBundleUploadResult,
} from '@/lib/fhir-server-service';
import {
  generateLibraryResource,
  generateMeasureResource,
  ExportOptions,
  FhirLibrary,
  FhirMeasure,
} from '@/lib/export-service';
import { FhirServerSettings } from './fhir-server-settings';

interface PushToFhirButtonProps {
  cql: string;
  elm: unknown | null;
  options: ExportOptions;
  disabled?: boolean;
}

export function PushToFhirButton({
  cql,
  elm,
  options,
  disabled,
}: PushToFhirButtonProps) {
  const { servers, getActiveServer } = useFhirServerStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<FhirBundleUploadResult | null>(null);

  const activeServer = getActiveServer();

  const handlePushClick = () => {
    if (!activeServer) {
      setSettingsOpen(true);
    } else {
      setUploadResult(null);
      setConfirmOpen(true);
    }
  };

  const handleConfirmUpload = async () => {
    if (!activeServer) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Generate the Library and Measure resources
      const library: FhirLibrary = generateLibraryResource(cql, elm, options);
      const measure: FhirMeasure = generateMeasureResource(library.url || '', {
        ...options,
        scoringType: options.scoringType || 'proportion',
      });

      // Upload to the server
      const result = await uploadLibraryAndMeasure(activeServer, library, measure);
      setUploadResult(result);
    } catch (error) {
      setUploadResult({
        success: false,
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePushClick}
        disabled={disabled}
        className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-300 hover:border-blue-400"
      >
        <Upload className="w-4 h-4 mr-2 text-blue-600" />
        Push to FHIR
        {activeServer && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {activeServer.name}
          </Badge>
        )}
      </Button>

      {/* Server Settings Dialog */}
      <FhirServerSettings open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Upload Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-clinical" />
              Push to FHIR Server
            </DialogTitle>
            <DialogDescription>
              Upload your Library and Measure resources to the configured FHIR server
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Target Server */}
            {activeServer && (
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Target Server
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setConfirmOpen(false);
                      setSettingsOpen(true);
                    }}
                    className="h-6 px-2"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Change
                  </Button>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{activeServer.name}</p>
                  <p className="text-muted-foreground text-xs truncate">
                    {activeServer.baseUrl}
                  </p>
                </div>
              </div>
            )}

            {/* Resources to Upload */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Resources to Upload</span>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                  <Badge variant="outline" className="bg-blue-100">
                    Library
                  </Badge>
                  <span className="truncate">{options.libraryName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-purple-50 p-2 rounded">
                  <Badge variant="outline" className="bg-purple-100">
                    Measure
                  </Badge>
                  <span className="truncate">{options.libraryName}Measure</span>
                </div>
              </div>
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <div
                className={`p-3 rounded-lg ${
                  uploadResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p
                      className={`font-medium text-sm ${
                        uploadResult.success ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {uploadResult.success
                        ? 'Upload Successful!'
                        : 'Upload Failed'}
                    </p>

                    {uploadResult.success && (
                      <div className="space-y-1 text-xs">
                        {uploadResult.libraryResult?.resourceUrl && (
                          <a
                            href={uploadResult.libraryResult.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Library
                          </a>
                        )}
                        {uploadResult.measureResult?.resourceUrl && (
                          <a
                            href={uploadResult.measureResult.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-600 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Measure
                          </a>
                        )}
                      </div>
                    )}

                    {!uploadResult.success && (
                      <p className="text-xs text-red-600">
                        {uploadResult.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Warning about CQL encoding */}
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                The CQL code will be base64 encoded and attached to the Library
                resource. Make sure your CQL is valid before uploading.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isUploading}
            >
              {uploadResult?.success ? 'Close' : 'Cancel'}
            </Button>
            {(!uploadResult || !uploadResult.success) && (
              <Button
                onClick={handleConfirmUpload}
                disabled={isUploading || !activeServer}
                className="bg-clinical hover:bg-clinical-dark"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Resources
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
