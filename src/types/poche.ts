// ============================================================
// AIDORA — TYPES POCHE
// ------------------------------------------------------------
// ⚠️ Alignés sur la réponse réelle du backend :
//   GET /api/poches → { data: { poches: [...], total, page, limite } }
//
// Champs réels : code_poche, volume, date_collecte, date_peremption,
// statut "EN_CONTROLE" | "DISPONIBLE" | "VENDUE" | ...
// ============================================================

export type StatutPoche =
  | "EN_CONTROLE"
  | "DISPONIBLE"
  | "RESERVEE"
  | "VENDUE"
  | "DISTRIBUEE"
  | "PERIMEE"
  | "REJETEE";

export interface Poche {
  id: number;
  don_id?: number | null;
  code_poche: string;

  groupe_sanguin?: string;
  rhesus?: string;
  type_produit?: string;

  volume?: number;
  date_collecte?: string;
  date_peremption?: string;
  date_vente?: string | null;
  prix_vente?: number | null;

  statut?: StatutPoche;
  etablissement_id?: number;
  personnel_responsable_id?: number;
  etablissement_nom?: string;
}

export interface ReponsePoches {
  poches: Poche[];
  total: number;
  page: number;
  limite: number;
}

// ============================================================
// Helpers
// ============================================================

export function groupePoche(p: Poche): string {
  const g = p.groupe_sanguin ?? "?";
  if (!p.rhesus) return g;
  const signe =
    p.rhesus === "POSITIF" ? "+" : p.rhesus === "NEGATIF" ? "-" : "";
  return `${g}${signe}`;
}

export function datePeremption(p: Poche): string {
  return p.date_peremption
    ? new Date(p.date_peremption).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
}

export function joursRestants(p: Poche): number | null {
  if (!p.date_peremption) return null;
  const diff = new Date(p.date_peremption).getTime() - Date.now();
  return Math.ceil(diff / (24 * 3600 * 1000));
}

export function libelleStatutPoche(s?: StatutPoche): string {
  switch (s) {
    case "EN_CONTROLE": return "En contrôle";
    case "DISPONIBLE":  return "Disponible";
    case "RESERVEE":    return "Réservée";
    case "VENDUE":      return "Vendue";
    case "DISTRIBUEE":  return "Distribuée";
    case "PERIMEE":     return "Périmée";
    case "REJETEE":     return "Rejetée";
    default:            return "—";
  }
}

export function varianteStatutPoche(
  s?: StatutPoche
): "success" | "warning" | "info" | "danger" | "neutral" {
  switch (s) {
    case "EN_CONTROLE": return "info";
    case "DISPONIBLE":  return "success";
    case "RESERVEE":    return "warning";
    case "VENDUE":      return "info";
    case "DISTRIBUEE":  return "info";
    case "PERIMEE":     return "danger";
    case "REJETEE":     return "danger";
    default:            return "neutral";
  }
}
export function formatTypeProduit(t?: string): string {
  const labels: Record<string, string> = {
    SANG_TOTAL: "Sang total",
    PLASMA: "Plasma",
    PLAQUETTES: "Plaquettes",
    GLOBULES_ROUGES: "Globules rouges",
  };
  return t ? labels[t] ?? t : "—";
}

export const STATUTS_POCHE = [
  { value: "EN_CONTROLE", label: "En contrôle" },
  { value: "DISPONIBLE",  label: "Disponible" },
  { value: "RESERVEE",    label: "Réservée" },
  { value: "VENDUE",      label: "Vendue" },
  { value: "DISTRIBUEE",  label: "Distribuée" },
  { value: "PERIMEE",     label: "Périmée" },
  { value: "REJETEE",     label: "Rejetée" },
] as const;

export interface LotPoche {
  prefixe: string;
  total: number;
  disponibles: number;
  en_controle: number;
  reservees: number;
  vendues: number;
  distribuees: number;
  perimees: number;
  rejetees: number;
  groupe_sanguin: string;
  rhesus: string;
  type_produit: string;
  volume_unitaire: number;
  date_collecte_min: string;
  date_peremption_max: string;
  etablissement_id: number;
  etablissement_nom?: string;
  poches: Array<{
    id: number;
    code_poche: string;
    statut: string;
    don_id: number | null;
  }>;
}