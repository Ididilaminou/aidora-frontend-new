// ============================================================
// AIDORA — SERVICE API (Axios)
// ------------------------------------------------------------
// Toutes les requêtes réseau passent par cette instance.
// • Ajoute automatiquement le token JWT
// • Redirige vers /connexion en cas de 401
// • Expose une fonction `extraireMessageErreur` réutilisable
// ============================================================

import axios from "axios";
import { storage } from "./storage";
import { ROUTES } from "../config/routes";

// ============================================================
// INSTANCE AXIOS
// ============================================================

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ============================================================
// INTERCEPTEUR REQUÊTE — ajoute le token
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ============================================================
// INTERCEPTEUR RÉPONSE — gère les 401
// ============================================================

api.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    if (erreur?.response?.status === 401) {
      storage.viderSession();
      if (!window.location.pathname.includes(ROUTES.CONNEXION)) {
        window.location.href = ROUTES.CONNEXION;
      }
    }
    return Promise.reject(erreur);
  }
);

// ============================================================
// UTILITAIRE — extraire un message d'erreur lisible
// ============================================================

export function extraireMessageErreur(erreur: unknown): string {
  if (axios.isAxiosError(erreur)) {
    // Message renvoyé par le backend
    const data = erreur.response?.data as
      | { message?: string; erreur?: string; error?: string }
      | undefined;
    if (data?.message) return data.message;
    if (data?.erreur) return data.erreur;
    if (data?.error) return data.error;

    // Message réseau par défaut
    if (erreur.code === "ECONNABORTED") {
      return "Le serveur met trop de temps à répondre.";
    }
    if (!erreur.response) {
      return "Impossible de joindre le serveur. Vérifiez votre connexion.";
    }
    return `Erreur ${erreur.response.status}`;
  }
  if (erreur instanceof Error) return erreur.message;
  return "Une erreur inattendue est survenue.";
}

export default api;