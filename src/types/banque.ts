// ============================================================
// AIDORA — TYPES BANQUE DE SANG
// ------------------------------------------------------------
// ⚠️ Alignés sur la réponse réelle du backend (vérifié) :
//   GET /api/stock →
//     { data: { stocks: [...], total, page, limite } }
// ============================================================

export type GroupeSanguinLettre = "A" | "B" | "AB" | "O";
export type Rhesus = "POSITIF" | "NEGATIF";
export type TypeProduit = "SANG_TOTAL" | "PLASMA" | "PLAQUETTES" | "GLOBULES_ROUGES";

// ------------------------------------------------------------
// Un stock (ligne renvoyée par /api/stock)
// ------------------------------------------------------------
export interface Stock {
  id: number;
  etablissement_id: number;
  groupe_sanguin: GroupeSanguinLettre;
  rhesus: Rhesus;
  type_produit: TypeProduit;
  quantite: number;
  seuil_alerte: number;
  date_mise_a_jour: string;
  etablissement_nom: string;
}

// ------------------------------------------------------------
// Réponse paginée standard
// ------------------------------------------------------------
export interface ReponsePaginee<T> {
  stocks: T[];
  total: number;
  page: number;
  limite: number;
}

// ------------------------------------------------------------
// Helpers d'affichage
// ------------------------------------------------------------

/** Retourne "O+" ou "A-" à partir des deux champs backend */
export function formatGroupe(
  groupe: GroupeSanguinLettre,
  rhesus: Rhesus
): string {
  return `${groupe}${rhesus === "POSITIF" ? "+" : "-"}`;
}

/** Vrai si le stock est sous le seuil d'alerte */
export function estEnAlerte(stock: Stock): boolean {
  return stock.quantite <= stock.seuil_alerte;
}

/** Libellé lisible du type de produit */
export function formatTypeProduit(type: TypeProduit): string {
  const labels: Record<TypeProduit, string> = {
    SANG_TOTAL: "Sang total",
    PLASMA: "Plasma",
    PLAQUETTES: "Plaquettes",
    GLOBULES_ROUGES: "Globules rouges",
  };
  return labels[type] ?? type;
}