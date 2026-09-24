// ============================================================
// AIDORA — PERMISSIONS PAR RÔLE
// ------------------------------------------------------------
// Matrice complète des actions et des rôles autorisés.
// Alignée sur les routes backend (authorize).
// ============================================================

import type { Role } from "./roles";

export type Action =
  // Dons
  | "don.creer"
  | "don.valider"
  | "don.rejeter"
  | "don.supprimer"
  // Demandes
  | "demande.creer"
  | "demande.accepter"
  | "demande.rejeter"
  | "demande.livrer"
  | "demande.confirmer_reception"
  | "demande.annuler"
  // Poches
  | "poche.creer"
  | "poche.changer_statut"
  | "poche.supprimer"
  // Stocks
  | "stock.creer"
  | "stock.entree"
  | "stock.ajuster"
  | "stock.seuil"
  // RDV
  | "rdv.creer_creneau"
  | "rdv.supprimer_creneau"
  | "rdv.confirmer"
  | "rdv.honorer"
  | "rdv.annuler"
  | "rdv.prendre"
  // Donneurs
  | "donneur.creer"
  | "donneur.rechercher"
  | "donneur.solliciter"
  // Admin
  | "etablissement.creer"
  | "etablissement.valider"
  | "etablissement.suspendre"
  | "utilisateur.creer"
  | "utilisateur.activer"
  | "utilisateur.desactiver"
  // IA
  | "evaluation.passer"
  // Rapports
  | "rapport.generer"
  | "rapport.telecharger"
  | "rapport.supprimer"
  // Notifications
  | "notification.supprimer";

// ============================================================
// MATRICE
// ============================================================

export const PERMISSIONS: Record<Action, Role[]> = {
  // -------- Dons (opérationnel BANQUE ; suppression = ADMIN) --------
  "don.creer":      ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],
  "don.valider":    ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],
  "don.rejeter":    ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],
  "don.supprimer":  ["ADMINISTRATEUR"],

  // -------- Demandes --------
  "demande.creer":               ["PERSONNEL_HOPITAL"],
  "demande.accepter":            ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],
  "demande.rejeter":             ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],
  "demande.livrer":              ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],
  "demande.confirmer_reception": ["PERSONNEL_HOPITAL"],
  "demande.annuler":             ["PERSONNEL_HOPITAL", "ADMINISTRATEUR"],

  // -------- Poches (BANQUE) --------
  "poche.creer":           ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],
  "poche.changer_statut":  ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],
  "poche.supprimer":       ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],

  // -------- Stocks (entrée banque ; ajustement/seuil admin) --------
  "stock.creer":   ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],
  "stock.entree":  ["PERSONNEL_BANQUE", "ADMINISTRATEUR"],
  "stock.ajuster": ["ADMINISTRATEUR"],
  "stock.seuil":   ["ADMINISTRATEUR"],

  // -------- RDV --------
  "rdv.creer_creneau":     ["PERSONNEL_BANQUE"],
  "rdv.supprimer_creneau": ["PERSONNEL_BANQUE"],
  "rdv.confirmer":         ["PERSONNEL_BANQUE"],
  "rdv.honorer":           ["PERSONNEL_BANQUE"],
  "rdv.annuler":           ["PERSONNEL_BANQUE", "DONNEUR"],
  "rdv.prendre":           ["DONNEUR"],

  // -------- Donneurs (BANQUE) --------
  "donneur.creer":      ["PERSONNEL_BANQUE"],
  "donneur.rechercher": ["PERSONNEL_BANQUE"],
  "donneur.solliciter": ["PERSONNEL_BANQUE"],

  // -------- ADMIN uniquement --------
  "etablissement.creer":    ["ADMINISTRATEUR"],
  "etablissement.valider":  ["ADMINISTRATEUR"],
  "etablissement.suspendre":["ADMINISTRATEUR"],
  "utilisateur.creer":      ["ADMINISTRATEUR"],
  "utilisateur.activer":    ["ADMINISTRATEUR"],
  "utilisateur.desactiver": ["ADMINISTRATEUR"],

  // -------- IA (DONNEUR) --------
  "evaluation.passer": ["DONNEUR"],

  // -------- Rapports --------
  "rapport.generer":     ["ADMINISTRATEUR"],
  "rapport.telecharger": ["ADMINISTRATEUR"],
  "rapport.supprimer":   ["ADMINISTRATEUR"],

  // -------- Notifications (tous) --------
  "notification.supprimer": [
    "DONNEUR",
    "PERSONNEL_BANQUE",
    "PERSONNEL_HOPITAL",
    "ADMINISTRATEUR",
  ],
};

export function aPermission(role: Role | undefined, action: Action): boolean {
  if (!role) return false;
  return PERMISSIONS[action]?.includes(role) ?? false;
}
