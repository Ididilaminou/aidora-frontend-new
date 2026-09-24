// ============================================================
// AIDORA — API JOURNAL D'AUDIT
// ------------------------------------------------------------
// GET /api/journal-audit
// GET /api/journal-audit/utilisateur/:id
// ============================================================

import api from "../../services/api";

export interface EntreeAudit {
  id: number;
  utilisateur_id?: number;
  utilisateur_nom?: string;
  utilisateur_prenom?: string;
  action: string;
  entite?: string;
  entite_id?: number | null;
  details?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  date_action?: string;
  created_at?: string;
}

export async function obtenirJournalAudit(
  filtres: { utilisateur_id?: number; action?: string } = {}
): Promise<EntreeAudit[]> {
  const params = Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== undefined && v !== "")
  );
  const reponse = await api.get("/journal-audit", { params });
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.journal)
    ? data.journal
    : Array.isArray(data?.entrees)
    ? data.entrees
    : Array.isArray(data)
    ? data
    : [];
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

export function varianteAction(
  action: string
): "success" | "danger" | "warning" | "info" | "neutral" {
  const a = action.toUpperCase();
  if (a.includes("CONNEXION") || a.includes("CREATION") || a.includes("VALIDATION")) {
    return "success";
  }
  if (a.includes("SUPPRESSION") || a.includes("REJET") || a.includes("ECHEC")) {
    return "danger";
  }
  if (a.includes("MODIFICATION") || a.includes("MISE_A_JOUR")) {
    return "warning";
  }
  return "info";
}

export function dateAudit(e: EntreeAudit): string {
  const iso = e.date_action ?? e.created_at;
  return iso
    ? new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
}