// ============================================================
// AIDORA — TYPES DONNEUR
// ------------------------------------------------------------
// ⚠️ Alignés sur la réponse réelle du backend :
//   GET /api/donneurs/moi → { data: {...} }
// ============================================================

export type StatutCompteDonneur = "ACTIF" | "INACTIF" | "BLOQUE";

export interface ProfilDonneur {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string | null;
  email: string;
  adresse?: string | null;

  statut_compte?: StatutCompteDonneur;
  groupe_sanguin?: string;
  rhesus?: string;
  date_naissance?: string;
  sexe?: "M" | "F";

  /** 0 ou 1 (nombre) côté backend */
  disponible?: number | boolean;

  latitude?: number | null;
  longitude?: number | null;
  etablissement_id?: number | null;
}

// ============================================================
// Helpers
// ============================================================

export function groupeAfficheDonneur(d?: ProfilDonneur): string {
  if (!d?.groupe_sanguin) return "—";
  if (!d.rhesus) return d.groupe_sanguin;
  const signe =
    d.rhesus === "POSITIF" ? "+" : d.rhesus === "NEGATIF" ? "-" : "";
  return `${d.groupe_sanguin}${signe}`;
}

export function estDisponible(d?: ProfilDonneur): boolean {
  if (!d) return false;
  if (typeof d.disponible === "boolean") return d.disponible;
  return d.disponible === 1;
}

export function ageDepuis(dateNaissance?: string): number | null {
  if (!dateNaissance) return null;
  const d = new Date(dateNaissance);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function libelleSexe(s?: "M" | "F"): string {
  return s === "M" ? "Homme" : s === "F" ? "Femme" : "—";
}