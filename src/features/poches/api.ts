// ============================================================
// AIDORA — API POCHES
// ------------------------------------------------------------
// GET   /api/poches
// GET   /api/poches/:id
// PATCH /api/poches/:id/statut
// ============================================================

import api from "../../services/api";
import type { Poche, ReponsePoches } from "../../types/poche";

export interface FiltresPoches {
  groupe_sanguin?: string;
  rhesus?: string;
  statut?: string;
  type_produit?: string;
  etablissement_id?: number;
  page?: number;
  limite?: number;
}

function nettoyer(f: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(f).filter(([, v]) => v !== undefined && v !== "")
  );
}

export async function obtenirPoches(
  filtres: FiltresPoches = {}
): Promise<ReponsePoches> {
  const reponse = await api.get("/poches", {
    params: nettoyer(filtres),
  });
  const data = reponse.data?.data ?? reponse.data ?? {};

  const poches: Poche[] = Array.isArray(data?.poches)
    ? data.poches
    : Array.isArray(data)
    ? data
    : [];

  return {
    poches,
    total: data?.total ?? poches.length,
    page: data?.page ?? 1,
    limite: data?.limite ?? 20,
  };
}


export async function changerStatutPoche(
  id: number,
  statut: string,
  commentaire?: string
): Promise<Poche> {
  const reponse = await api.patch(`/poches/${id}/statut`, {
    statut,
    commentaire,
  });
  return reponse.data?.data ?? reponse.data;
}

export async function supprimerPoche(id: number): Promise<void> {
  await api.delete(`/poches/${id}`);
}

export interface CreerPochePayload {
  code_poche?: string;
  don_id?: number;
  groupe_sanguin: string;
  rhesus: string;
  type_produit: string;
  volume: number;
  date_collecte: string;
  date_peremption: string;
  etablissement_id: number;
  statut?: string;
}

export async function creerPoche(payload: CreerPochePayload): Promise<Poche> {
  const reponse = await api.post("/poches", payload);
  return reponse.data?.data ?? reponse.data;
}

import type { LotPoche } from "../../types/poche";

export async function obtenirLots(filtres: { statut?: string } = {}): Promise<LotPoche[]> {
  const params = Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== undefined && v !== "")
  );
  const reponse = await api.get("/poches/lots", { params });
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.lots) ? data.lots : [];
}