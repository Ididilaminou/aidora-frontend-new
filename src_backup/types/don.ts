// ============================================================
// AIDORA — TYPES DON
// ------------------------------------------------------------
// ⚠️ Alignés sur la réponse réelle du backend :
//   GET /api/dons →
//     { data: { dons: [...], total, page, limite } }
//
// Un don contient :
//   id, donneur_id, personnel_id, etablissement_id,
//   date_don, type_don, quantite, statut, created_at,
//   donneur_nom, donneur_prenom,
//   etablissement_nom,
//   personnel_nom, personnel_prenom
// ============================================================

export type StatutDon = "EN_ATTENTE" | "VALIDE" | "REJETE" | "ANNULE";

export type TypeDon =
  | "SANG_TOTAL"
  | "PLASMA"
  | "PLAQUETTES"
  | "GLOBULES_ROUGES";

export interface Don {
  id: number;
  donneur_id: number;
  personnel_id?: number | null;
  etablissement_id: number;

  date_don: string;
  type_don: TypeDon;
  quantite: number;
  statut: StatutDon;
  created_at?: string;

  donneur_nom: string;
  donneur_prenom: string;

  etablissement_nom: string;

  personnel_nom?: string | null;
  personnel_prenom?: string | null;
}

export interface ReponseDons {
  dons: Don[];
  total: number;
  page: number;
  limite: number;
}

// ============================================================
// Helpers d'affichage
// ============================================================

export function nomCompletDonneur(don: Don): string {
  return `${don.donneur_prenom} ${don.donneur_nom}`.trim();
}

export function nomCompletPersonnel(don: Don): string | null {
  if (!don.personnel_prenom && !don.personnel_nom) return null;
  return `${don.personnel_prenom ?? ""} ${don.personnel_nom ?? ""}`.trim();
}

export function formatDateDon(don: Don): string {
  return new Date(don.date_don).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateHeure(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTypeDon(type: TypeDon): string {
  const labels: Record<TypeDon, string> = {
    SANG_TOTAL: "Sang total",
    PLASMA: "Plasma",
    PLAQUETTES: "Plaquettes",
    GLOBULES_ROUGES: "Globules rouges",
  };
  return labels[type] ?? type;
}

export function varianteStatut(
  statut?: StatutDon
): "success" | "warning" | "danger" | "neutral" {
  switch (statut) {
    case "VALIDE":     return "success";
    case "EN_ATTENTE": return "warning";
    case "REJETE":     return "danger";
    case "ANNULE":     return "neutral";
    default:           return "neutral";
  }
}

export function libelleStatut(statut?: StatutDon): string {
  switch (statut) {
    case "VALIDE":     return "Validé";
    case "EN_ATTENTE": return "En attente";
    case "REJETE":     return "Rejeté";
    case "ANNULE":     return "Annulé";
    default:           return "Inconnu";
  }
}