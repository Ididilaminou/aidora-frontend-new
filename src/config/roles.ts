// ============================================================
// AIDORA — CONFIGURATION DES RÔLES
// ============================================================

import { ROUTES } from "./routes";

export type Role =
  | "DONNEUR"
  | "PERSONNEL_BANQUE"
  | "PERSONNEL_HOPITAL"
  | "ADMINISTRATEUR";

export const LIBELLES_ROLES: Record<Role, string> = {
  DONNEUR:            "Donneur",
  PERSONNEL_BANQUE:   "Personnel banque",
  PERSONNEL_HOPITAL:  "Personnel hôpital",
  ADMINISTRATEUR:     "Administrateur",
};

// ============================================================
// ROUTES PAR RÔLE
// ============================================================
// Chaque rôle voit UNIQUEMENT ce qui le concerne.
// ============================================================

export const ROUTES_PAR_ROLE: Record<Role, readonly string[]> = {
  // --------------------------------------------------------
  // DONNEUR — parcours personnel
  // --------------------------------------------------------
  DONNEUR: [
    ROUTES.DASHBOARD,
    ROUTES.DONNEUR_PROFIL,
    ROUTES.DONNEUR_CARTE,
    ROUTES.DONNEUR_EVALUATION,
    ROUTES.DONNEUR_DONS,
    ROUTES.DONNEUR_PRENDRE_RDV,
    ROUTES.DONNEUR_RDV,
    ROUTES.DONNEUR_RATTACHEMENTS,
    ROUTES.SOLLICITATIONS,
    ROUTES.NOTIFICATIONS,
    ROUTES.PARAMETRES,
  ],

  // --------------------------------------------------------
  // PERSONNEL HÔPITAL — UNIQUEMENT les demandes
  // (S'il est dans un hôpital AVEC banque, il reste
  //  personnel hôpital pour les demandes, c'est un autre
  //  personnel de type BANQUE qui gère la banque)
  // --------------------------------------------------------
  PERSONNEL_HOPITAL: [
    ROUTES.DASHBOARD,
    ROUTES.DEMANDES,
    ROUTES.CARTE_LOCALE,        // sa carte locale (hôpital + donneurs rattachés)
    ROUTES.NOTIFICATIONS,
    ROUTES.PARAMETRES,
  ],

  // --------------------------------------------------------
  // PERSONNEL BANQUE — opérationnel banque
  // --------------------------------------------------------
  PERSONNEL_BANQUE: [
    ROUTES.DASHBOARD,
    ROUTES.STOCKS,
    ROUTES.DONS,
    ROUTES.POCHES,
    ROUTES.DEMANDES,            // demandes reçues (à accepter/livrer)
    ROUTES.RDV,
    ROUTES.INVITATIONS,
    ROUTES.CARTE_LOCALE,        // sa carte locale
    ROUTES.SOLLICITATIONS,
    ROUTES.STATISTIQUES,        // stats de son établissement
    ROUTES.NOTIFICATIONS,
    ROUTES.PARAMETRES,
  ],

  // --------------------------------------------------------
  // ADMINISTRATEUR — gestion, PAS d'opérations métier
  // --------------------------------------------------------
  ADMINISTRATEUR: [
    ROUTES.DASHBOARD,
    ROUTES.ETABLISSEMENTS,      // créer / valider / suspendre
    ROUTES.UTILISATEURS,        // comptes personnel
    ROUTES.CARTE,               // carte globale de la plateforme
    ROUTES.STATISTIQUES,        // stats globales
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
  DONNEUR:            ROUTES.DASHBOARD,
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

export function aAcces(role: Role | undefined, route: string): boolean {
  if (!role) return false;
  return ROUTES_PAR_ROLE[role]?.includes(route) ?? false;
}

export function accueilPour(role: Role | undefined): string {
  if (!role) return ROUTES.CONNEXION;
  return ACCUEIL_PAR_ROLE[role] ?? ROUTES.CONNEXION;
}