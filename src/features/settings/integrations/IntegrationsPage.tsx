import React, { useState, useEffect, useCallback } from 'react';
import { Integration } from './integration.types';
import { integrationService } from './integration.service';
import { IntegrationGrid } from './IntegrationGrid';
import { IntegrationDialog } from './IntegrationDialog';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { useToast } from '../../../context/ToastContext';
import { Cpu, RotateCcw } from 'lucide-react';

export const IntegrationsPage: React.FC = () => {
  const toast = useToast();

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog State
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [dialogMode, setDialogMode] = useState<'connect' | 'manage' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await integrationService.getIntegrations();
      setIntegrations(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load business integrations. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // Dynamic connected count calculation:
  // "Calculate X from the actual integration state. Do NOT hardcode the count in production UI."
  const connectedCount = integrations.filter(
    (item) => item.status === 'CONNECTED' || item.connectionState === 'CONNECTED'
  ).length;

  const handleOpenConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setDialogMode('connect');
  };

  const handleOpenManage = (integration: Integration) => {
    setSelectedIntegration(integration);
    setDialogMode('manage');
  };

  const handleCloseDialog = () => {
    setSelectedIntegration(null);
    setDialogMode(null);
    setIsSubmitting(false);
  };

  const handleConnectSubmit = async (
    integration: Integration,
    values: Record<string, string>
  ) => {
    setIsSubmitting(true);
    setConnectingId(integration.id);

    try {
      const result = await integrationService.connectIntegration(integration.id, values);

      // Per specifications:
      // "If backend OAuth/API integration does not yet exist, show the connection flow as a frontend-ready state and clearly mark the integration as not yet connected. Do not fake a successful connection."
      toast.info(
        `${integration.name} Setup Ready`,
        result.message || 'Configuration captured. Ready for backend OAuth registration.'
      );
      handleCloseDialog();
    } catch (err: any) {
      toast.error('Connection Error', err?.message || 'Failed to establish connection.');
    } finally {
      setIsSubmitting(false);
      setConnectingId(null);
    }
  };

  const handleDisconnectSubmit = async (integrationId: string) => {
    setIsSubmitting(true);
    try {
      const result = await integrationService.disconnectIntegration(integrationId);
      if (result.success && result.integration) {
        setIntegrations((prev) =>
          prev.map((item) => (item.id === integrationId ? result.integration! : item))
        );
        toast.success('Integration Disconnected', result.message);
      }
    } catch (err: any) {
      toast.error('Disconnection Failed', err?.message || 'Could not disconnect integration.');
    } finally {
      setIsSubmitting(false);
      handleCloseDialog();
    }
  };

  return (
    <div id="integrations-feature-page" className="space-y-6">
      {/* Page Header matching visual reference:
          Title: Integrations
          Subtitle: Connect your business systems for richer context
          Top-right: "X connected" (Dynamic)
      */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Integrations</h2>
          <p className="text-xs text-slate-400 mt-1">
            Connect your business systems for richer context
          </p>
        </div>

        {/* Dynamic Connected Count Header Badge */}
        <div className="flex items-center gap-3">
          <div
            id="connected-count-indicator"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectedCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="font-semibold text-white">
              {connectedCount} connected
            </span>
          </div>
        </div>
      </div>

      {/* Main Content States */}
      {isLoading ? (
        <LoadingState message="Loading enterprise integrations..." variant="skeleton" count={6} />
      ) : error ? (
        <ErrorState
          title="Unable to Load Integrations"
          message={error}
          onRetry={fetchIntegrations}
        />
      ) : integrations.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No Integrations Available"
          description="There are currently no third-party integrations configured for your organization."
          actionLabel="Reload Services"
          onAction={fetchIntegrations}
        />
      ) : (
        <IntegrationGrid
          integrations={integrations}
          onConnect={handleOpenConnect}
          onManage={handleOpenManage}
          connectingId={connectingId}
        />
      )}

      {/* Connect / Manage Dialog */}
      <IntegrationDialog
        integration={selectedIntegration}
        mode={dialogMode}
        isOpen={Boolean(dialogMode && selectedIntegration)}
        onClose={handleCloseDialog}
        onConnectSubmit={handleConnectSubmit}
        onDisconnectSubmit={handleDisconnectSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
