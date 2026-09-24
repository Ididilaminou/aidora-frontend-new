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

// ============================================================
// MESSAGES D'ERREUR PAR CODE MÉTIER
// ------------------------------------------------------------
// Ces codes viennent du backend (champ `code` dans la réponse).
// Ils permettent d'afficher un message clair à l'utilisateur
// même quand le backend envoie un message générique.
// ============================================================
const MESSAGES_PAR_CODE: Record<string, string> = {
  // ---- AUTH / INSCRIPTION ----
  UTILISATEUR_DEJA_EXISTANT:
    "Un compte existe déjà avec ce numéro de téléphone ou cet email. Essayez de vous connecter.",
  DONNEUR_DEJA_EXISTANT:
    "Un compte donneur existe déjà avec ces informations. Essayez de vous connecter.",
  EMAIL_DEJA_UTILISE:
    "Cet email est déjà utilisé par un autre compte.",
  TELEPHONE_DEJA_UTILISE:
    "Ce numéro de téléphone est déjà utilisé par un autre compte.",
  IDENTIFIANTS_INCORRECTS:
    "Email/téléphone ou mot de passe incorrect.",
  COMPTE_INACTIF:
    "Votre compte n'est pas encore activé. Saisissez votre code d'activation.",
  COMPTE_BLOQUE:
    "Votre compte a été bloqué. Contactez le support Aidora.",
  COMPTE_INTROUVABLE:
    "Aucun compte trouvé avec ces identifiants.",
  DONNEUR_INTROUVABLE:
    "Aucun compte donneur trouvé avec ces informations.",

  // ---- ACTIVATION ----
  CODE_INVALIDE:
    "Le code d'activation est incorrect. Vérifiez et réessayez.",
  CODE_EXPIRE:
    "Votre code d'activation a expiré. Cliquez sur « Renvoyer le code ».",
  AUCUNE_ACTIVATION:
    "Aucun code d'activation en attente pour ce numéro.",
  DEJA_ACTIF:
    "Ce compte est déjà activé. Vous pouvez vous connecter.",

  // ---- VALIDATION ----
  VALIDATION_ERROR:
    "Certains champs sont invalides. Vérifiez votre saisie.",
  ERREUR_VALIDATION:
    "Certains champs sont invalides. Vérifiez votre saisie.",

  // ---- SÉCURITÉ ----
  UNAUTHORIZED:
    "Vous devez être connecté pour effectuer cette action.",
  FORBIDDEN:
    "Vous n'avez pas les droits pour effectuer cette action.",
  TOKEN_EXPIRE:
    "Votre session a expiré. Reconnectez-vous.",
  TOKEN_INVALIDE:
    "Session invalide. Reconnectez-vous.",

  // ---- RATE LIMIT ----
  RATE_LIMIT:
    "Trop de tentatives. Réessayez dans quelques minutes.",
  TOO_MANY_REQUESTS:
    "Trop de requêtes. Patientez un instant.",

  // ---- RESSOURCES ----
  NOT_FOUND:
    "La ressource demandée est introuvable.",
  ROUTE_INTROUVABLE:
    "Cette page n'existe pas.",

  // ---- SYSTÈME ----
  ERREUR_SERVEUR:
    "Une erreur est survenue de notre côté. Réessayez dans quelques instants.",
  DATABASE_ERROR:
    "Problème de connexion à la base de données. Réessayez.",
};

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
  // ============================================================
  // CAS 1 : Erreur Axios (réponse du backend)
  // ============================================================
  if (axios.isAxiosError(erreur)) {
    const data = erreur.response?.data as
      | {
          message?: string;
          erreur?: string;
          error?: string;
          code?: string;
        }
      | undefined;

    // 1. Priorité absolue au CODE métier (le plus précis)
    if (data?.code && MESSAGES_PAR_CODE[data.code]) {
      return MESSAGES_PAR_CODE[data.code];
    }

    // 2. Message du backend (s'il n'est pas générique)
    if (data?.message && data.message !== "Erreur serveur") {
      return data.message;
    }
    if (data?.erreur) return data.erreur;
    if (data?.error) return data.error;

    // 3. Erreurs réseau
    if (erreur.code === "ECONNABORTED") {
      return "Le serveur met trop de temps à répondre. Vérifiez votre connexion.";
    }
    if (erreur.code === "ERR_NETWORK" || !erreur.response) {
      return "Impossible de joindre le serveur. Vérifiez votre connexion internet.";
    }

    // 4. Fallback par code HTTP
    switch (erreur.response.status) {
      case 400: return "Requête invalide.";
      case 401: return "Vous devez vous connecter.";
      case 403: return "Accès refusé.";
      case 404: return "Ressource introuvable.";
      case 409: return "Conflit : cette ressource existe déjà.";
      case 410: return "Cette ressource n'est plus disponible.";
      case 422: return "Certains champs sont invalides.";
      case 429: return "Trop de tentatives. Réessayez plus tard.";
      case 500: return "Erreur du serveur. Réessayez plus tard.";
      case 502:
      case 503:
      case 504: return "Le serveur est temporairement indisponible.";
      default:  return `Erreur ${erreur.response.status}`;
    }
  }

  // ============================================================
  // CAS 2 : Objet brut { code, message } (sans Axios)
  // ============================================================
  if (typeof erreur === "object" && erreur !== null) {
    const e = erreur as Record<string, unknown>;

    if (typeof e.code === "string" && MESSAGES_PAR_CODE[e.code]) {
      return MESSAGES_PAR_CODE[e.code];
    }
    if (typeof e.message === "string" && e.message !== "Erreur serveur") {
      return e.message;
    }
  }

  // ============================================================
  // CAS 3 : Erreur JS classique
  // ============================================================
  if (erreur instanceof Error) return erreur.message;
  if (typeof erreur === "string") return erreur;

  return "Une erreur inattendue est survenue.";
}

export default api;