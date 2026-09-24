// ============================================================
// AIDORA — SERVICE API (Axios)
// ------------------------------------------------------------
// Toutes les requêtes réseau passent par cette instance.
// • baseURL configurable via VITE_API_URL (dev + prod)
// • Ajoute automatiquement le token JWT
// • Redirige vers /connexion en cas de 401 (hors pages publiques)
// • Expose `extraireMessageErreur` réutilisable
// ============================================================

import axios from "axios";
import { storage } from "./storage";
import { ROUTES } from "../config/routes";

// ------------------------------------------------------------
// BASE URL
// ------------------------------------------------------------
// - En DEV  : VITE_API_URL est défini dans .env (ex: http://localhost:4000/api)
// - En PROD : VITE_API_URL est défini dans Vercel → Render
// - Fallback : localhost pour éviter les crashs si mal configuré
// ------------------------------------------------------------
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ------------------------------------------------------------
// ROUTES PUBLIQUES (pas de redirection 401)
// ------------------------------------------------------------
const ROUTES_PUBLIQUES = [
  "/",
  ROUTES.CONNEXION,
  ROUTES.INSCRIPTION,
  ROUTES.ACTIVATION,
];

function estPagePublique(pathname: string): boolean {
  return ROUTES_PUBLIQUES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
}

// ------------------------------------------------------------
// INSTANCE AXIOS
// ------------------------------------------------------------
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,   // 30s (utile quand Render est endormi)
});

// ------------------------------------------------------------
// INTERCEPTEUR REQUÊTE : ajoute le token JWT
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// INTERCEPTEUR RÉPONSE : gère le 401
// ------------------------------------------------------------
api.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    if (erreur?.response?.status === 401) {
      storage.viderSession();
      const path = window.location.pathname;
      if (!estPagePublique(path)) {
        window.location.href = ROUTES.CONNEXION;
      }
    }
    return Promise.reject(erreur);
  }
);

// ------------------------------------------------------------
// EXTRACTION DE MESSAGE D'ERREUR
// ------------------------------------------------------------
// ⚠️  Gère le cas où `erreur` est un objet { code, message }
//     (évite le crash React : "Objects are not valid as a React child")
// ------------------------------------------------------------
export function extraireMessageErreur(erreur: unknown): string {
  if (axios.isAxiosError(erreur)) {
    const data = erreur.response?.data as
      | { message?: string; erreur?: string; error?: string }
      | undefined;
    if (data?.message) return data.message;
    if (data?.erreur) return data.erreur;
    if (data?.error) return data.error;

    if (erreur.code === "ECONNABORTED") {
      return "Le serveur met trop de temps à répondre.";
    }
    if (!erreur.response) {
      return "Impossible de joindre le serveur. Vérifiez votre connexion.";
    }
    return `Erreur ${erreur.response.status}`;
  }

  // Cas : objet { code, message }
  if (typeof erreur === "object" && erreur !== null) {
    const e = erreur as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
    if (typeof e.erreur === "string") return e.erreur;
    if (typeof e.error === "string") return e.error;
  }

  if (erreur instanceof Error) return erreur.message;
  if (typeof erreur === "string") return erreur;

  return "Une erreur inattendue est survenue.";
}

export default api;