// ============================================================
// AIDORA — SERVICE DE STOCKAGE LOCAL
// ------------------------------------------------------------
// Encapsule localStorage. Seul endroit du code qui y touche.
// Permet de basculer plus tard vers sessionStorage / cookies
// en modifiant UNIQUEMENT ce fichier.
// ============================================================

import { STORAGE_KEYS } from "../config/constants";

export const storage = {
  // -------- Token --------
  getToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch {
      return null;
    }
  },
  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  // -------- Utilisateur --------
  getUtilisateur<T = unknown>(): T | null {
    try {
      const brut = localStorage.getItem(STORAGE_KEYS.UTILISATEUR);
      return brut ? (JSON.parse(brut) as T) : null;
    } catch {
      return null;
    }
  },
  setUtilisateur(utilisateur: unknown): void {
    localStorage.setItem(
      STORAGE_KEYS.UTILISATEUR,
      JSON.stringify(utilisateur)
    );
  },

  // -------- Nettoyage --------
  viderSession(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.UTILISATEUR);
  },

  viderTout(): void {
    Object.values(STORAGE_KEYS).forEach((cle) =>
      localStorage.removeItem(cle)
    );
  },
};