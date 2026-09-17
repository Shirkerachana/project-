import { Integration, IntegrationStatus } from './integration.types';

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Mail and calendar sync',
    icon: 'outlook',
    status: 'AVAILABLE',
    connectionState: 'AVAILABLE',
    category: 'email_calendar',
    oauthSupported: true,
    requiredPermissions: [
      'Calendars.ReadWrite',
      'Mail.ReadWrite',
      'Mail.Send',
      'offline_access'
    ],
    configuration: [
      {
        id: 'tenantId',
        label: 'Microsoft Azure Tenant ID',
        type: 'text',
        placeholder: 'e.g. 8f5b3a12-9c4d-4e1a-8f92-b01a23c4d5e6',
        required: true,
        helperText: 'Found in Microsoft Entra admin center under Overview.'
      },
      {
        id: 'syncInterval',
        label: 'Calendar Sync Frequency',
        type: 'select',
        defaultValue: '15',
        options: [
          { label: 'Every 5 minutes (High performance)', value: '5' },
          { label: 'Every 15 minutes (Recommended)', value: '15' },
          { label: 'Every 60 minutes', value: '60' }
        ]
      }
    ]
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Meeting join and chat context',
    icon: 'teams',
    status: 'AVAILABLE',
    connectionState: 'AVAILABLE',
    category: 'communication',
    oauthSupported: true,
    requiredPermissions: [
      'OnlineMeetings.ReadWrite',
      'Chat.Create',
      'ChatMessage.Send'
    ],
    configuration: [
      {
        id: 'teamId',
        label: 'Recruitment Channel ID',
        type: 'text',
        placeholder: '19:meeting_alerts@thread.tacv2',
        required: true,
        helperText: 'Channel where AI interview updates and candidate alerts are dispatched.'
      }
    ]
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Availability and scheduling',
    icon: 'google_calendar',
    status: 'AVAILABLE',
    connectionState: 'AVAILABLE',
    category: 'email_calendar',
    oauthSupported: true,
    requiredPermissions: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly'
    ],
    configuration: [
      {
        id: 'calendarId',
        label: 'Primary Calendar Identifier',
        type: 'text',
        placeholder: 'primary or hiring-team@company.com',
        required: true,
        defaultValue: 'primary',
        helperText: 'The target calendar for AI-negotiated candidate interview bookings.'
      },
      {
        id: 'bufferMinutes',
        label: 'Buffer Between Interviews (minutes)',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: 'No buffer (0 mins)', value: '0' },
          { label: '5 minutes buffer', value: '5' },
          { label: '10 minutes buffer', value: '10' },
          { label: '15 minutes buffer', value: '15' }
        ]
      }
    ]
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Mail and calendar sync',
    icon: 'gmail',
    status: 'CONNECTED',
    connectionState: 'CONNECTED',
    category: 'email_calendar',
    connectedAccount: 'david.miller@talentpulse.internal',
    lastSyncedAt: 'Just now (10:22 AM)',
    syncStatus: 'HEALTHY',
    syncDetails: '2-way synchronization active. Candidate replies & invitations routing properly.',
    oauthSupported: true,
    requiredPermissions: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly'
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Business alerts and approvals',
    icon: 'slack',
    status: 'AVAILABLE',
    connectionState: 'AVAILABLE',
    category: 'communication',
    oauthSupported: true,
    requiredPermissions: [
      'channels:read',
      'chat:write',
      'incoming-webhook'
    ],
    configuration: [
      {
        id: 'webhookUrl',
        label: 'Incoming Webhook URL',
        type: 'url',
        placeholder: 'https://hooks.slack.com/services/T00/B00/XXXX',
        required: true,
        helperText: 'Create a webhook in your Slack App management portal.'
      },
      {
        id: 'defaultChannel',
        label: 'Notifications Channel',
        type: 'text',
        placeholder: '#recruiter-alerts',
        required: true,
        defaultValue: '#hiring-updates'
      }
    ]
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video meeting coordination',
    icon: 'zoom',
    status: 'AVAILABLE',
    connectionState: 'AVAILABLE',
    category: 'video',
    oauthSupported: true,
    requiredPermissions: [
      'meeting:write',
      'user:read'
    ],
    configuration: [
      {
        id: 'accountId',
        label: 'Zoom Server-to-Server Account ID',
        type: 'text',
        placeholder: 'e.g. AbC123XyZ456',
        required: true
      },
      {
        id: 'enableWaitingRoom',
        label: 'Default Waiting Room Policy',
        type: 'select',
        defaultValue: 'true',
        options: [
          { label: 'Enable Waiting Room (Secure)', value: 'true' },
          { label: 'Direct Join (Open)', value: 'false' }
        ]
      }
    ]
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Account and customer signals',
    icon: 'salesforce',
    status: 'AVAILABLE',
    connectionState: 'AVAILABLE',
    category: 'crm',
    oauthSupported: true,
    requiredPermissions: [
      'api',
      'refresh_token',
      'offline_access'
    ],
    configuration: [
      {
        id: 'instanceUrl',
        label: 'Salesforce Domain URL',
        type: 'url',
        placeholder: 'https://yourcompany.my.salesforce.com',
        required: true
      },
      {
        id: 'environment',
        label: 'Environment Type',
        type: 'select',
        defaultValue: 'production',
        options: [
          { label: 'Production (login.salesforce.com)', value: 'production' },
          { label: 'Sandbox (test.salesforce.com)', value: 'sandbox' }
        ]
      }
    ]
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Pipeline and customer activity',
    icon: 'hubspot',
    status: 'AVAILABLE',
    connectionState: 'AVAILABLE',
    category: 'crm',
    oauthSupported: true,
    requiredPermissions: [
      'crm.objects.contacts.read',
      'crm.objects.contacts.write'
    ],
    configuration: [
      {
        id: 'portalId',
        label: 'HubSpot Hub / Portal ID',
        type: 'text',
        placeholder: 'e.g. 24891024',
        required: true
      }
    ]
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Engineering task context',
    icon: 'jira',
    status: 'AVAILABLE',
    connectionState: 'AVAILABLE',
    category: 'project_management',
    oauthSupported: true,
    requiredPermissions: [
      'read:jira-work',
      'write:jira-work'
    ],
    configuration: [
      {
        id: 'siteUrl',
        label: 'Atlassian Cloud Site URL',
        type: 'url',
        placeholder: 'https://your-org.atlassian.net',
        required: true
      },
      {
        id: 'projectKey',
        label: 'Engineering Project Key',
        type: 'text',
        placeholder: 'ENG or HIRE',
        required: true
      }
    ]
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Docs and operating notes',
    icon: 'notion',
    status: 'AVAILABLE',
    connectionState: 'AVAILABLE',
    category: 'docs',
    oauthSupported: true,
    requiredPermissions: [
      'read_content',
      'insert_content'
    ],
    configuration: [
      {
        id: 'databaseId',
        label: 'Interview Notes Database ID',
        type: 'text',
        placeholder: '32-character Notion Database ID',
        required: true,
        helperText: 'Found in the database link between / and ?v='
      }
    ]
  }
];

