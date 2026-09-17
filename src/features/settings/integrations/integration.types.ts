export type IntegrationStatus =
  | 'AVAILABLE'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'ERROR'
  | 'DISCONNECTED';

export type IntegrationCategory =
  | 'email_calendar'
  | 'communication'
  | 'video'
  | 'crm'
  | 'project_management'
  | 'docs';

export interface IntegrationConfigField {
  id: string;
  label: string;
  type: 'text' | 'url' | 'select' | 'password';
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: { label: string; value: string }[];
  helperText?: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: IntegrationStatus;
  category: IntegrationCategory;
  connectionState: 'AVAILABLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DISCONNECTED';
  lastSyncedAt?: string;
  connectedAccount?: string;
  syncStatus?: 'HEALTHY' | 'SYNCING' | 'ERROR' | 'PAUSED';
  syncDetails?: string;
  configuration?: IntegrationConfigField[];
  oauthSupported?: boolean;
  requiredPermissions?: string[];
  docsUrl?: string;
}

export interface ConnectIntegrationPayload {
  integrationId: string;
  configValues?: Record<string, string>;
}
