import React from 'react';
import { Integration } from './integration.types';
import { Loader2 } from 'lucide-react';

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (integration: Integration) => void;
  onManage: (integration: Integration) => void;
  isConnecting?: boolean;
}

// Crisp, recognizable SVG brand icons for the 10 services
const renderBrandIcon = (id: string) => {
  switch (id) {
    case 'outlook':
      return (
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="5" width="18" height="22" rx="3" fill="#0078D4" />
          <path d="M11 11a5 5 0 100 10 5 5 0 000-10zm0 7.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#FFFFFF" />
          <rect x="14" y="8" width="16" height="16" rx="2" fill="#28A8EA" opacity="0.9" />
          <path d="M14 11l8 5 8-5v10a2 2 0 01-2 2H16a2 2 0 01-2-2V11z" fill="#0078D4" />
          <path d="M14 11l8 5 8-5" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      );
    case 'teams':
      return (
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <circle cx="21" cy="9" r="3.5" fill="#5059C9" />
          <rect x="16" y="14" width="10" height="9" rx="2" fill="#5059C9" />
          <circle cx="12" cy="11" r="4.5" fill="#7B83EB" />
          <rect x="5" y="17" width="14" height="11" rx="3" fill="#4B53BC" />
          <path d="M10 20h4v2h-4z" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );
    case 'google_calendar':
      return (
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="6" width="24" height="22" rx="4" fill="#FFFFFF" stroke="#4285F4" strokeWidth="2" />
          <path d="M4 12h24V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4z" fill="#4285F4" />
          <rect x="9" y="3" width="2" height="5" rx="1" fill="#EA4335" />
          <rect x="21" y="3" width="2" height="5" rx="1" fill="#EA4335" />
          <text x="16" y="23" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#4285F4" fontFamily="sans-serif">
            31
          </text>
        </svg>
      );
    case 'gmail':
      return (
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <rect x="3" y="6" width="26" height="20" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <path d="M4 7l12 9 12-9" stroke="#EA4335" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 25V8l12 9L4 25z" fill="#EA4335" />
          <path d="M28 25V8l-12 9 12 8z" fill="#FBBC04" />
          <path d="M4 7h4v19H4z" fill="#4285F4" />
          <path d="M24 7h4v19h-4z" fill="#34A853" />
        </svg>
      );
    case 'slack':
      return (
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <path d="M8 17.5a2.5 2.5 0 11-2.5-2.5H8v2.5z" fill="#E01E5A" />
          <path d="M9.5 17.5a2.5 2.5 0 015 0v6.5a2.5 2.5 0 11-5 0v-6.5z" fill="#E01E5A" />
          <path d="M14.5 8a2.5 2.5 0 112.5-2.5V8h-2.5z" fill="#36C5F0" />
          <path d="M14.5 9.5a2.5 2.5 0 010 5H8a2.5 2.5 0 110-5h6.5z" fill="#36C5F0" />
          <path d="M24 14.5a2.5 2.5 0 112.5 2.5H24v-2.5z" fill="#2EB67D" />
          <path d="M22.5 14.5a2.5 2.5 0 01-5 0V8a2.5 2.5 0 115 0v6.5z" fill="#2EB67D" />
          <path d="M17.5 24a2.5 2.5 0 11-2.5 2.5V24h2.5z" fill="#ECB22E" />
          <path d="M17.5 22.5a2.5 2.5 0 010-5H24a2.5 2.5 0 110 5h-6.5z" fill="#ECB22E" />
        </svg>
      );
    case 'zoom':
      return (
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="7" fill="#2D8CFF" />
          <rect x="6" y="10" width="13" height="12" rx="2.5" fill="#FFFFFF" />
          <path d="M20 13.5l6-4.5v14l-6-4.5v-5z" fill="#FFFFFF" />
        </svg>
      );
    case 'salesforce':
      return (
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <path
            d="M13.5 8a6.5 6.5 0 016.2 4.4 5.5 5.5 0 017.8 5.6 5 5 0 01-4 6H7.5a5.5 5.5 0 01-2-10.6 6.5 6.5 0 018-5.4z"
            fill="#00A1E0"
          />
          <text x="16" y="19" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#FFFFFF" fontFamily="sans-serif">
            cloud
          </text>
        </svg>
      );
    case 'hubspot':
      return (
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="#FF7A59" />
          <circle cx="16" cy="16" r="3.5" fill="#FFFFFF" />
          <circle cx="23" cy="11" r="2" fill="#FFFFFF" />
          <path d="M16 8v4.5M19 13.5l2.5-1.5M16 19.5V24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'jira':
      return (
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <path d="M16 4a12 12 0 1012 12A12 12 0 0016 4z" fill="#0052CC" />
          <path d="M16 9l5 5-5 5-5-5 5-5z" fill="#2684FF" />
          <path d="M16 14l5 5-5 5-5-5 5-5z" fill="#FFFFFF" opacity="0.9" />
        </svg>
      );
    case 'notion':
      return (
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="7" fill="#000000" />
          <path
            d="M8 8.5l11.5-1.5 4.5 4.5v12l-12 1.5L8 21.5V8.5z"
            fill="#FFFFFF"
          />
          <path
            d="M12 11h2.5l5 7.5V11H21v9.5h-2.5L13.5 13v7.5H12V11z"
            fill="#000000"
          />
        </svg>
      );
    default:
      return (
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
          {id.charAt(0).toUpperCase()}
        </div>
      );
  }
};

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConnect,
  onManage,
  isConnecting = false
}) => {
  const isConnected = integration.status === 'CONNECTED';

  return (
    <div
      id={`integration-card-${integration.id}`}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group"
    >
      {/* Top row: Logo + Name and Status Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 shrink-0 group-hover:scale-105 transition-transform duration-200">
              {renderBrandIcon(integration.id)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                {integration.name}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          {isConnected ? (
            <span
              id={`status-badge-${integration.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Connected</span>
            </span>
          ) : (
            <span
              id={`status-badge-${integration.id}`}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 shrink-0"
            >
              Available
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed min-h-[36px] mb-5">
          {integration.description}
        </p>
      </div>

      {/* Action Button: Connect or Manage using primary purple button */}
      <div>
        {isConnected ? (
          <button
            type="button"
            id={`manage-btn-${integration.id}`}
            onClick={() => onManage(integration)}
            className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Manage</span>
          </button>
        ) : (
          <button
            type="button"
            id={`connect-btn-${integration.id}`}
            onClick={() => onConnect(integration)}
            disabled={isConnecting}
            className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <span>Connect</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
