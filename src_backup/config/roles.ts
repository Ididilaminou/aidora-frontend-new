// ============================================================
// AIDORA — CONFIGURATION DES RÔLES
// ------------------------------------------------------------
// Centralise :
//   • Les libellés lisibles
//   • Les couleurs de badge
//   • Les pages accessibles par rôle
//   • La page d'accueil après login
// ============================================================

import { ROUTES } from "./routes";

export type Role =
  | "DONNEUR"
  | "PERSONNEL_BANQUE"
  | "PERSONNEL_HOPITAL"
  | "ADMINISTRATEUR";

// ------------------------------------------------------------
// Libellés
// ------------------------------------------------------------
export const LIBELLES_ROLES: Record<Role, string> = {
  DONNEUR:            "Donneur",
  PERSONNEL_BANQUE:   "Personnel banque",
  PERSONNEL_HOPITAL:  "Personnel hôpital",
  ADMINISTRATEUR:     "Administrateur",
};

// ------------------------------------------------------------
// Routes autorisées par rôle
// ------------------------------------------------------------
// ⚠️ L'ordre détermine l'ordre dans la sidebar.
// Pour ajouter une page : l'ajouter dans la bonne liste.
// ------------------------------------------------------------

export const ROUTES_PAR_ROLE: Record<Role, readonly string[]> = {
  // --------------------------------------------------------
  // DONNEUR
  // --------------------------------------------------------
  DONNEUR: [
    ROUTES.DONNEUR_PROFIL,
    ROUTES.DONNEUR_DONS,
    ROUTES.DONNEUR_RDV,
    ROUTES.DONNEUR_RATTACHEMENTS,
    ROUTES.NOTIFICATIONS,
    ROUTES.PARAMETRES,
  ],

  // --------------------------------------------------------
  // PERSONNEL HÔPITAL
  // --------------------------------------------------------
  PERSONNEL_HOPITAL: [
    ROUTES.DASHBOARD,
    ROUTES.DEMANDES,
    ROUTES.STOCKS,
    ROUTES.STATISTIQUES,
    ROUTES.RAPPORTS,
    ROUTES.NOTIFICATIONS,
    ROUTES.PARAMETRES,
  ],

  // --------------------------------------------------------
  // PERSONNEL BANQUE
  // --------------------------------------------------------
  PERSONNEL_BANQUE: [
    ROUTES.DASHBOARD,
    ROUTES.STOCKS,
    ROUTES.DONS,
    ROUTES.POCHES,
    ROUTES.DEMANDES,
    ROUTES.RDV,
    ROUTES.INVITATIONS,
    ROUTES.ETABLISSEMENTS,
    ROUTES.NOTIFICATIONS,
    ROUTES.PARAMETRES,
  ],

  // --------------------------------------------------------
  // ADMINISTRATEUR — accès à tout
  // --------------------------------------------------------
  ADMINISTRATEUR: [
    ROUTES.DASHBOARD,
    ROUTES.STOCKS,
    ROUTES.DONS,
    ROUTES.POCHES,
    ROUTES.DEMANDES,
    ROUTES.RDV,
    ROUTES.INVITATIONS,
    ROUTES.ETABLISSEMENTS,
    ROUTES.UTILISATEURS,
    ROUTES.STATISTIQUES,
    ROUTES.RAPPORTS,
    ROUTES.JOURNAL_AUDIT,
    ROUTES.NOTIFICATIONS,
    ROUTES.PARAMETRES,
  ],
};

// ------------------------------------------------------------
// Page d'accueil après connexion
// ------------------------------------------------------------
export const ACCUEIL_PAR_ROLE: Record<Role, string> = {
  DONNEUR:            ROUTES.DONNEUR_PROFIL,
  PERSONNEL_BANQUE:   ROUTES.DASHBOARD,
  PERSONNEL_HOPITAL:  ROUTES.DASHBOARD,
  ADMINISTRATEUR:     ROUTES.DASHBOARD,
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

export function estRoleValide(r: string | undefined): r is Role {
  return (
    r === "DONNEUR" ||
    r === "PERSONNEL_BANQUE" ||
    r === "PERSONNEL_HOPITAL" ||
    r === "ADMINISTRATEUR"
  );
}

/** Vrai si le rôle a accès à cette route */
export function aAcces(role: Role | undefined, route: string): boolean {
  if (!role) return false;
  return ROUTES_PAR_ROLE[role]?.includes(route) ?? false;
}

/** Retourne la page d'accueil d'un rôle */
export function accueilPour(role: Role | undefined): string {
  if (!role) return ROUTES.CONNEXION;
  return ACCUEIL_PAR_ROLE[role] ?? ROUTES.CONNEXION;
}