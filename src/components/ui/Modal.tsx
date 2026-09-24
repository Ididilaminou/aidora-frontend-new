// ============================================================
// AIDORA — MODALE
// ------------------------------------------------------------
// Ferme au clic extérieur + touche Échap. Bloque le scroll
// du body quand ouverte. Hauteur max + scroll interne.
// ============================================================

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface ModalProps {
  ouverte: boolean;
  onFermer: () => void;
  titre?: string;
  description?: string;
  taille?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  footer?: ReactNode;
}

const tailles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  ouverte,
  onFermer,
  titre,
  description,
  taille = "md",
  children,
  footer,
}: ModalProps) {
  // Fermer avec Échap + bloquer le scroll
  useEffect(() => {
    if (!ouverte) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFermer();
    }
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [ouverte, onFermer]);

  if (!ouverte) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onFermer}
        aria-hidden
      />

      {/* Contenu */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titre ? "modal-titre" : undefined}
        className={cn(
          "relative flex w-full flex-col rounded-2xl bg-white shadow-float",
          "animate-scale-in",
          // 🆕 Hauteur max + marge sous le haut/bas de l'écran
          "max-h-[90vh]",
          "dark:bg-neutral-900",
          tailles[taille]
        )}
      >
        {/* Header fixe en haut */}
        {(titre || description) && (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <div>
              {titre && (
                <h2
                  id="modal-titre"
                  className="text-lg font-semibold text-neutral-900 dark:text-white"
                >
                  {titre}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onFermer}
              aria-label="Fermer"
              className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer fixe en bas */}
        {footer && (
          <div className="flex shrink-0 justify-end gap-3 border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}