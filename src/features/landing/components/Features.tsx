// ============================================================
// AIDORA — FONCTIONNALITÉS (landing)
// ------------------------------------------------------------
// Grille de 6 cartes présentant les fonctionnalités clés.
// Chaque carte a un halo de lumière qui apparaît au survol.
// ============================================================

import { FONCTIONNALITES } from "../data/content";
import { Badge } from "../../../components/ui/Badge";
import { useReveal } from "../hooks/useReveal";
import { cn } from "../../../utils/cn";

export function Features() {
  const { ref, visible } = useReveal();

  return (
    <section
      id="fonctionnalites"
      ref={ref}
      className="bg-white py-20 dark:bg-neutral-900 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ---------- EN-TÊTE ---------- */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variante="primary" className="mb-4">
            Fonctionnalités
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white md:text-4xl lg:text-5xl">
            Tout ce dont vous avez besoin,
            <br className="hidden md:block" /> au même endroit
          </h2>
          <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-400">
            Aidora rassemble les outils essentiels pour les donneurs et les
            établissements de santé.
          </p>
        </div>

        {/* ---------- GRILLE ---------- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FONCTIONNALITES.map((f, i) => {
            const Icone = f.icone;
            return (
              <div
                key={f.titre}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-800",
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                )}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Halo au survol (apparaît progressivement) */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-100/0 blur-2xl transition-all duration-500 group-hover:bg-primary-100/60 dark:group-hover:bg-primary-900/30" />

                <div className="relative">
                  {/* Icône */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-transform duration-300 group-hover:scale-110 dark:bg-primary-500/10 dark:text-primary-400">
                    <Icone size={22} />
                  </div>

                  {/* Titre */}
                  <h3 className="mt-5 text-lg font-bold text-neutral-900 dark:text-white">
                    {f.titre}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {f.description}
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