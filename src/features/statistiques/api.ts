// ============================================================
// AIDORA — API STATISTIQUES
// ============================================================

import api from "../../services/api";

export type PeriodeStats = "JOURNALIER" | "HEBDOMADAIRE" | "MENSUEL" | "GLOBAL";

// ------------------------------------------------------------
// Stats globales (admin)
// ------------------------------------------------------------
export interface StatsGlobales {
  donneurs?: number;
  dons?: number;
  etablissements?: number;
  personnels?: number;
  demandes?: number;
  stocks?: number;
  poches?: number;
  demandesUrgentes?: number;
  stocksFaibles?: number;
  demandesParStatut?: Array<{ statut: string; total: number }>;
  stocksParType?: Array<{ type_produit: string; total: number }>;
  etablissementsParType?: Array<{ type: string; total: number }>;
  personnelsParRole?: Array<{ role: string; total: number }>;
}

// ------------------------------------------------------------
// Stats établissement (personnels)
// ------------------------------------------------------------
export interface StatsEtablissement {
  etablissement_id: number;
  periode?: string;
  dateDebut?: string;
  dateFin?: string;
  nombreDons?: number;
  volumeCollecte?: number;
  nombrePoches?: number;
  nombreDemandes?: number;
  stockActuel?: number;
}

// ------------------------------------------------------------
// Évolution des dons
// ------------------------------------------------------------
export interface PointEvolution {
  periode?: string;
  label?: string;
  total?: number;
  dons?: number;
  volume?: number;
}

// ============================================================
// APPELS
// ============================================================

export async function obtenirStatsGlobales(): Promise<StatsGlobales | null> {
  const reponse = await api.get("/statistiques/globales");
  return (reponse.data?.data ?? reponse.data) ?? null;
}

export async function obtenirStatsEtablissement(
  etablissementId: number,
  periode: PeriodeStats = "MENSUEL"
): Promise<StatsEtablissement | null> {
  const reponse = await api.get(
    `/statistiques/etablissement/${etablissementId}`,
    { params: { periode } }
  );
  return (reponse.data?.data ?? reponse.data) ?? null;
}

export async function obtenirEvolutionDons(
  periode: PeriodeStats = "MENSUEL"
): Promise<PointEvolution[]> {
  const reponse = await api.get("/statistiques/dons/evolution", {
    params: { periode },
  });
  const data = reponse.data?.data ?? reponse.data;
  const liste = data?.donnees ?? data?.evolution ?? data;
  return Array.isArray(liste) ? liste : [];
}

export async function obtenirDemandesParStatut(): Promise<
  Array<{ statut: string; total: number }>
> {
  const reponse = await api.get("/statistiques/demandes/par-statut");
  const data = reponse.data?.data ?? reponse.data;
  const liste = data?.donnees ?? data?.repartition ?? data;
  return Array.isArray(liste) ? liste : [];
}

export async function obtenirStocksParType(): Promise<
  Array<{ type_produit: string; total: number }>
> {
  const reponse = await api.get("/statistiques/stocks/par-type");
  const data = reponse.data?.data ?? reponse.data;
  const liste = data?.donnees ?? data?.repartition ?? data;
  return Array.isArray(liste) ? liste : [];
}

// ============================================================
// Helpers
// ============================================================

export function libelleStatutDemande(s: string): string {
  const map: Record<string, string> = {
    EN_ATTENTE: "En attente",
    ACCEPTEE: "Acceptée",
    REJETEE: "Rejetée",
    LIVREE: "Livrée",
    RECUE: "Reçue",
    ANNULEE: "Annulée",
  };
  return map[s] ?? s;
}

export function libelleTypeProduit(t: string): string {
  const map: Record<string, string> = {
    SANG_TOTAL: "Sang total",
    PLASMA: "Plasma",
    PLAQUETTES: "Plaquettes",
    GLOBULES_ROUGES: "Globules rouges",
  };
  return map[t] ?? t;
}

export function libelleTypeEtab(t: string): string {
  const map: Record<string, string> = {
    HOPITAL: "Hôpitaux",
    BANQUE_DE_SANG: "Banques de sang",
  };
  return map[t] ?? t;
}

export function libelleRole(r: string): string {
  const map: Record<string, string> = {
    ADMINISTRATEUR: "Administrateurs",
    PERSONNEL_BANQUE: "Personnel banque",
    PERSONNEL_HOPITAL: "Personnel hôpital",
    DONNEUR: "Donneurs",
  };
  return map[r] ?? r;
}

export const PERIODES: Array<{ value: PeriodeStats; label: string }> = [
  { value: "JOURNALIER",   label: "Aujourd'hui" },
  { value: "HEBDOMADAIRE", label: "Cette semaine" },
  { value: "MENSUEL",      label: "Ce mois" },
  { value: "GLOBAL",       label: "Tout" },
];

