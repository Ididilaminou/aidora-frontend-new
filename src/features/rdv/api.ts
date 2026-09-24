// ============================================================
// AIDORA — API RDV + CRÉNEAUX
// ============================================================

import api from "../../services/api";
import type {
  Rdv,
  Creneau,
  CreerCreneauPayload,
} from "../../types/rdv";

// ------------------------------------------------------------
// Créneaux
// ------------------------------------------------------------

export async function obtenirCreneaux(
  filtres: { etablissement_id?: number } = {}
): Promise<Creneau[]> {
  const params = Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== undefined && v !== "")
  );
  const reponse = await api.get("/rdv/creneaux", { params });
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.creneaux)
    ? data.creneaux
    : Array.isArray(data)
    ? data
    : [];
}

export async function creerCreneau(
  payload: CreerCreneauPayload
): Promise<Creneau> {
  const reponse = await api.post("/rdv/creneaux", payload);
  return reponse.data?.data ?? reponse.data;
}

export async function supprimerCreneau(id: number): Promise<void> {
  await api.delete(`/rdv/creneaux/${id}`);
}

export async function desactiverCreneau(id: number): Promise<Creneau> {
  const reponse = await api.put(`/rdv/creneaux/${id}`, { est_actif: 0 });
  return reponse.data?.data ?? reponse.data;
}
// ------------------------------------------------------------
// RDV
// ------------------------------------------------------------

export async function obtenirRdvs(): Promise<Rdv[]> {
  const reponse = await api.get("/rdv");
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.rdvs)
    ? data.rdvs
    : Array.isArray(data)
    ? data
    : [];
}

export async function confirmerRdv(id: number): Promise<Rdv> {
  const reponse = await api.patch(`/rdv/${id}/confirmer`);
  return reponse.data?.data ?? reponse.data;
}

export async function honorerRdv(id: number): Promise<Rdv> {
  const reponse = await api.patch(`/rdv/${id}/honore`);
  return reponse.data?.data ?? reponse.data;
}

export async function annulerRdv(id: number): Promise<Rdv> {
  const reponse = await api.patch(`/rdv/${id}/annuler`);
  return reponse.data?.data ?? reponse.data;
}