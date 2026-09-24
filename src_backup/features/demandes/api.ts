// ============================================================
// AIDORA — API DEMANDES
// ============================================================

import api from "../../services/api";
import type { Demande, ReponseDemandes } from "../../types/demande";

export interface FiltresDemandes {
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
// GET /api/demandes
// ------------------------------------------------------------
export async function obtenirDemandes(
  filtres: FiltresDemandes = {}
): Promise<ReponseDemandes> {
  const reponse = await api.get("/demandes", { params: nettoyer(filtres) });
  const data = reponse.data?.data ?? reponse.data ?? {};

  const demandes: Demande[] = Array.isArray(data?.demandes)
    ? data.demandes
    : Array.isArray(data)
    ? data
    : [];

  return {
    demandes,
    total: data?.total ?? demandes.length,
    page: data?.page ?? 1,
    limite: data?.limite ?? 20,
  };
}

// ------------------------------------------------------------
// GET /api/demandes/:id
// ------------------------------------------------------------
export async function obtenirDemande(id: number): Promise<Demande> {
  const reponse = await api.get(`/demandes/${id}`);
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// PATCH /api/demandes/:id/accepter
// ------------------------------------------------------------
export async function accepterDemande(id: number): Promise<Demande> {
  const reponse = await api.patch(`/demandes/${id}/accepter`);
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// PATCH /api/demandes/:id/rejeter
// ------------------------------------------------------------
export async function rejeterDemande(
  id: number,
  motif?: string
): Promise<Demande> {
  const reponse = await api.patch(`/demandes/${id}/rejeter`, { motif });
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// PATCH /api/demandes/:id/livrer
// ------------------------------------------------------------
export async function livrerDemande(id: number): Promise<Demande> {
  const reponse = await api.patch(`/demandes/${id}/livrer`);
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// PATCH /api/demandes/:id/confirmer-reception
// ------------------------------------------------------------
export async function confirmerReceptionDemande(
  id: number
): Promise<Demande> {
  const reponse = await api.patch(`/demandes/${id}/confirmer-reception`);
  return reponse.data?.data ?? reponse.data;
}