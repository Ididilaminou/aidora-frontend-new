// ============================================================
// AIDORA — TYPES RENDEZ-VOUS + CRÉNEAUX
// ============================================================

// ============================================================
// RDV
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

// ------------------------------------------------------------
// Helpers RDV
// ------------------------------------------------------------

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

export function estAVenir(r: Rdv): boolean {
  if (r.statut === "ANNULE" || r.statut === "HONORE" || r.statut === "ABSENT") {
    return false;
  }
  return new Date(r.date_rendez_vous).getTime() > Date.now() - 24 * 3600 * 1000;
}

// ============================================================
// CRÉNEAUX
// ============================================================

export interface Creneau {
  id: number;
  etablissement_id: number;
  date_creneau: string;
  heure_debut: string;
  heure_fin: string;
  capacite_max: number;
  places_restantes: number;
  est_actif: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReponseCreneaux {
  creneaux: Creneau[];
}

export interface CreerCreneauPayload {
  etablissement_id?: number;
  date_creneau: string;
  heure_debut: string;
  heure_fin: string;
  capacite_max: number;
}

// ------------------------------------------------------------
// Helpers créneaux
// ------------------------------------------------------------

export function estActif(c: Creneau): boolean {
  if (typeof c.est_actif === "boolean") return c.est_actif;
  return c.est_actif === 1;
}

export function placesDisponibles(c: Creneau): number {
  return Math.max(0, c.places_restantes ?? 0);
}

export function tauxRemplissage(c: Creneau): number {
  if (!c.capacite_max) return 0;
  const utilises = c.capacite_max - placesDisponibles(c);
  return Math.min(100, Math.max(0, (utilises / c.capacite_max) * 100));
}

export function formatDateCreneau(c: Creneau): string {
  return new Date(c.date_creneau).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatHeure(h: string): string {
  return h?.slice(0, 5) ?? "—";
}