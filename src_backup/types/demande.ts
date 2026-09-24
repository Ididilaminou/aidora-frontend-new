// ============================================================
// AIDORA — TYPES DEMANDE DE SANG
// ------------------------------------------------------------
// ⚠️ Alignés sur la réponse réelle du backend :
//   GET /api/demandes →
//     { data: { demandes: [...], total, page, limite } }
//
// Particularités :
//   - quantite_demandee (pas quantite)
//   - urgence est un NOMBRE : 0/1/2 (pas une string)
//   - demandeur_nom = nom de l'HÔPITAL (pas de l'utilisateur)
//   - traitant_* = personnel qui traite la demande
// ============================================================

export type StatutDemande =
  | "EN_ATTENTE"
  | "ACCEPTEE"
  | "REJETEE"
  | "LIVREE"
  | "RECUE"
  | "ANNULEE";

export interface Demande {
  id: number;

  // Établissements
  etablissement_demandeur_id: number;
  etablissement_destinataire_id?: number | null;
  demandeur_nom?: string;      // = nom de l'hôpital demandeur
  demandeur_ville?: string;
  destinataire_nom?: string;   // = nom de la banque

  // Détails
  groupe_sanguin?: string;
  rhesus?: string;
  type_produit?: string;
  quantite_demandee: number;
  urgence: number;             // 0=normale, 1=urgente, 2=critique
  motif?: string | null;

  // Statut + dates
  statut: StatutDemande;
  date_demande: string;
  date_traitement?: string | null;

  // Personnel traitant
  personnel_traitant_id?: number | null;
  traitant_nom?: string | null;
  traitant_prenom?: string | null;
}

export interface ReponseDemandes {
  demandes: Demande[];
  total: number;
  page: number;
  limite: number;
}

// ============================================================
// Helpers
// ============================================================

export function groupeDemande(d: Demande): string {
  const groupe = d.groupe_sanguin ?? "?";
  const rhesus = d.rhesus;
  if (!rhesus) return groupe;
  const signe =
    rhesus === "POSITIF" ? "+" : rhesus === "NEGATIF" ? "-" : "";
  return `${groupe}${signe}`;
}

export function dateDemande(d: Demande): string {
  return new Date(d.date_demande).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ------------------------------------------------------------
// Urgence : 0..2 → niveau + libellé + couleur
// ------------------------------------------------------------

export type NiveauUrgence = "NORMALE" | "URGENTE" | "CRITIQUE";

export function niveauUrgence(n: number): NiveauUrgence {
  if (n >= 2) return "CRITIQUE";
  if (n >= 1) return "URGENTE";
  return "NORMALE";
}

export function libelleUrgence(n: number): string {
  return {
    NORMALE: "Normale",
    URGENTE: "Urgente",
    CRITIQUE: "Critique",
  }[niveauUrgence(n)];
}

export function varianteUrgence(
  n: number
): "neutral" | "warning" | "danger" {
  return {
    NORMALE: "neutral",
    URGENTE: "warning",
    CRITIQUE: "danger",
  }[niveauUrgence(n)] as "neutral" | "warning" | "danger";
}

// ------------------------------------------------------------
// Statut
// ------------------------------------------------------------

export function varianteStatutDemande(
  s?: StatutDemande
): "success" | "warning" | "danger" | "neutral" | "info" {
  switch (s) {
    case "EN_ATTENTE": return "warning";
    case "ACCEPTEE":   return "info";
    case "LIVREE":     return "info";
    case "RECUE":      return "success";
    case "REJETEE":    return "danger";
    case "ANNULEE":    return "neutral";
    default:           return "neutral";
  }
}

export function libelleStatutDemande(s?: StatutDemande): string {
  switch (s) {
    case "EN_ATTENTE": return "En attente";
    case "ACCEPTEE":   return "Acceptée";
    case "REJETEE":    return "Rejetée";
    case "LIVREE":     return "Livrée";
    case "RECUE":      return "Reçue";
    case "ANNULEE":    return "Annulée";
    default:           return "Inconnu";
  }
}

export function nomTraitant(d: Demande): string | null {
  if (!d.traitant_prenom && !d.traitant_nom) return null;
  return `${d.traitant_prenom ?? ""} ${d.traitant_nom ?? ""}`.trim();
}