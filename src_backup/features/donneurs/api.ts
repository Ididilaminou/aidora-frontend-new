// ============================================================
// AIDORA — API DONNEUR
// ------------------------------------------------------------
// GET    /api/donneurs/moi
// PUT    /api/donneurs/moi
// PATCH  /api/donneurs/moi/disponibilite
// ============================================================

import api from "../../services/api";
import type { ProfilDonneur } from "../../types/donneur";
import type { Don } from "../../types/don";

// ------------------------------------------------------------
// Profil
// ------------------------------------------------------------

export async function obtenirMonProfil(): Promise<ProfilDonneur> {
  const reponse = await api.get("/donneurs/moi");
  return reponse.data?.data ?? reponse.data;
}

export async function mettreAJourMonProfil(
  payload: Partial<ProfilDonneur>
): Promise<ProfilDonneur> {
  const reponse = await api.put("/donneurs/moi", payload);
  return reponse.data?.data ?? reponse.data;
}

export async function basculerDisponibilite(
  disponible: boolean
): Promise<ProfilDonneur> {
  const reponse = await api.patch("/donneurs/moi/disponibilite", {
    disponible,
  });
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// Mes dons
// ------------------------------------------------------------

export async function obtenirMesDons(donneurId: number): Promise<Don[]> {
  const reponse = await api.get(`/dons/donneur/${donneurId}`);
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.dons)
    ? data.dons
    : Array.isArray(data)
    ? data
    : [];
}