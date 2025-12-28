import { useEffect } from 'react';
import { UI_CONFIG } from '../config/gameConfig';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-900/90 border-emerald-600 text-emerald-100',
  error: 'bg-red-900/90 border-red-600 text-red-100',
  info: 'bg-blue-900/90 border-blue-600 text-blue-100',
};

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, UI_CONFIG.toastDurationMs);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        animate-[slideIn_0.2s_ease-out]
        ${TOAST_STYLES[toast.type]}
      `}
      role="alert"
      aria-live="polite"
    >
      <span className="text-lg font-bold">{TOAST_ICONS[toast.type]}</span>
      <span className="text-sm flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-current opacity-60 hover:opacity-100 transition-opacity p-1"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Toast container that manages multiple toast notifications.
 */
interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
