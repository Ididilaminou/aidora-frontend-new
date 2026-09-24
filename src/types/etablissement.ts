// ============================================================
// AIDORA — TYPES ÉTABLISSEMENT
// ------------------------------------------------------------
// ⚠️ Alignés sur la réponse réelle du backend :
//   GET /api/etablissements → { data: [...] }  (pas paginé)
//
// Types   : HOPITAL | BANQUE_DE_SANG
// Statuts : ACTIF | INACTIF | EN_ATTENTE_VERIFICATION
//           | SUSPENDU | REJETE
// ============================================================

export type TypeEtablissement = "HOPITAL" | "BANQUE_DE_SANG";

export type StatutEtablissement =
  | "ACTIF"
  | "INACTIF"
  | "EN_ATTENTE_VERIFICATION"
  | "SUSPENDU"
  | "REJETE";

export interface Etablissement {
  id: number;
  nom: string;
  type: TypeEtablissement;
  statut?: StatutEtablissement;

  /** ⚠️ Un hôpital peut avoir sa propre banque de sang */
  possede_banque_de_sang?: number | boolean;

  adresse?: string;
  ville?: string;
  region?: string;

  telephone?: string;
  email?: string;

  latitude?: number;
  longitude?: number;
  distance_km?: number;
  created_at?: string;
}

// Helper
export function possedeBanque(e?: Etablissement): boolean {
  if (!e) return false;
  if (typeof e.possede_banque_de_sang === "boolean") return e.possede_banque_de_sang;
  return e.possede_banque_de_sang === 1;
}

export function estHopitalAvecBanque(e?: Etablissement): boolean {
  return e?.type === "HOPITAL" && possedeBanque(e);
}



// ============================================================
// Helpers d'affichage
// ============================================================

export function libelleType(t?: TypeEtablissement): string {
  if (t === "HOPITAL") return "Hôpital";
  if (t === "BANQUE_DE_SANG") return "Banque de sang";
  return "—";
}

export function varianteType(
  t?: TypeEtablissement
): "primary" | "info" | "neutral" {
  if (t === "BANQUE_DE_SANG") return "primary";
  if (t === "HOPITAL") return "info";
  return "neutral";
}

export function libelleStatutEtab(s?: StatutEtablissement): string {
  switch (s) {
    case "ACTIF":                     return "Actif";
    case "INACTIF":                   return "Inactif";
    case "EN_ATTENTE_VERIFICATION":   return "En attente";
    case "SUSPENDU":                  return "Suspendu";
    case "REJETE":                    return "Rejeté";
    default:                          return "Inconnu";
  }
}

export function varianteStatutEtab(
  s?: StatutEtablissement
): "success" | "warning" | "danger" | "neutral" {
  switch (s) {
    case "ACTIF":                     return "success";
    case "EN_ATTENTE_VERIFICATION":   return "warning";
    case "SUSPENDU":                  return "neutral";
    case "REJETE":                    return "danger";
    case "INACTIF":                   return "neutral";
    default:                          return "neutral";
  }
}

export function localisation(e: Etablissement): string {
  return [e.ville, e.region].filter(Boolean).join(", ") || "—";
}

export function estEnAttente(e: Etablissement): boolean {
  return e.statut === "EN_ATTENTE_VERIFICATION";
}

export function estActif(e: Etablissement): boolean {
  return e.statut === "ACTIF";
}