// ============================================================
// AIDORA — PERMISSIONS PAR RÔLE
// ------------------------------------------------------------
// Matrice complète des actions et des rôles autorisés.
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
  // -------- Dons (opérationnel BANQUE uniquement) --------
  "don.creer":      ["PERSONNEL_BANQUE"],
  "don.valider":    ["PERSONNEL_BANQUE"],
  "don.rejeter":    ["PERSONNEL_BANQUE"],
  "don.supprimer":  ["PERSONNEL_BANQUE"],

  // -------- Demandes --------
  // Créer → HÔPITAL uniquement
  "demande.creer":               ["PERSONNEL_HOPITAL"],
  // Traiter → BANQUE uniquement
  "demande.accepter":            ["PERSONNEL_BANQUE"],
  "demande.rejeter":             ["PERSONNEL_BANQUE"],
  "demande.livrer":              ["PERSONNEL_BANQUE"],
  // Confirmer réception → HÔPITAL uniquement
  "demande.confirmer_reception": ["PERSONNEL_HOPITAL"],
  "demande.annuler":             ["PERSONNEL_HOPITAL"],

  // -------- Poches (BANQUE uniquement) --------
  "poche.creer":           ["PERSONNEL_BANQUE"],
  "poche.changer_statut":  ["PERSONNEL_BANQUE"],
  "poche.supprimer":       ["PERSONNEL_BANQUE"],

  // -------- Stocks (BANQUE uniquement) --------
  "stock.creer":   ["PERSONNEL_BANQUE"],
  "stock.entree":  ["PERSONNEL_BANQUE"],
  "stock.ajuster": ["PERSONNEL_BANQUE"],
  "stock.seuil":   ["PERSONNEL_BANQUE"],

  // -------- RDV --------
  "rdv.creer_creneau":     ["PERSONNEL_BANQUE"],
  "rdv.supprimer_creneau": ["PERSONNEL_BANQUE"],
  "rdv.confirmer":         ["PERSONNEL_BANQUE"],
  "rdv.honorer":           ["PERSONNEL_BANQUE"],
  "rdv.annuler":           ["PERSONNEL_BANQUE", "DONNEUR"],
  "rdv.prendre":           ["DONNEUR"],

  // -------- Donneurs (BANQUE uniquement) --------
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