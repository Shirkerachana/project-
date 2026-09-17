import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  variant?: 'skeleton' | 'spinner' | 'card';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  variant = 'skeleton',
  count = 3
}) => {
  if (variant === 'spinner') {
    return (
      <div id="loading-spinner" className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-400">{message}</p>
      </div>
    );
  }

  return (
    <div id="loading-skeletons" className="space-y-4 w-full py-4 animate-pulse">
      {message && (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>{message}</span>
        </div>
      )}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-20 bg-slate-900/60 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between"
        >
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-800/70 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
};
