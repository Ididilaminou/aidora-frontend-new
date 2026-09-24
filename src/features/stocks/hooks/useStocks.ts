// ============================================================
// AIDORA — HOOK useStocks (React Query)
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { obtenirStocks, type FiltresStocks } from "../api";
import type { Stock } from "../../../types/banque";

interface UseStocksResult {
  stocks: Stock[];
  total: number;
  chargement: boolean;
  erreur: string | null;
  recharger: () => Promise<void>;
}

export function useStocks(filtres: FiltresStocks = {}): UseStocksResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["stocks", filtres],
    queryFn: () => obtenirStocks(filtres),
  });

  return {
    stocks: data?.stocks ?? [],
    total: data?.total ?? 0,
    chargement: isLoading,
    erreur: error ? "Impossible de charger les stocks" : null,
    recharger: async () => {
      await refetch();
    },
  };
}