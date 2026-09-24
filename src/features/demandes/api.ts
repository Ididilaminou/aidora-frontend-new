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

/**
 * Nettoie les filtres : retire tout ce qui est undefined / null / vide.
 * Empêche d'envoyer ?statut=&page= qui déclenche un 422.
 */
function nettoyer(f: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(f).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );
}

// ------------------------------------------------------------
// GET /api/demandes
// ------------------------------------------------------------
export async function obtenirDemandes(
  filtres: FiltresDemandes = {}
): Promise<ReponseDemandes> {
  const reponse = await api.get("/demandes", {
    params: nettoyer(filtres as Record<string, unknown>),
  });
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
export async function accepterDemande(
  id: number,
  commentaire?: string
): Promise<Demande> {
  const reponse = await api.patch(`/demandes/${id}/accepter`, {
    commentaire: commentaire || "Demande acceptée",
  });
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// PATCH /api/demandes/:id/rejeter
// ------------------------------------------------------------
export async function rejeterDemande(
  id: number,
  motif = "Rejeté par la banque"
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

// ------------------------------------------------------------
// POST /api/demandes
// ------------------------------------------------------------
export interface CreerDemandePayload {
  groupe_sanguin: string;
  rhesus: string;
  type_produit: string;
  quantite_demandee: number;
  urgence: number;
  motif?: string;
  etablissement_destinataire_id?: number;
}

export async function creerDemande(
  payload: CreerDemandePayload
): Promise<Demande> {
  const reponse = await api.post("/demandes", payload);
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// Banques destinataires (via recherche-proximite, accessible hôpital)
// ------------------------------------------------------------
export interface BanqueSimple {
  id: number;
  nom: string;
  ville?: string;
  adresse?: string;
}

export async function obtenirBanquesDestinataires(): Promise<BanqueSimple[]> {
  try {
    const reponse = await api.get("/etablissements/recherche-proximite", {
      params: { latitude: 3.848, longitude: 11.502, rayon: 10000 },
    });
    const data = reponse.data?.data ?? reponse.data;
    const liste = Array.isArray(data?.etablissements)
      ? data.etablissements
      : Array.isArray(data)
      ? data
      : [];
    return liste.filter(
      (e: BanqueSimple & { type?: string }) => e.type === "BANQUE_DE_SANG"
    );
  } catch {
    return [];
  }
}