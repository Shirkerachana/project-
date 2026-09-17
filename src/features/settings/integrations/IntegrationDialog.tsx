import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { Integration } from './integration.types';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Trash2,
  Shield,
  ExternalLink,
  Info,
  Key,
  Globe
} from 'lucide-react';

interface IntegrationDialogProps {
  integration: Integration | null;
  mode: 'connect' | 'manage' | null;
  isOpen: boolean;
  onClose: () => void;
  onConnectSubmit: (integration: Integration, values: Record<string, string>) => Promise<void>;
  onDisconnectSubmit: (integrationId: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const IntegrationDialog: React.FC<IntegrationDialogProps> = ({
  integration,
  mode,
  isOpen,
  onClose,
  onConnectSubmit,
  onDisconnectSubmit,
  isSubmitting = false
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [connectNotice, setConnectNotice] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize form default values
  useEffect(() => {
    if (integration?.configuration) {
      const defaults: Record<string, string> = {};
      integration.configuration.forEach((field) => {
        defaults[field.id] = field.defaultValue || '';
      });
      setFormValues(defaults);
    } else {
      setFormValues({});
    }
    setConnectNotice(null);
    setShowDisconnectConfirm(false);
  }, [integration, isOpen]);

  if (!integration || !mode) return null;

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmitConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConnectSubmit(integration, formValues);
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const handleConfirmDisconnect = async () => {
    setShowDisconnectConfirm(false);
    await onDisconnectSubmit(integration.id);
    onClose();
  };

  // =========================================================================
  // MANAGE MODAL
  // =========================================================================
  if (mode === 'manage') {
    return (
      <>
        <Modal
          isOpen={isOpen && !showDisconnectConfirm}
          onClose={onClose}
          title={`Manage ${integration.name}`}
          subtitle="Connection information, sync status, and account settings"
          maxWidth="lg"
        >
          <div className="space-y-6 text-xs">
            {/* Connection Overview Header */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold">
                  {integration.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{integration.name}</h4>
                  <p className="text-slate-400">{integration.description}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            </div>

            {/* Connection Information */}
            <div className="space-y-3">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] text-slate-400">
                Connection Details
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Linked Account</span>
                  <span className="font-semibold text-white font-mono">
                    {integration.connectedAccount || 'organization-default@domain.com'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Last Synchronized</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{integration.lastSyncedAt || 'Just now'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Sync Health</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Active &bull; Two-way Stream</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Authentication Type</span>
                  <span className="font-semibold text-slate-200">OAuth 2.0 (Encrypted Token)</span>
                </div>
              </div>
            </div>

            {/* Granted Scopes / Permissions */}
            {integration.requiredPermissions && integration.requiredPermissions.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-bold text-white uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Authorized Scopes</span>
                </h5>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  {integration.requiredPermissions.map((perm) => (
                    <div key={perm} className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sync Now / Troubleshooting notice */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-slate-300">
              <span className="text-[11px] text-slate-400">
                Data refreshes automatically every 15 minutes.
              </span>
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            {/* Bottom Actions: Close and Disconnect */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDisconnectConfirm(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 transition-colors font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Disconnect Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDisconnectConfirm}
          onClose={() => setShowDisconnectConfirm(false)}
          onConfirm={handleConfirmDisconnect}
          title={`Disconnect ${integration.name}?`}
          message={`Are you sure you want to disconnect ${integration.name}? Automated mail and calendar synchronization with your candidate pipeline will be stopped.`}
          confirmLabel="Yes, Disconnect"
          cancelLabel="Cancel"
          variant="danger"
          isLoading={isSubmitting}
        />
      </>
    );
  }

  // =========================================================================
  // CONNECT MODAL
  // =========================================================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Connect ${integration.name}`}
      subtitle={integration.description}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmitConnect} className="space-y-5 text-xs">
        {/* Status Banner */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="font-semibold text-slate-300">Connection Status:</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md font-medium text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
            Available / Not Connected
          </span>
        </div>

        {/* Info Note: Backend OAuth notice */}
        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200/90 leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-indigo-300">
            <Info className="w-4 h-4 shrink-0" />
            <span>Integration Setup Flow</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Provide the required configuration details below to establish connectivity. This interface prepares the client configuration for backend OAuth credential registration.
          </p>
        </div>

        {/* Dynamic Configuration Fields */}
        {integration.configuration && integration.configuration.length > 0 ? (
          <div className="space-y-3.5">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] text-slate-400">
              Required Configuration
            </h5>
            {integration.configuration.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="font-semibold text-slate-200 block">
                  {field.label}
                  {field.required && <span className="text-rose-400 ml-1">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formValues[field.id] || field.defaultValue || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formValues[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                )}
                {field.helperText && (
                  <span className="text-[11px] text-slate-500 block">{field.helperText}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-center">
            Standard single sign-on authentication will be initiated upon approval.
          </div>
        )}

        {/* Required Permissions if OAuth */}
        {integration.requiredPermissions && integration.requiredPermissions.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Requested Access Permissions</span>
            </h5>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300">
              {integration.requiredPermissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Notice / Result feedback if submitted */}
        {connectNotice && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">{connectNotice}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Validating Configuration...</span>
              </>
            ) : (
              <span>Connect {integration.name}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
