// ============================================================
// AIDORA — HOOK useStocks
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { obtenirStocks, type FiltresStocks } from "../api";
import { extraireMessageErreur } from "../../../services/api";
import type { Stock } from "../../../types/banque";

interface UseStocksResult {
  stocks: Stock[];
  total: number;
  chargement: boolean;
  erreur: string | null;
  recharger: () => Promise<void>;
}

export function useStocks(filtres: FiltresStocks = {}): UseStocksResult {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // Filtres sérialisés → évite de relancer en boucle si l'objet change
  const filtresSerialises = JSON.stringify(filtres);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const resultat = await obtenirStocks(filtres);
      setStocks(resultat.stocks);
      setTotal(resultat.total);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setStocks([]);
      setTotal(0);
    } finally {
      setChargement(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtresSerialises]);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { stocks, total, chargement, erreur, recharger };
}