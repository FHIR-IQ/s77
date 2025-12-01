'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Server,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  Shield,
  Globe,
  Key,
  RefreshCw,
} from 'lucide-react';
import { useFhirServerStore } from '@/lib/fhir-server-store';
import {
  FhirServerConfig,
  FhirServerType,
  FHIR_SERVER_PRESETS,
  testFhirServerConnection,
  FhirServerConnectionResult,
} from '@/lib/fhir-server-service';

interface FhirServerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FhirServerSettings({ open, onOpenChange }: FhirServerSettingsProps) {
  const {
    servers,
    activeServerId,
    addServerFromPreset,
    updateServer,
    removeServer,
    setActiveServer,
  } = useFhirServerStore();

  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, FhirServerConnectionResult>>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Select first server or active server when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedServerId(activeServerId || servers[0]?.id || null);
    }
  }, [open, activeServerId, servers]);

  const selectedServer = servers.find((s) => s.id === selectedServerId);

  const handleAddServer = (type: FhirServerType) => {
    const newServer = addServerFromPreset(type);
    setSelectedServerId(newServer.id);
  };

  const handleUpdateServer = (updates: Partial<FhirServerConfig>) => {
    if (selectedServerId) {
      updateServer(selectedServerId, updates);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedServer) return;

    setTestingConnection(selectedServerId);
    try {
      const result = await testFhirServerConnection(selectedServer);
      setConnectionStatus((prev) => ({
        ...prev,
        [selectedServerId!]: result,
      }));
    } finally {
      setTestingConnection(null);
    }
  };

  const handleRemoveServer = (id: string) => {
    removeServer(id);
    if (selectedServerId === id) {
      setSelectedServerId(servers.find((s) => s.id !== id)?.id || null);
    }
  };

  const handleSetActive = () => {
    if (selectedServerId) {
      setActiveServer(selectedServerId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-clinical" />
            FHIR Server Settings
          </DialogTitle>
          <DialogDescription>
            Configure FHIR servers to upload your Library and Measure resources
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Server List */}
          <div className="w-1/3 border-r pr-4 space-y-3 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddServer('medplum')}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Medplum
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddServer('firemetrics')}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Fire Metrics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddServer('hapi')}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                HAPI
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddServer('custom')}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Custom
              </Button>
            </div>

            {servers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No servers configured. Add one above.
              </p>
            ) : (
              <div className="space-y-2">
                {servers.map((server) => (
                  <Card
                    key={server.id}
                    className={`cursor-pointer transition-colors ${
                      selectedServerId === server.id
                        ? 'border-clinical bg-clinical/5'
                        : 'hover:border-clinical/50'
                    }`}
                    onClick={() => setSelectedServerId(server.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {server.name}
                            </span>
                            {activeServerId === server.id && (
                              <Badge variant="clinical" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {server.baseUrl || 'No URL set'}
                          </p>
                        </div>
                        {connectionStatus[server.id] && (
                          connectionStatus[server.id].success ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Server Configuration */}
          <div className="flex-1 overflow-y-auto">
            {selectedServer ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Settings className="w-3 h-3" />
                      Server Name
                    </label>
                    <Input
                      value={selectedServer.name}
                      onChange={(e) => handleUpdateServer({ name: e.target.value })}
                      placeholder="My FHIR Server"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Base URL
                    </label>
                    <Input
                      value={selectedServer.baseUrl}
                      onChange={(e) => handleUpdateServer({ baseUrl: e.target.value })}
                      placeholder="https://api.example.com/fhir/R4"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      FHIR R4 base endpoint URL
                    </p>
                  </div>
                </div>

                {/* Authentication */}
                <div className="space-y-3 pt-2 border-t">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Authentication
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {(['none', 'basic', 'bearer', 'client-credentials'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={selectedServer.authType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleUpdateServer({ authType: type })}
                        className="text-xs"
                      >
                        {type === 'none' && 'None'}
                        {type === 'basic' && 'Basic Auth'}
                        {type === 'bearer' && 'Bearer Token'}
                        {type === 'client-credentials' && 'OAuth2'}
                      </Button>
                    ))}
                  </div>

                  {/* Auth-specific fields */}
                  {selectedServer.authType === 'basic' && (
                    <div className="space-y-2 pl-4 border-l-2 border-clinical/20">
                      <div>
                        <label className="text-xs font-medium">Username</label>
                        <Input
                          value={selectedServer.username || ''}
                          onChange={(e) => handleUpdateServer({ username: e.target.value })}
                          placeholder="username"
                          className="mt-1 h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Password</label>
                        <Input
                          type="password"
                          value={selectedServer.password || ''}
                          onChange={(e) => handleUpdateServer({ password: e.target.value })}
                          placeholder="••••••••"
                          className="mt-1 h-8"
                        />
                      </div>
                    </div>
                  )}

                  {selectedServer.authType === 'bearer' && (
                    <div className="space-y-2 pl-4 border-l-2 border-clinical/20">
                      <div>
                        <label className="text-xs font-medium flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          Access Token
                        </label>
                        <Input
                          type="password"
                          value={selectedServer.accessToken || ''}
                          onChange={(e) => handleUpdateServer({ accessToken: e.target.value })}
                          placeholder="Bearer token"
                          className="mt-1 h-8"
                        />
                      </div>
                    </div>
                  )}

                  {selectedServer.authType === 'client-credentials' && (
                    <div className="space-y-2 pl-4 border-l-2 border-clinical/20">
                      <div>
                        <label className="text-xs font-medium">Token URL</label>
                        <Input
                          value={selectedServer.tokenUrl || ''}
                          onChange={(e) => handleUpdateServer({ tokenUrl: e.target.value })}
                          placeholder="https://auth.example.com/oauth2/token"
                          className="mt-1 h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Client ID</label>
                        <Input
                          value={selectedServer.clientId || ''}
                          onChange={(e) => handleUpdateServer({ clientId: e.target.value })}
                          placeholder="client-id"
                          className="mt-1 h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Client Secret</label>
                        <Input
                          type="password"
                          value={selectedServer.clientSecret || ''}
                          onChange={(e) => handleUpdateServer({ clientSecret: e.target.value })}
                          placeholder="••••••••"
                          className="mt-1 h-8"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Connection Test */}
                <div className="pt-3 border-t space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestConnection}
                      disabled={testingConnection === selectedServerId || !selectedServer.baseUrl}
                    >
                      {testingConnection === selectedServerId ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                    <Button
                      variant={activeServerId === selectedServerId ? 'secondary' : 'clinical'}
                      size="sm"
                      onClick={handleSetActive}
                      disabled={activeServerId === selectedServerId}
                    >
                      {activeServerId === selectedServerId ? 'Active Server' : 'Set as Active'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveServer(selectedServerId!)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {connectionStatus[selectedServerId!] && (
                    <div
                      className={`text-sm p-2 rounded ${
                        connectionStatus[selectedServerId!].success
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {connectionStatus[selectedServerId!].success ? (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Connected successfully</p>
                            {connectionStatus[selectedServerId!].serverInfo && (
                              <p className="text-xs mt-1">
                                {connectionStatus[selectedServerId!].serverInfo?.name}
                                {connectionStatus[selectedServerId!].serverInfo?.version &&
                                  ` v${connectionStatus[selectedServerId!].serverInfo?.version}`}
                                {connectionStatus[selectedServerId!].serverInfo?.fhirVersion &&
                                  ` (FHIR ${connectionStatus[selectedServerId!].serverInfo?.fhirVersion})`}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Connection failed</p>
                            <p className="text-xs mt-1">
                              {connectionStatus[selectedServerId!].message}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">Select or add a server to configure</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
