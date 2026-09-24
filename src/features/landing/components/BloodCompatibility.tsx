// ============================================================
// AIDORA — COMPATIBILITÉ SANGUINE (landing)
// ------------------------------------------------------------
// Section interactive : l'utilisateur clique sur un groupe
// sanguin (O−, A+, etc.) et voit à qui il peut donner.
// ============================================================

import { useState } from "react";
import { Droplets } from "lucide-react";
import { COMPATIBILITE, GROUPES } from "../data/content";
import { Badge } from "../../../components/ui/Badge";
import { useReveal } from "../hooks/useReveal";
import { cn } from "../../../utils/cn";

export function BloodCompatibility() {
  const { ref, visible } = useReveal();
  const [selectionne, setSelectionne] = useState("O−");

  return (
    <section
      id="compatibilite"
      ref={ref}
      className="bg-neutral-50 py-20 dark:bg-neutral-950 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ---------- EN-TÊTE ---------- */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge variante="primary" className="mb-4">
            Compatibilité
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white md:text-4xl lg:text-5xl">
            Qui peut donner à qui ?
          </h2>
          <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-400">
            Cliquez sur un groupe sanguin pour découvrir à qui il peut donner.
          </p>
        </div>

        {/* ---------- CONTENU ---------- */}
        <div
          className={cn(
            "mx-auto max-w-3xl transition-all duration-700",
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          )}
        >
          {/* ----- Boutons : tous les groupes ----- */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {GROUPES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectionne(g)}
                aria-pressed={selectionne === g}
                aria-label={`Voir la compatibilité du groupe ${g}`}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl font-bold transition-all duration-200",
                  selectionne === g
                    ? "scale-110 bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                    : "bg-white text-neutral-700 hover:bg-primary-50 hover:text-primary-600 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-primary-400"
                )}
              >
                {g}
              </button>
            ))}
          </div>

          {/* ----- Résultat ----- */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
            {/* En-tête du résultat */}
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
                <Droplets size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Un donneur
                </p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">
                  {selectionne}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Peut donner aux groupes suivants :
            </p>

            {/* Liste des groupes compatibles */}
            <div className="mt-3 flex flex-wrap gap-2">
              {COMPATIBILITE[selectionne].map((r) => (
                <span
                  key={r}
                  className="animate-scale-in rounded-xl bg-primary-50 px-3 py-1.5 text-sm font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}