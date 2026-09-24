// ============================================================
// AIDORA — TOAST (affichage d'une notification)
// ------------------------------------------------------------
// Le composant est piloté par ToastContext.
// ============================================================

import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "../../utils/cn";

export type ToastVariante = "success" | "danger" | "warning" | "info";

export interface ToastData {
  id: string;
  message: string;
  description?: string;
  variante: ToastVariante;
  duree?: number;
}

const styles: Record<ToastVariante, { bg: string; icone: React.ReactNode }> = {
  success: {
    bg: "border-success-500/20 bg-success-50",
    icone: <CheckCircle2 size={18} className="text-success-500" />,
  },
  danger: {
    bg: "border-danger-500/20 bg-danger-50",
    icone: <XCircle size={18} className="text-danger-500" />,
  },
  warning: {
    bg: "border-warning-500/20 bg-warning-50",
    icone: <AlertTriangle size={18} className="text-warning-500" />,
  },
  info: {
    bg: "border-info-500/20 bg-info-50",
    icone: <Info size={18} className="text-info-500" />,
  },
};

interface ToastProps {
  toast: ToastData;
  onFermer: (id: string) => void;
}

export function Toast({ toast, onFermer }: ToastProps) {
  const style = styles[toast.variante];

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-card",
        "animate-slide-in-right",
        style.bg
      )}
    >
      <div className="mt-0.5 shrink-0">{style.icone}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">{toast.message}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onFermer(toast.id)}
        aria-label="Fermer"
        className="shrink-0 rounded-md p-1 text-neutral-400 dark:text-neutral-500 transition hover:bg-white/50 hover:text-neutral-700 dark:text-neutral-300"
      >
        <X size={14} />
      </button>
    </div>
  );
}