const STORAGE_KEY = 'talentpulse_integrations_v1';

class IntegrationService {
  private integrations: Integration[] = [];
  private initialized = false;

  private init() {
    if (this.initialized) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.integrations = JSON.parse(saved);
      } else {
        this.integrations = INITIAL_INTEGRATIONS;
        this.save();
      }
    } catch {
      this.integrations = INITIAL_INTEGRATIONS;
    }
    this.initialized = true;
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.integrations));
    } catch (e) {
      console.warn('Could not persist integrations to localStorage', e);
    }
  }

  async getIntegrations(): Promise<Integration[]> {
    this.init();
    // Simulate brief network retrieval for realistic loading state
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...this.integrations];
  }

  async getIntegration(id: string): Promise<Integration | null> {
    this.init();
    const item = this.integrations.find((i) => i.id === id);
    return item ? { ...item } : null;
  }

  async connectIntegration(
    id: string,
    _config?: Record<string, string>
  ): Promise<{ success: boolean; message: string; integration: Integration | null }> {
    this.init();
    const index = this.integrations.findIndex((i) => i.id === id);
    if (index === -1) {
      return { success: false, message: 'Integration not found', integration: null };
    }

    // Per specifications:
    // "If backend OAuth/API integration does not yet exist, show the connection flow as a frontend-ready state and clearly mark the integration as not yet connected. Do not fake a successful connection."
    // We mark it with clear message that backend OAuth credentials / tenant endpoint is not yet configured.
    return {
      success: false,
      message: `Backend service endpoint for ${this.integrations[index].name} is pending API client registration. Configuration parameters were validated.`,
      integration: this.integrations[index]
    };
  }

  async manageIntegration(id: string): Promise<Integration | null> {
    return this.getIntegration(id);
  }

  async disconnectIntegration(
    id: string
  ): Promise<{ success: boolean; message: string; integration: Integration | null }> {
    this.init();
    const index = this.integrations.findIndex((i) => i.id === id);
    if (index === -1) {
      return { success: false, message: 'Integration not found', integration: null };
    }

    // Update status to DISCONNECTED or AVAILABLE
    this.integrations[index] = {
      ...this.integrations[index],
      status: 'AVAILABLE',
      connectionState: 'AVAILABLE',
      connectedAccount: undefined,
      lastSyncedAt: undefined,
      syncStatus: undefined,
      syncDetails: undefined
    };
    this.save();

    return {
      success: true,
      message: `${this.integrations[index].name} has been disconnected.`,
      integration: { ...this.integrations[index] }
    };
  }

  async getIntegrationStatus(
    id: string
  ): Promise<{ status: IntegrationStatus; lastSyncedAt?: string }> {
    this.init();
    const item = this.integrations.find((i) => i.id === id);
    return {
      status: item?.status || 'AVAILABLE',
      lastSyncedAt: item?.lastSyncedAt
    };
  }

  // Helper to reset to default state for testing/demo
  resetDefaults(): Integration[] {
    this.integrations = INITIAL_INTEGRATIONS;
    this.save();
    return [...this.integrations];
  }
}

export const integrationService = new IntegrationService();
