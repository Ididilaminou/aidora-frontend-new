// ============================================================
// AIDORA — API AUTHENTIFICATION
// ============================================================

import api from "../../services/api";
import type { ReponseAuth } from "../../types/utilisateur";

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------

export interface LoginPayload {
  identifiant: string;
  motDePasse: string;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email?: string;
  telephone: string;
  motDePasse: string;
  adresse?: string;
  ville?: string;
  quartier?: string;
  latitude?: number;
  longitude?: number;
  groupeSanguin: string;
  rhesus: string;
  codeInvitation?: string;
}

export interface ReponseInscription {
  message?: string;
  utilisateurId?: number;
  utilisateur_id?: number;
  telephone?: string;
  email?: string | null;
  dateExpiration?: string;
  codeActivation?: string;
}

export interface ActivationPayload {
  identifiant: string;
  codeActivation: string;
}

export interface RenvoiPayload {
  identifiant: string;
}

// ============================================================
// LOGIN
// ============================================================

export async function login(payload: LoginPayload): Promise<ReponseAuth> {
  const reponse = await api.post("/auth/login", payload);
  return reponse.data?.data ?? reponse.data;
}

// ============================================================
// INSCRIPTION DONNEUR
// ============================================================

export async function register(
  payload: RegisterPayload
): Promise<ReponseInscription> {
  const reponse = await api.post("/auth/inscription-donneur", payload);
  return reponse.data?.data ?? reponse.data;
}

// ============================================================
// ACTIVATION
// ============================================================

export async function activerCompte(payload: ActivationPayload) {
  // ✅ Le backend attend { identifiant, codeActivation }
  const reponse = await api.post("/auth/activation", {
    identifiant: payload.identifiant,
    codeActivation: payload.codeActivation,
  });
  return reponse.data?.data ?? reponse.data;
}

// ============================================================
// RENVOYER CODE
// ============================================================

export async function renvoyerCode(payload: RenvoiPayload) {
  // ✅ Le backend attend { identifiant }
  const reponse = await api.post("/auth/renvoyer-activation", {
    identifiant: payload.identifiant,
  });
  return reponse.data?.data ?? reponse.data;
}

// ============================================================
// MOT DE PASSE OUBLIÉ
// ============================================================

export async function demanderReset(payload: { identifiant: string }) {
  const reponse = await api.post("/auth/mot-de-passe-oublie", payload);
  return reponse.data?.data ?? reponse.data;
}

export async function reinitialiserMotDePasse(payload: {
  identifiant: string;
  code: string;
  nouveauMotDePasse: string;
}) {
  const reponse = await api.post("/auth/reinitialiser-mot-de-passe", payload);
  return reponse.data?.data ?? reponse.data;
}

// ============================================================
// MODIFIER MOT DE PASSE (connecté)
// ============================================================

export async function modifierMotDePasse(payload: {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}) {
  const reponse = await api.put("/auth/mot-de-passe", payload);
  return reponse.data?.data ?? reponse.data;
}

// ============================================================
// LOGOUT
// ============================================================

export async function logout() {
  const reponse = await api.post("/auth/logout");
  return reponse.data?.data ?? reponse.data;
}