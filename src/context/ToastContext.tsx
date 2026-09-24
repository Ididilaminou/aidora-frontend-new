// ============================================================
// AIDORA — CONTEXTE TOAST
// ------------------------------------------------------------
// Fournit une fonction `afficherToast` utilisable partout via
// le hook useToast.
// ============================================================

import {
  createContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { Toast, type ToastData, type ToastVariante } from "../components/ui/Toast";

interface ToastContextType {
  afficher: (message: string, variante?: ToastVariante, description?: string, duree?: number) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const retirer = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const afficher = useCallback(
    (
      message: string,
      variante: ToastVariante = "info",
      description?: string,
      duree = 4000
    ) => {
      const id = crypto.randomUUID();
      const nouveau: ToastData = { id, message, variante, description, duree };

      setToasts((prev) => [...prev, nouveau]);

      if (duree > 0) {
        setTimeout(() => retirer(id), duree);
      }
    },
    [retirer]
  );

  return (
    <ToastContext.Provider value={{ afficher }}>
      {children}

      {/* Conteneur de toasts (en haut à droite) */}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onFermer={retirer} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}