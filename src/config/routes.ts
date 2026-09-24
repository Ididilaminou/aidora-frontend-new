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
  CARTE_LOCALE: "/ma-carte-locale",

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
  DONNEUR_PRENDRE_RDV: "/prendre-rdv",
  DONNEUR_EVALUATION:    "/mon-evaluation", 
  CARTE: "/carte",
  SOLLICITATIONS: "/sollicitations",
  DONNEUR_CARTE: "/ma-carte",
  ACTIVATION: "/activation",
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
  [ROUTES.CARTE]: "Carte",
  [ROUTES.CARTE_LOCALE]: "Carte locale",

  // Donneur
  [ROUTES.DONNEUR_PROFIL]:        "Mon profil",
  [ROUTES.DONNEUR_DONS]:          "Mes dons",
  [ROUTES.DONNEUR_RDV]:           "Mes rendez-vous",
  [ROUTES.DONNEUR_RATTACHEMENTS]: "Mes rattachements",
  [ROUTES.DONNEUR_PRENDRE_RDV]: "Prendre un RDV",
  [ROUTES.DONNEUR_EVALUATION]:    "Pré-évaluation",
  [ROUTES.SOLLICITATIONS]: "Sollicitations",
  [ROUTES.DONNEUR_CARTE]: "Ma carte",
  [ROUTES.ACTIVATION]: "Activation",
  
};