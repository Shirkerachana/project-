import React from 'react';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

interface ProctoringFlagBadgeProps {
  severity: 'low' | 'medium' | 'high';
  eventType: string;
  timestamp?: string;
  description?: string;
}

export const ProctoringFlagBadge: React.FC<ProctoringFlagBadgeProps> = ({
  severity,
  eventType,
  timestamp,
  description
}) => {
  const styles = {
    low: {
      bg: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
      icon: Info
    },
    medium: {
      bg: 'bg-orange-950/40 text-orange-300 border-orange-500/30',
      icon: AlertTriangle
    },
    high: {
      bg: 'bg-rose-950/40 text-rose-300 border-rose-500/30',
      icon: ShieldAlert
    }
  }[severity];

  const Icon = styles.icon;

  return (
    <div
      id={`proctoring-flag-${severity}`}
      className={`inline-flex items-start gap-2.5 px-3 py-2 rounded-lg border text-xs leading-relaxed ${styles.bg}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2 font-semibold">
          <span>{eventType}</span>
          {timestamp && (
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-300">
              {timestamp}
            </span>
          )}
          <span className="uppercase text-[10px] font-bold px-1.5 py-0.2 rounded border border-current opacity-80">
            {severity}
          </span>
        </div>
        {description && <p className="mt-1 text-slate-300/90">{description}</p>}
      </div>
    </div>
  );
};
