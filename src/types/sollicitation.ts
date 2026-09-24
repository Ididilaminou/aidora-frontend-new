export type StatutSollicitation = "ENVOYEE" | "ACCEPTEE" | "REFUSEE" | "EXPIREE";

export interface Sollicitation {
  id: number;
  donneur_id: number;
  personnel_id: number;
  date_sollicitation: string;
  message?: string;
  motif?: string;
  statut: StatutSollicitation;

  // Donneur
  donneur_nom?: string;
  donneur_prenom?: string;
  donneur_telephone?: string;
  donneur_email?: string;
  groupe_sanguin?: string;
  rhesus?: string;

  // Personnel
  personnel_nom?: string;
  personnel_prenom?: string;

  // Établissement
  etablissement_nom?: string;
}

export interface DonneurCompatible {
  donneur_id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  groupe_sanguin: string;
  rhesus: string;
  disponible: number | boolean;
}

export function libelleStatutSollicitation(s?: StatutSollicitation): string {
  switch (s) {
    case "ENVOYEE":  return "En attente";
    case "ACCEPTEE": return "Acceptée";
    case "REFUSEE":  return "Refusée";
    case "EXPIREE":  return "Expirée";
    default:         return "—";
  }
}

export function varianteStatutSollicitation(
  s?: StatutSollicitation
): "warning" | "success" | "danger" | "neutral" {
  switch (s) {
    case "ENVOYEE":  return "warning";
    case "ACCEPTEE": return "success";
    case "REFUSEE":  return "danger";
    case "EXPIREE":  return "neutral";
    default:         return "neutral";
  }
}

export function groupeSollicitation(s: Sollicitation): string {
  if (!s.groupe_sanguin) return "—";
  const signe = s.rhesus === "POSITIF" ? "+" : s.rhesus === "NEGATIF" ? "-" : "";
  return `${s.groupe_sanguin}${signe}`;
}