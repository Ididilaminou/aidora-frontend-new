// ============================================================
// AIDORA — TYPES PERSONNEL
// ------------------------------------------------------------
// Comptes utilisateurs du personnel (banque, hôpital, admin).
// ============================================================

export type RolePersonnel =
  | "ADMINISTRATEUR"
  | "PERSONNEL_BANQUE"
  | "PERSONNEL_HOPITAL";

export type StatutCompte = "ACTIF" | "INACTIF" | "BLOQUE";

export interface Personnel {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: RolePersonnel;
  statut_compte?: StatutCompte;
  fonction?: string | null;
  etablissement_id?: number | null;
  etablissement_nom?: string | null;
  created_at?: string;
  date_creation?: string;
}

export interface ReponsePersonnels {
  personnels: Personnel[];
  total: number;
  page: number;
  limite: number;
}

// ============================================================
// Helpers
// ============================================================

export function nomCompletPersonnel(p: Personnel): string {
  return `${p.prenom ?? ""} ${p.nom ?? ""}`.trim();
}

export function libelleRole(r?: RolePersonnel): string {
  switch (r) {
    case "ADMINISTRATEUR":     return "Administrateur";
    case "PERSONNEL_BANQUE":   return "Personnel banque";
    case "PERSONNEL_HOPITAL":  return "Personnel hôpital";
    default:                   return "—";
  }
}

export function varianteRole(
  r?: RolePersonnel
): "primary" | "info" | "warning" | "neutral" {
  switch (r) {
    case "ADMINISTRATEUR":    return "warning";
    case "PERSONNEL_BANQUE":  return "primary";
    case "PERSONNEL_HOPITAL": return "info";
    default:                  return "neutral";
  }
}

export function libelleStatutCompte(s?: StatutCompte): string {
  switch (s) {
    case "ACTIF":   return "Actif";
    case "INACTIF": return "Inactif";
    case "BLOQUE":  return "Bloqué";
    default:        return "Inconnu";
  }
}

export function varianteStatutCompte(
  s?: StatutCompte
): "success" | "neutral" | "danger" {
  switch (s) {
    case "ACTIF":   return "success";
    case "INACTIF": return "neutral";
    case "BLOQUE":  return "danger";
    default:        return "neutral";
  }
}