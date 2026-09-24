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
}

export interface ReponseInscription {
  message?: string;
  utilisateurId?: number;
  utilisateur_id?: number;
  telephone?: string;
  email?: string | null;
  dateExpiration?: string;
  token?: string;
  user?: unknown;
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

export async function register(payload: RegisterPayload): Promise<ReponseInscription> {
  const reponse = await api.post("/auth/inscription-donneur", payload);
  return reponse.data?.data ?? reponse.data;
}

// ============================================================
// ACTIVATION (code reçu par SMS/email)
// Le mot de passe est défini à l'inscription — pas à l'activation.
// ============================================================

export interface ActivationPayload {
  code: string;
  telephone?: string;
  courriel?: string;
}

export async function activerCompte(payload: ActivationPayload) {
  const reponse = await api.post("/auth/activation", payload);
  return reponse.data?.data ?? reponse.data;
}

// ============================================================
// RENVOYER CODE D'ACTIVATION
// ============================================================

export async function renvoyerCode(telephone: string) {
  const reponse = await api.post("/auth/renvoyer-activation", { telephone });
  return reponse.data?.data ?? reponse.data;
}
