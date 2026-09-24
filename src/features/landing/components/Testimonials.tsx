// ============================================================
// AIDORA — TÉMOIGNAGES (landing)
// ------------------------------------------------------------
// 3 cartes d'avis de donneurs avec notes étoilées.
// Affiche un badge "5/5" + citation + auteur + ville.
// ============================================================

import { Star, Quote } from "lucide-react";
import { TEMOIGNAGES } from "../data/content";
import { Badge } from "../../../components/ui/Badge";
import { useReveal } from "../hooks/useReveal";
import { cn } from "../../../utils/cn";

// Couleurs selon la variante de chaque témoignage
const COULEURS = {
  primary: {
    avatar: "bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400",
    badge:  "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400",
  },
  success: {
    avatar: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500",
    badge:  "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500",
  },
  warning: {
    avatar: "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500",
    badge:  "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500",
  },
} as const;

export function Testimonials() {
  const { ref, visible } = useReveal();

  return (
    <section
      ref={ref}
      className="bg-white py-20 dark:bg-neutral-900 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ---------- EN-TÊTE ---------- */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variante="primary" className="mb-4">
            Témoignages
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white md:text-4xl lg:text-5xl">
            Ils ont déjà sauvé des vies
          </h2>
          <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-400">
            Découvrez ce que nos donneurs disent de leur expérience avec Aidora.
          </p>
        </div>

        {/* ---------- GRILLE ---------- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TEMOIGNAGES.map((t, i) => {
            const couleurs = COULEURS[t.couleur];

            return (
              <div
                key={t.nom}
                className={cn(
                  "group relative flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-700 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-800",
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                )}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Icône guillemet décorative */}
                <Quote
                  size={48}
                  className="absolute right-4 top-4 text-primary-100/60 dark:text-primary-900/40"
                  aria-hidden
                />

                {/* Étoiles */}
                <div className="relative mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={16}
                      className={cn(
                        idx < t.note
                          ? "fill-warning-500 text-warning-500"
                          : "text-neutral-300 dark:text-neutral-700"
                      )}
                    />
                  ))}
                </div>

                {/* Texte */}
                <p className="relative flex-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  «&nbsp;{t.texte}&nbsp;»
                </p>

                {/* Auteur */}
                <div className="relative mt-6 flex items-center gap-3 border-t border-neutral-100 pt-5 dark:border-neutral-800">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      couleurs.avatar
                    )}
                  >
                    {t.initiales}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                      {t.nom}
                    </p>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {t.role} · {t.ville}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}