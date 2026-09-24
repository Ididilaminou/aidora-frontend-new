// ============================================================
// AIDORA — HOOK : useStatsPubliques
// ------------------------------------------------------------
// Récupère les statistiques publiques depuis l'API.
// En cas d'erreur (route absente, pas connecté), retourne
// les valeurs par défaut définies dans data/content.ts.
// ============================================================

import { useQuery } from "@tanstack/react-query";
import api from "../../../services/api";
import { STATS as STATS_FALLBACK } from "../data/content";

// ------------------------------------------------------------
// Type : une stat prête à afficher
// ------------------------------------------------------------
export interface StatAffichee {
  valeur: number;
  suffixe: string;
  libelle: string;
  icone: (typeof STATS_FALLBACK)[number]["icone"];
}

// ------------------------------------------------------------
// Transforme la réponse API → tableau de stats à afficher
// ------------------------------------------------------------
function transformerReponse(data: unknown): StatAffichee[] | null {
  if (!data || typeof data !== "object") return null;

  const d = data as Record<string, unknown>;

  // Cherche les valeurs sous plusieurs noms possibles
  const donneurs      = Number(d.donneurs ?? d.totalDonneurs ?? NaN);
  const etablissements = Number(d.etablissements ?? d.totalEtablissements ?? NaN);
  const dons          = Number(d.dons ?? d.totalDons ?? NaN);

  // Si AUCUNE donnée valide → on retourne null (fallback)
  const aucuneDonnee =
    Number.isNaN(donneurs) &&
    Number.isNaN(etablissements) &&
    Number.isNaN(dons);

  if (aucuneDonnee) return null;

  // On garde les icônes et libellés du contenu par défaut
  return [
    {
      valeur: Number.isNaN(donneurs) ? STATS_FALLBACK[0].valeur : donneurs,
      suffixe: "+",
      libelle: STATS_FALLBACK[0].libelle,
      icone: STATS_FALLBACK[0].icone,
    },
    {
      valeur: Number.isNaN(etablissements) ? STATS_FALLBACK[1].valeur : etablissements,
      suffixe: "+",
      libelle: STATS_FALLBACK[1].libelle,
      icone: STATS_FALLBACK[1].icone,
    },
    {
      valeur: Number.isNaN(dons) ? STATS_FALLBACK[2].valeur : dons,
      suffixe: "+",
      libelle: STATS_FALLBACK[2].libelle,
      icone: STATS_FALLBACK[2].icone,
    },
    {
      valeur: STATS_FALLBACK[3].valeur,   // le taux de satisfaction reste statique
      suffixe: "%",
      libelle: STATS_FALLBACK[3].libelle,
      icone: STATS_FALLBACK[3].icone,
    },
  ];
}

// ------------------------------------------------------------
// Hook principal
// ------------------------------------------------------------
export function useStatsPubliques() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats-publiques"],
    queryFn: async () => {
      try {
        const reponse = await api.get("/statistiques/publiques");
        return reponse.data?.data ?? reponse.data;
      } catch {
        // Silencieux : pas grave si la route n'existe pas encore
        return null;
      }
    },
    staleTime: 5 * 60_000,   // cache 5 min
    retry: 0,                 // pas de retry (route publique)
    refetchOnWindowFocus: false,
  });

  const stats = transformerReponse(data) ?? STATS_FALLBACK;

  return {
    stats,
    chargement: isLoading,
    utiliseFallback: !data,
  };
}