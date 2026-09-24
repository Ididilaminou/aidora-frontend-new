// ============================================================
// AIDORA — ROUTES
// ============================================================

export const ROUTES = {
  // -------- Public --------
  CONNEXION:   "/connexion",
  INSCRIPTION: "/inscription",

  // -------- Générales (protégées) --------
  DASHBOARD:      "/dashboard",
  NOTIFICATIONS:  "/notifications",
  PARAMETRES:     "/parametres",

  // -------- Banque --------
  STOCKS:         "/stocks",
  DONS:           "/dons",
  POCHES:         "/poches",
  INVITATIONS:    "/invitations",
  RDV:            "/rdv",

  // -------- Hôpital + Banque --------
  DEMANDES:       "/demandes",

  // -------- Admin --------
  ETABLISSEMENTS: "/etablissements",
  UTILISATEURS:   "/utilisateurs",
  STATISTIQUES:   "/statistiques",
  RAPPORTS:       "/rapports",
  JOURNAL_AUDIT:  "/journal-audit",

  // -------- Donneur --------
  DONNEUR_PROFIL:        "/mon-profil",
  DONNEUR_DONS:          "/mes-dons",
  DONNEUR_RDV:           "/mes-rdv",
  DONNEUR_RATTACHEMENTS: "/mes-rattachements",
} as const;

// ============================================================
// LABELS
// ============================================================

export const LABELS_ROUTES: Record<string, string> = {
  [ROUTES.DASHBOARD]:      "Tableau de bord",
  [ROUTES.STOCKS]:         "Stocks",
  [ROUTES.DONS]:           "Dons",
  [ROUTES.POCHES]:         "Poches",
  [ROUTES.DEMANDES]:       "Demandes",
  [ROUTES.RDV]:            "Rendez-vous",
  [ROUTES.INVITATIONS]:    "Invitations",
  [ROUTES.ETABLISSEMENTS]: "Établissements",
  [ROUTES.UTILISATEURS]:   "Utilisateurs",
  [ROUTES.STATISTIQUES]:   "Statistiques",
  [ROUTES.RAPPORTS]:       "Rapports",
  [ROUTES.JOURNAL_AUDIT]:  "Journal d'audit",
  [ROUTES.NOTIFICATIONS]:  "Notifications",
  [ROUTES.PARAMETRES]:     "Paramètres",

  // Donneur
  [ROUTES.DONNEUR_PROFIL]:        "Mon profil",
  [ROUTES.DONNEUR_DONS]:          "Mes dons",
  [ROUTES.DONNEUR_RDV]:           "Mes rendez-vous",
  [ROUTES.DONNEUR_RATTACHEMENTS]: "Mes rattachements",
};