// ============================================================
// AIDORA — HOOK usePersonnels
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { obtenirPersonnels, type FiltresPersonnels } from "../api";
import { extraireMessageErreur } from "../../../services/api";
import type { Personnel } from "../../../types/personnel";

interface UsePersonnelsResult {
  personnels: Personnel[];
  total: number;
  chargement: boolean;
  erreur: string | null;
  recharger: () => Promise<void>;
}

export function usePersonnels(
  filtres: FiltresPersonnels = {}
): UsePersonnelsResult {
  const [personnels, setPersonnels] = useState<Personnel[]>([]);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const filtresSerialises = JSON.stringify(filtres);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const resultat = await obtenirPersonnels(filtres);
      setPersonnels(resultat.personnels);
      setTotal(resultat.total);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setPersonnels([]);
      setTotal(0);
    } finally {
      setChargement(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtresSerialises]);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { personnels, total, chargement, erreur, recharger };
}