import { useQuery } from "@tanstack/react-query";
import { obtenirStocks, type FiltresStocks } from "../api";
import type { Stock } from "../../../types/banque";

export function useStocks(filtres: FiltresStocks = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["stocks", filtres],
    queryFn: () => obtenirStocks(filtres),
  });

  return {
    stocks: data ?? [],
    chargement: isLoading,
    erreur: error ? "Impossible de charger les stocks" : null,
    recharger: refetch,
  };
}