// ============================================================
// AIDORA — HOOKS AUTH
// ------------------------------------------------------------
// Point d'entrée pour les appels auth (ré-exports).
// Les pages utilisent souvent directement ../api ; ce module
// permet d'importer depuis features/auth/hooks si besoin.
// ============================================================

export {
  login,
  register,
  activerCompte,
  renvoyerCode,
  type LoginPayload,
  type RegisterPayload,
  type ActivationPayload,
  type ReponseInscription,
} from "./api";
