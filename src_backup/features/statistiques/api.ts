// ============================================================
// AIDORA — API STATISTIQUES
// ============================================================

import api from "../../services/api";

export interface StatsGlobales {
  donneurs: number;
  dons: number;
  etablissements: number;
  personnels: number;
  demandes: number;
  stocks: number;
  poches: number;

  demandesParStatut: Array<{ statut: string; total: number }>;
  stocksParType: Array<{ type_produit: string; total: number }>;
  etablissementsParType: Array<{ type: string; total: number }>;
  personnelsParRole: Array<{ role: string; total: number }>;

  demandesUrgentes: number;
  stocksFaibles: number;
}

export async function obtenirStatsGlobales(): Promise<StatsGlobales | null> {
  const reponse = await api.get("/statistiques/globales");
  return (reponse.data?.data ?? reponse.data) ?? null;
}

export async function obtenirDemandesParStatut(): Promise<
  Array<{ statut: string; total: number }>
> {
  const reponse = await api.get("/statistiques/demandes/par-statut");
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.donnees)
    ? data.donnees
    : Array.isArray(data)
    ? data
    : [];
}

export async function obtenirStocksParType(): Promise<
  Array<{ type_produit: string; total: number }>
> {
  const reponse = await api.get("/statistiques/stocks/par-type");
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.donnees)
    ? data.donnees
    : Array.isArray(data)
    ? data
    : [];
}

// ------------------------------------------------------------
// Libellés
// ------------------------------------------------------------

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