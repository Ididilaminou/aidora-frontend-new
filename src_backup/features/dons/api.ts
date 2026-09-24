// ============================================================
// AIDORA — API DONS
// ============================================================

import api from "../../services/api";
import type { Don, ReponseDons } from "../../types/don";

export interface FiltresDons {
  statut?: string;
  etablissement_id?: number;
  page?: number;
  limite?: number;
}

function nettoyer(filtres: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== undefined && v !== "")
  );
}

// ------------------------------------------------------------
// GET /api/dons — liste paginée
// ------------------------------------------------------------
export async function obtenirDons(
  filtres: FiltresDons = {}
): Promise<ReponseDons> {
  const reponse = await api.get("/dons", { params: nettoyer(filtres) });
  const data = reponse.data?.data ?? reponse.data ?? {};

  // Tolérance : le backend peut renvoyer :
  //   { data: { dons: [...] } }
  //   { data: [...] }
  //   [...]
  const dons: Don[] = Array.isArray(data?.dons)
    ? data.dons
    : Array.isArray(data)
    ? data
    : [];

  return {
    dons,
    total: data?.total ?? dons.length,
    page: data?.page ?? 1,
    limite: data?.limite ?? 20,
  };
}

// ------------------------------------------------------------
// GET /api/dons/:id
// ------------------------------------------------------------
export async function obtenirDon(id: number): Promise<Don> {
  const reponse = await api.get(`/dons/${id}`);
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// PATCH /api/dons/:id/valider
// ------------------------------------------------------------
export async function validerDon(id: number): Promise<Don> {
  const reponse = await api.patch(`/dons/${id}/valider`);
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// PATCH /api/dons/:id/rejeter
// ------------------------------------------------------------
export async function rejeterDon(
  id: number,
  motif?: string
): Promise<Don> {
  const reponse = await api.patch(`/dons/${id}/rejeter`, { motif });
  return reponse.data?.data ?? reponse.data;
}