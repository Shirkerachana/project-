import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message,
  onRetry
}) => {
  return (
    <div
      id="error-state"
      className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-900/50 bg-rose-950/20 text-rose-200"
    >
      <div className="w-11 h-11 rounded-full bg-rose-900/40 border border-rose-700/50 flex items-center justify-center text-rose-400 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-300 max-w-md mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
