// ============================================================
// AIDORA — API RAPPORTS
// ------------------------------------------------------------
// GET    /api/rapports
// GET    /api/rapports/:id
// GET    /api/rapports/:id/telecharger
// POST   /api/rapports/generer
// DELETE /api/rapports/:id
// ============================================================

import api from "../../services/api";

export type TypeRapport = "DONS" | "DEMANDES" | "STOCKS" | "PERSONNELS" | "ETABLISSEMENTS" | "AUDIT";
export type FormatRapport = "PDF" | "EXCEL" | "CSV";

export interface Rapport {
  id: number;
  titre?: string;
  nom?: string;
  type?: TypeRapport;
  format?: FormatRapport;
  periode_debut?: string;
  periode_fin?: string;
  statut?: "EN_COURS" | "PRET" | "ERREUR";
  url_telechargement?: string;
  taille_octets?: number;
  created_at?: string;
  date_creation?: string;
}

export async function obtenirRapports(): Promise<Rapport[]> {
  const reponse = await api.get("/rapports");
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.rapports)
    ? data.rapports
    : Array.isArray(data)
    ? data
    : [];
}

export async function genererRapport(payload: {
  type: TypeRapport;
  format_export: FormatRapport;
  date_debut?: string;
  date_fin?: string;
  etablissement_id?: number;
}): Promise<Rapport> {
  const reponse = await api.post("/rapports/generer", payload);
  return reponse.data?.data ?? reponse.data;
}

export async function supprimerRapport(id: number): Promise<void> {
  await api.delete(`/rapports/${id}`);
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

export function libelleTypeRapport(t?: TypeRapport): string {
  switch (t) {
    case "DONS":           return "Dons";
    case "DEMANDES":       return "Demandes";
    case "STOCKS":         return "Stocks";
    case "PERSONNELS":     return "Personnels";
    case "ETABLISSEMENTS": return "Établissements";
    case "AUDIT":          return "Audit";
    default:               return "—";
  }
}

export function varianteStatutRapport(
  s?: string
): "success" | "warning" | "danger" | "neutral" {
  switch (s) {
    case "PRET":    return "success";
    case "EN_COURS": return "warning";
    case "ERREUR":  return "danger";
    default:        return "neutral";
  }
}