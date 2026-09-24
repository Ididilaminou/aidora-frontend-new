// ============================================================
// AIDORA — TYPES ÉVALUATION IA
// ============================================================

export type ResultatEvaluation = "ELIGIBLE" | "NON_ELIGIBLE" | "A_VERIFIER";

export interface EvaluationIA {
  id: number;
  donneur_id: number;
  date_evaluation: string;
  date_expiration?: string;
  valide: number | boolean;
  motif_invalidation?: string | null;
  reponses: string | Record<string, unknown>;
  resultat: ResultatEvaluation;
  analyse: string;
  donneur_nom?: string;
  donneur_prenom?: string;
}

export interface ReponsesQuestionnaire {
  poids: number;
  a_ete_malade_recemment: boolean;
  a_pris_antibiotiques: boolean;
  a_subi_chirurgie_recente: boolean;
  est_enceinte: boolean;
  a_transfusion_recente: boolean;
  a_hepatite_ou_vih: boolean;
  a_voyage_zone_risque: boolean;
  consomme_drogues: boolean;
  a_pris_medicament_regular: boolean;
  a_tatouage_recent: boolean;
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

export function libelleResultat(r?: ResultatEvaluation): string {
  switch (r) {
    case "ELIGIBLE":     return "Éligible";
    case "NON_ELIGIBLE": return "Non éligible";
    case "A_VERIFIER":   return "À vérifier";
    default:             return "—";
  }
}

export function varianteResultat(
  r?: ResultatEvaluation
): "success" | "danger" | "warning" {
  switch (r) {
    case "ELIGIBLE":     return "success";
    case "NON_ELIGIBLE": return "danger";
    case "A_VERIFIER":   return "warning";
    default:             return "warning";
  }
}

export function estValide(e: EvaluationIA): boolean {
  if (typeof e.valide === "boolean") return e.valide;
  return e.valide === 1;
}

export function parseReponses(
  e: EvaluationIA
): Record<string, unknown> {
  if (typeof e.reponses === "string") {
    try {
      return JSON.parse(e.reponses);
    } catch {
      return {};
    }
  }
  return e.reponses ?? {};
}