// ============================================================
// AIDORA — TYPES AUTH
// ============================================================

export interface LoginPayload {
  identifiant: string;
  motDePasse: string;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  motDePasse: string;
}