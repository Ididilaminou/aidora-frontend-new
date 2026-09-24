// ============================================================
// AIDORA — API ÉTABLISSEMENTS
// ------------------------------------------------------------
// GET   /api/etablissements        → { data: [...] }
// GET   /api/etablissements/:id
// PATCH /api/etablissements/:id/valider
// PATCH /api/etablissements/:id/rejeter
// PATCH /api/etablissements/:id/suspendre
// PATCH /api/etablissements/:id/reactiver
// ============================================================

import api from "../../services/api";
import type { Etablissement } from "../../types/etablissement";

export interface FiltresEtablissements {
  type?: string;
  statut?: string;
  ville?: string;
}

function nettoyer(filtres: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== undefined && v !== "")
  );
}

export async function obtenirEtablissements(
  filtres: FiltresEtablissements = {}
): Promise<Etablissement[]> {
  const reponse = await api.get("/etablissements", {
    params: nettoyer(filtres),
  });
  const data = reponse.data?.data ?? reponse.data;

  // Tolérance : tableau direct, ou { etablissements: [...] }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.etablissements)) return data.etablissements;
  return [];
}

export async function obtenirEtablissement(
  id: number
): Promise<Etablissement> {
  const reponse = await api.get(`/etablissements/${id}`);
  return reponse.data?.data ?? reponse.data;
}

export async function validerEtablissement(
  id: number
): Promise<Etablissement> {
  const reponse = await api.patch(`/etablissements/${id}/valider`);
  return reponse.data?.data ?? reponse.data;
}

export async function rejeterEtablissement(
  id: number,
  motif?: string
): Promise<Etablissement> {
  const reponse = await api.patch(`/etablissements/${id}/rejeter`, { motif });
  return reponse.data?.data ?? reponse.data;
}

export async function suspendreEtablissement(
  id: number
): Promise<Etablissement> {
  const reponse = await api.patch(`/etablissements/${id}/suspendre`);
  return reponse.data?.data ?? reponse.data;
}

export async function reactiverEtablissement(
  id: number
): Promise<Etablissement> {
  const reponse = await api.patch(`/etablissements/${id}/reactiver`);
  return reponse.data?.data ?? reponse.data;
}

// ============================================================
// CRÉATION ÉTABLISSEMENT
// ============================================================

export interface CreerEtablissementPayload {
  nom: string;
  type: "BANQUE_DE_SANG" | "HOPITAL";
  possede_banque_de_sang?: boolean;  
  adresse?: string;
  ville?: string;
  region?: string;
  telephone?: string;
  email?: string;
  latitude: number;
  longitude: number;
}

export async function creerEtablissement(
  payload: CreerEtablissementPayload
): Promise<Etablissement> {
  const reponse = await api.post("/etablissements", payload);
  return reponse.data?.data ?? reponse.data;
}

// ============================================================
// MODIFIER ÉTABLISSEMENT
// ============================================================
export async function modifierEtablissement(
  id: number,
  payload: Partial<CreerEtablissementPayload>
): Promise<Etablissement> {
  const reponse = await api.put(`/etablissements/${id}`, payload);
  return reponse.data?.data ?? reponse.data;
}