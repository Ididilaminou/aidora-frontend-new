// ============================================================
// AIDORA — API DONS
// ============================================================

import api from "../../services/api";
import type { Don, ReponseDons } from "../../types/don";
import type { PocheSimple } from "../../types/don";

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

export async function obtenirDons(
  filtres: FiltresDons = {}
): Promise<ReponseDons> {
  const reponse = await api.get("/dons", { params: nettoyer(filtres) });
  const data = reponse.data?.data ?? reponse.data ?? {};

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

export async function obtenirDon(id: number): Promise<Don> {
  const reponse = await api.get(`/dons/${id}`);
  return reponse.data?.data ?? reponse.data;
}

export async function validerDon(id: number): Promise<Don> {
  const reponse = await api.patch(`/dons/${id}/valider`);
  return reponse.data?.data ?? reponse.data;
}

/** Motif obligatoire (backend : 3–500 caractères). */
export async function rejeterDon(
  id: number,
  motif: string
): Promise<Don> {
  const texte = (motif ?? "").trim();
  if (texte.length < 3) {
    throw new Error("Le motif de rejet doit contenir au moins 3 caractères.");
  }
  const reponse = await api.patch(`/dons/${id}/rejeter`, { motif: texte });
  return reponse.data?.data ?? reponse.data;
}

export interface CreerDonPayload {
  donneur_id: number;
  date_don: string;
  type_don: string;
  quantite: number;
}

export async function creerDon(payload: CreerDonPayload): Promise<Don> {
  const reponse = await api.post("/dons", payload);
  return reponse.data?.data ?? reponse.data;
}

export interface DonneurSimple {
  id: number;
  nom: string;
  prenom: string;
  groupe_sanguin?: string;
  rhesus?: string;
  telephone?: string;
  email?: string;
}

export async function rechercherDonneurs(): Promise<DonneurSimple[]> {
  try {
    const reponse = await api.get("/rattachements", {
      params: { disponible: 1 },
    });
    const data = reponse.data?.data ?? reponse.data;
    const liste = Array.isArray(data?.rattachements)
      ? data.rattachements
      : Array.isArray(data)
      ? data
      : [];

    const uniques = new Map<number, DonneurSimple>();

    for (const r of liste) {
      if (r.statut && r.statut !== "ACTIF") continue;
      if (!r.donneur_id) continue;
      if (uniques.has(r.donneur_id)) continue;

      uniques.set(r.donneur_id, {
        id: r.donneur_id,
        nom: r.donneur_nom ?? "",
        prenom: r.donneur_prenom ?? "",
        groupe_sanguin: r.groupe_sanguin,
        rhesus: r.rhesus,
        telephone: r.donneur_telephone,
        email: r.donneur_email,
      });
    }

    return Array.from(uniques.values());
  } catch {
    return [];
  }
}

export async function obtenirPochesDuDon(donId: number): Promise<PocheSimple[]> {
  const reponse = await api.get(`/dons/${donId}/poches`);
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.poches) ? data.poches : [];
}
