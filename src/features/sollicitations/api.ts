import api from "../../services/api";
import type { Sollicitation, DonneurCompatible } from "../../types/sollicitation";

export async function obtenirSollicitations(): Promise<Sollicitation[]> {
  const r = await api.get("/sollicitations");
  const data = r.data?.data ?? r.data;
  return Array.isArray(data?.sollicitations) ? data.sollicitations : [];
}

export async function obtenirDonneursCompatibles(
  groupe_sanguin: string,
  rhesus: string
): Promise<DonneurCompatible[]> {
  const r = await api.get("/sollicitations/donneurs-compatibles", {
    params: { groupe_sanguin, rhesus },
  });
  const data = r.data?.data ?? r.data;
  return Array.isArray(data?.donneurs) ? data.donneurs : [];
}

export async function creerSollicitation(payload: {
  donneur_id: number;
  message?: string;
  motif?: string;
}): Promise<Sollicitation> {
  const r = await api.post("/sollicitations", payload);
  return r.data?.data ?? r.data;
}

export async function repondreSollicitation(
  id: number,
  statut: "ACCEPTEE" | "REFUSEE"
): Promise<Sollicitation> {
  const r = await api.patch(`/sollicitations/${id}/repondre`, { statut });
  return r.data?.data ?? r.data;
}