// ============================================================
// AIDORA — API PERSONNELS
// ------------------------------------------------------------
// GET    /api/personnels
// GET    /api/personnels/moi
// GET    /api/personnels/:id
// PATCH  /api/personnels/:id/activer
// PATCH  /api/personnels/:id/desactiver
// DELETE /api/personnels/:id
// ============================================================

import api from "../../services/api";
import type { Personnel, ReponsePersonnels } from "../../types/personnel";

export interface FiltresPersonnels {
  role?: string;
  statut_compte?: string;
  etablissement_id?: number;
  page?: number;
  limite?: number;
}

function nettoyer(filtres: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== undefined && v !== "")
  );
}

export async function obtenirPersonnels(
  filtres: FiltresPersonnels = {}
): Promise<ReponsePersonnels> {
  const reponse = await api.get("/personnels", {
    params: nettoyer(filtres),
  });
  const data = reponse.data?.data ?? reponse.data ?? {};

  const personnels: Personnel[] = Array.isArray(data?.personnels)
    ? data.personnels
    : Array.isArray(data)
    ? data
    : [];

  return {
    personnels,
    total: data?.total ?? personnels.length,
    page: data?.page ?? 1,
    limite: data?.limite ?? 20,
  };
}

export async function obtenirPersonnel(id: number): Promise<Personnel> {
  const reponse = await api.get(`/personnels/${id}`);
  return reponse.data?.data ?? reponse.data;
}

export async function activerPersonnel(id: number): Promise<Personnel> {
  const reponse = await api.patch(`/personnels/${id}/activer`);
  return reponse.data?.data ?? reponse.data;
}

export async function desactiverPersonnel(id: number): Promise<Personnel> {
  const reponse = await api.patch(`/personnels/${id}/desactiver`);
  return reponse.data?.data ?? reponse.data;
}

export async function supprimerPersonnel(id: number): Promise<void> {
  await api.delete(`/personnels/${id}`);
}