// ============================================================
// AIDORA — HOOK : useDebounce
// ------------------------------------------------------------
// Retarde la mise à jour d'une valeur. Utile pour la recherche :
// on n'envoie pas de requête à chaque frappe, mais après un délai.
// ============================================================

import { useEffect, useState } from "react";

/**
 * Retourne une version "retardée" de la valeur.
 * La valeur ne se met à jour qu'après `delai` ms sans changement.
 *
 * @example
 * const [recherche, setRecherche] = useState("");
 * const rechercheDebounced = useDebounce(recherche, 300);
 * // rechercheDebounced ne change qu'après 300ms sans frappe
 */
export function useDebounce<T>(valeur: T, delai = 300): T {
  const [valeurDebounced, setValeurDebounced] = useState<T>(valeur);

  useEffect(() => {
    const timer = setTimeout(() => {
      setValeurDebounced(valeur);
    }, delai);

    return () => clearTimeout(timer);
  }, [valeur, delai]);

  return valeurDebounced;
}