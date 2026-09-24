// ============================================================
// AIDORA — API STOCK + POCHES
// ------------------------------------------------------------
// Endpoints réels du backend :
//   GET  /api/stock          (paginé)
//   GET  /api/stock/alertes/seuils
//   GET  /api/stock/etablissement/:id
//   GET  /api/poches
// ============================================================

import api from "../../services/api";
import type { Stock, ReponsePaginee } from "../../types/banque";

export interface FiltresStocks {
  etablissement_id?: number;
  groupe_sanguin?: string;
  rhesus?: string;
  type_produit?: string;
  page?: number;
  limite?: number;
}

function nettoyer(filtres: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== undefined && v !== "")
  );
}

// ------------------------------------------------------------
// GET /api/stock — liste paginée
// ------------------------------------------------------------
export async function obtenirStocks(
  filtres: FiltresStocks = {}
): Promise<ReponsePaginee<Stock>> {
  const reponse = await api.get("/stock", { params: nettoyer(filtres) });
  const data = reponse.data?.data ?? {};

  // Tolérance : on accepte plusieurs formes de payload
  const stocks: Stock[] = Array.isArray(data?.stocks)
    ? data.stocks
    : Array.isArray(data)
    ? data
    : [];

  return {
    stocks,
    total: data?.total ?? stocks.length,
    page: data?.page ?? 1,
    limite: data?.limite ?? 20,
  };
}

// ------------------------------------------------------------
// GET /api/stock/alertes/seuils
// ------------------------------------------------------------
export async function obtenirAlertesSeuils(): Promise<Stock[]> {
  const reponse = await api.get("/stock/alertes/seuils");
  const data = reponse.data?.data;
  return Array.isArray(data?.stocks) ? data.stocks : Array.isArray(data) ? data : [];
}

// ------------------------------------------------------------
// GET /api/stock/etablissement/:id
// ------------------------------------------------------------
export async function obtenirStocksEtablissement(
  etablissementId: number
): Promise<Stock[]> {
  const reponse = await api.get(`/stock/etablissement/${etablissementId}`);
  const data = reponse.data?.data;
  return Array.isArray(data?.stocks) ? data.stocks : Array.isArray(data) ? data : [];
}