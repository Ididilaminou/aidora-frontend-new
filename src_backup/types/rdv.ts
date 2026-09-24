// ============================================================
// AIDORA — TYPES RENDEZ-VOUS
// ------------------------------------------------------------
// ⚠️ Alignés sur la réponse réelle du backend :
//   GET /api/rdv       → { data: [...] }
//   GET /api/rdv/moi   → { data: [...] } (pour le donneur)
// ============================================================

export type StatutRdv =
  | "PLANIFIE"
  | "CONFIRME"
  | "ANNULE"
  | "HONORE"
  | "ABSENT";

export interface Rdv {
  id: number;
  donneur_id: number;
  etablissement_id: number;
  creneau_id?: number | null;

  date_rendez_vous: string;
  heure_rendez_vous: string;
  statut: StatutRdv;
  date_creation?: string;
  motif_annulation?: string | null;
  commentaire?: string | null;

  // Donneur (renvoyés à plat par le backend)
  donneur_nom?: string;
  donneur_prenom?: string;
  donneur_email?: string;
  donneur_telephone?: string;

  // Établissement
  etablissement_nom?: string;
  etablissement_ville?: string;
}

export interface ReponseRdvs {
  rdvs: Rdv[];
  total: number;
  page: number;
  limite: number;
}

// ============================================================
// Helpers
// ============================================================

export function nomCompletDonneurRdv(r: Rdv): string {
  return `${r.donneur_prenom ?? ""} ${r.donneur_nom ?? ""}`.trim() || "—";
}

export function dateRdv(r: Rdv): string {
  return new Date(r.date_rendez_vous).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function heureRdv(r: Rdv): string {
  // "09:00:00" → "09:00"
  return r.heure_rendez_vous?.slice(0, 5) ?? "—";
}

export function libelleStatutRdv(s?: StatutRdv): string {
  switch (s) {
    case "PLANIFIE": return "Planifié";
    case "CONFIRME": return "Confirmé";
    case "ANNULE":   return "Annulé";
    case "HONORE":   return "Honoré";
    case "ABSENT":   return "Absent";
    default:         return "Inconnu";
  }
}

export function varianteStatutRdv(
  s?: StatutRdv
): "info" | "success" | "danger" | "neutral" | "warning" {
  switch (s) {
    case "PLANIFIE": return "info";
    case "CONFIRME": return "success";
    case "HONORE":   return "success";
    case "ANNULE":   return "danger";
    case "ABSENT":   return "warning";
    default:         return "neutral";
  }
}

/** Vrai si le RDV est à venir */
export function estAVenir(r: Rdv): boolean {
  if (r.statut === "ANNULE" || r.statut === "HONORE" || r.statut === "ABSENT") {
    return false;
  }
  return new Date(r.date_rendez_vous).getTime() > Date.now() - 24 * 3600 * 1000;
}