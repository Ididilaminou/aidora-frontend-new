// ============================================================
// AIDORA — CONSTANTES GLOBALES
// ============================================================

export const APP = {
  NOM: "Aidora",
  SLOGAN: "Ensemble, sauvons des vies.",
  VERSION: "1.0.0",
} as const;

// Clés localStorage (centralisées pour éviter les fautes)
export const STORAGE_KEYS = {
  TOKEN: "aidora_token",
  UTILISATEUR: "aidora_utilisateur",
  THEME: "aidora_theme",
} as const;

// Groupes sanguins disponibles
export const GROUPES_SANGUINS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export type GroupeSanguin = (typeof GROUPES_SANGUINS)[number];