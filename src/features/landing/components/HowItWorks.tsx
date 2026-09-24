// ============================================================
// AIDORA — COMMENT ÇA MARCHE (landing)
// ------------------------------------------------------------
// 4 étapes numérotées (01 → 04) avec icônes et ligne
// de connexion en arrière-plan sur desktop.
// ============================================================

import { ETAPES } from "../data/content";
import { Badge } from "../../../components/ui/Badge";
import { useReveal } from "../hooks/useReveal";
import { cn } from "../../../utils/cn";

export function HowItWorks() {
  const { ref, visible } = useReveal();

  return (
    <section
      id="fonctionnement"
      ref={ref}
      className="relative bg-neutral-50 py-20 dark:bg-neutral-950 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ---------- EN-TÊTE ---------- */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variante="primary" className="mb-4">
            Comment ça marche
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white md:text-4xl lg:text-5xl">
            Donner son sang n'a jamais
            <br className="hidden md:block" /> été aussi simple
          </h2>
          <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-400">
            Quatre étapes suffisent pour rejoindre la communauté Aidora et
            commencer à sauver des vies.
          </p>
        </div>

        {/* ---------- GRILLE DES ÉTAPES ---------- */}
        <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Ligne horizontale en arrière-plan (desktop uniquement) */}
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent dark:via-primary-800 lg:block" />

          {ETAPES.map((e, i) => {
            const Icone = e.icone;
            return (
              <div
                key={e.titre}
                className={cn(
                  "group relative rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-700 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-800",
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                )}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Numéro 01, 02, 03, 04 en filigrane */}
                <span className="pointer-events-none absolute right-4 top-3 text-5xl font-extrabold text-primary-50 transition-colors group-hover:text-primary-100 dark:text-primary-900/30 dark:group-hover:text-primary-900/50">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative">
                  {/* Icône */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-sm transition-transform duration-300 group-hover:scale-110 dark:bg-primary-500/10 dark:text-primary-400">
                    <Icone size={22} />
                  </div>

                  {/* Titre */}
                  <h3 className="mt-5 text-lg font-bold text-neutral-900 dark:text-white">
                    {e.titre}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {e.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}