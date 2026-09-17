import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false
}) => {
  const variantStyles = {
    danger: {
      btn: 'bg-rose-600 hover:bg-rose-500 text-white',
      icon: AlertCircle,
      iconColor: 'text-rose-400'
    },
    warning: {
      btn: 'bg-amber-600 hover:bg-amber-500 text-white',
      icon: AlertTriangle,
      iconColor: 'text-amber-400'
    },
    primary: {
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      icon: Info,
      iconColor: 'text-indigo-400'
    }
  }[variant];

  const Icon = variantStyles.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl bg-slate-800 shrink-0 ${variantStyles.iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-sm text-slate-300 leading-relaxed pt-0.5">{message}</div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95 ${variantStyles.btn}`}
        >
          {isLoading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
