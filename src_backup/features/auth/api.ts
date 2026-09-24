// ============================================================
// AIDORA — API AUTHENTIFICATION
// ============================================================

import api from "../../services/api";
import type { ReponseAuth } from "../../types/utilisateur";
import type { LoginPayload, RegisterPayload } from "./types";

export async function login(payload: LoginPayload): Promise<ReponseAuth> {
  const reponse = await api.post("/auth/login", payload);
  // Le backend peut renvoyer { data: { token, user } } ou { token, user }
  return reponse.data.data ?? reponse.data;
}

export async function register(payload: RegisterPayload): Promise<ReponseAuth> {
  const reponse = await api.post("/auth/register", payload);
  return reponse.data.data ?? reponse.data;
}