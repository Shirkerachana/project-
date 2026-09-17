import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((title: string, desc?: string) => showToast('success', title, desc), [showToast]);
  const error = useCallback((title: string, desc?: string) => showToast('error', title, desc), [showToast]);
  const info = useCallback((title: string, desc?: string) => showToast('info', title, desc), [showToast]);
  const warning = useCallback((title: string, desc?: string) => showToast('warning', title, desc), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div
        id="toast-container"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const bgColors = {
            success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
            error: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
            warning: 'bg-amber-950/90 border-amber-500/50 text-amber-200',
            info: 'bg-slate-900/95 border-sky-500/50 text-sky-200'
          };
          const Icons = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info
          };
          const Icon = Icons[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${bgColors[toast.type]}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <div className="font-semibold">{toast.title}</div>
                {toast.description && (
                  <div className="mt-0.5 text-xs opacity-90 leading-relaxed">{toast.description}</div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
