import { useQuery } from "@tanstack/react-query";
import { obtenirDons, type FiltresDons } from "../api";

export function useDons(filtres: FiltresDons = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dons", filtres],
    queryFn: () => obtenirDons(filtres),
  });

  return {
    dons: data?.dons ?? [],
    total: data?.total ?? 0,
    chargement: isLoading,
    erreur: error ? "Impossible de charger les dons" : null,
    recharger: refetch,
  };
}