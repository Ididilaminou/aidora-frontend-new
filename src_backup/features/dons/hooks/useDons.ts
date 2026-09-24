// ============================================================
// AIDORA — HOOK useDons
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { obtenirDons, type FiltresDons } from "../api";
import { extraireMessageErreur } from "../../../services/api";
import type { Don } from "../../../types/don";

interface UseDonsResult {
  dons: Don[];
  total: number;
  chargement: boolean;
  erreur: string | null;
  recharger: () => Promise<void>;
}

export function useDons(filtres: FiltresDons = {}): UseDonsResult {
  const [dons, setDons] = useState<Don[]>([]);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const filtresSerialises = JSON.stringify(filtres);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const resultat = await obtenirDons(filtres);
      setDons(resultat.dons);
      setTotal(resultat.total);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setDons([]);
      setTotal(0);
    } finally {
      setChargement(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtresSerialises]);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { dons, total, chargement, erreur, recharger };
}