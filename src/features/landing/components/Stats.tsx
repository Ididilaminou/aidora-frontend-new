// ============================================================
// AIDORA — STATS (landing)
// ------------------------------------------------------------
// Bandeau de 4 chiffres clés avec compteur animé qui monte
// de 0 jusqu'à la valeur cible quand la section devient visible.
// Les données viennent de l'API (fallback si indisponible).
// ============================================================

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import { useStatsPubliques } from "../hooks/useStatsPubliques";
import { cn } from "../../../utils/cn";

// ------------------------------------------------------------
// HOOK LOCAL : compteur animé
// ------------------------------------------------------------
function useCountUp(fin: number, actif: boolean, duree = 1600) {
  const [valeur, setValeur] = useState(0);

  useEffect(() => {
    if (!actif) return;

    // Reset si la valeur change (après chargement API)
    setValeur(0);

    let frame: number;
    const debut = performance.now();

    const tick = (t: number) => {
      const progression = Math.min((t - debut) / duree, 1);
      const eased = 1 - Math.pow(1 - progression, 3);
      setValeur(Math.floor(eased * fin));
      if (progression < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [fin, actif, duree]);

  return valeur;
}

// ------------------------------------------------------------
// ITEM
// ------------------------------------------------------------
interface StatItemProps {
  valeur: number;
  suffixe: string;
  libelle: string;
  icone: typeof Users;
  actif: boolean;
  delai: number;
}

function StatItem({
  valeur,
  suffixe,
  libelle,
  icone: Icone,
  actif,
  delai,
}: StatItemProps) {
  const compteur = useCountUp(valeur, actif, 1600 + delai);

  return (
    <div
      className={cn(
        "text-center transition-all duration-700",
        actif ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
      style={{ transitionDelay: `${delai}ms` }}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
        <Icone size={22} />
      </div>

      <div className="text-3xl font-extrabold text-neutral-900 dark:text-white md:text-4xl">
        {compteur.toLocaleString("fr-FR")}
        <span className="text-primary-500">{suffixe}</span>
      </div>

      <div className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
        {libelle}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// SECTION STATS
// ------------------------------------------------------------
export function Stats() {
  const { ref, visible } = useReveal();
  const { stats } = useStatsPubliques();

  return (
    <section
      ref={ref}
      className="border-y border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 lg:grid-cols-4 lg:px-8">
        {stats.map((s, i) => (
          <StatItem
            key={s.libelle}
            valeur={s.valeur}
            suffixe={s.suffixe}
            libelle={s.libelle}
            icone={s.icone}
            actif={visible}
            delai={i * 100}
          />
        ))}
      </div>
    </section>
  );
}