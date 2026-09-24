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
  statut: string
): Promise<Poche> {
  const reponse = await api.patch(`/poches/${id}/statut`, { statut });
  return reponse.data?.data ?? reponse.data;
}