// ============================================================
// AIDORA — DROPDOWN DE RECHERCHE
// ------------------------------------------------------------
// Affiche les résultats de recherche groupés par catégorie.
// ============================================================

import { FileText, Droplets, ClipboardList, Building2, Search } from "lucide-react";
import type { ResultatRecherche, CategorieRecherche } from "../../hooks/useRechercheGlobale";
import { cn } from "../../utils/cn";

// ------------------------------------------------------------
// Icône selon la catégorie
// ------------------------------------------------------------
const ICONES: Record<CategorieRecherche, typeof FileText> = {
  Page:          FileText,
  Poche:         Droplets,
  Demande:       ClipboardList,
  Établissement: Building2,
};

const COULEURS: Record<CategorieRecherche, string> = {
  Page:          "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  Poche:         "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
  Demande:       "bg-warning-50 text-warning-500 dark:bg-warning-500/10 dark:text-warning-500",
  Établissement: "bg-info-50 text-info-500 dark:bg-info-500/10 dark:text-info-500",
};

interface SearchDropdownProps {
  resultats: ResultatRecherche[];
  requete: string;
  onSelectionner: (route: string) => void;
}

export function SearchDropdown({
  resultats,
  requete,
  onSelectionner,
}: SearchDropdownProps) {
  // Aucun résultat
  if (resultats.length === 0) {
    return (
      <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-float dark:border-neutral-700 dark:bg-neutral-900">
        <div className="px-4 py-8 text-center">
          <Search size={24} className="mx-auto mb-2 text-neutral-300" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Aucun résultat pour «&nbsp;{requete}&nbsp;»
          </p>
        </div>
      </div>
    );
  }

  // Grouper par catégorie
  const groupes = resultats.reduce<Record<string, ResultatRecherche[]>>(
    (acc, r) => {
      (acc[r.categorie] ??= []).push(r);
      return acc;
    },
    {}
  );

  // Ordre d'affichage des catégories
  const ordre: CategorieRecherche[] = ["Page", "Poche", "Demande", "Établissement"];

  return (
    <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[28rem] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-float dark:border-neutral-700 dark:bg-neutral-900">
      {ordre.map((cat) => {
        const items = groupes[cat];
        if (!items || items.length === 0) return null;

        const Icone = ICONES[cat];

        return (
          <div key={cat}>
            {/* En-tête de catégorie */}
            <div className="border-b border-neutral-100 bg-neutral-50/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400">
              {cat}
              {cat !== "Page" ? "s" : ""} · {items.length}
            </div>

            {/* Items */}
            <ul>
              {items.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => onSelectionner(r.route)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-primary-50 dark:hover:bg-neutral-800"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        COULEURS[r.categorie]
                      )}
                    >
                      <Icone size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {r.label}
                      </p>
                      {r.description && (
                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}