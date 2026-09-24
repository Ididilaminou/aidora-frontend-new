// ============================================================
// AIDORA — TYPES UTILISATEUR
// ============================================================

export type Role =
  | "DONNEUR"
  | "PERSONNEL_BANQUE"
  | "PERSONNEL_HOPITAL"
  | "ADMINISTRATEUR";

export type StatutCompte = "ACTIF" | "INACTIF" | "BLOQUE";

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: Role;
  statut_compte?: StatutCompte;
  doit_changer_mot_de_passe?: boolean;
  etablissement_id?: number | null;
  fonction?: string;
  groupe_sanguin?: string;
  rhesus?: string;
  disponible?: boolean;
  ville?: string;
  quartier?: string;
}

export interface ReponseAuth {
  token: string;
  user: Utilisateur;
}