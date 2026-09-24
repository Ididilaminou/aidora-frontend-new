// ============================================================
// AIDORA — HOOK useDemandes
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { obtenirDemandes, type FiltresDemandes } from "../api";
import { extraireMessageErreur } from "../../../services/api";
import type { Demande } from "../../../types/demande";

interface UseDemandesResult {
  demandes: Demande[];
  total: number;
  chargement: boolean;
  erreur: string | null;
  recharger: () => Promise<void>;
}

export function useDemandes(
  filtres: FiltresDemandes = {}
): UseDemandesResult {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const filtresSerialises = JSON.stringify(filtres);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const resultat = await obtenirDemandes(filtres);
      setDemandes(resultat.demandes);
      setTotal(resultat.total);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setDemandes([]);
      setTotal(0);
    } finally {
      setChargement(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtresSerialises]);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { demandes, total, chargement, erreur, recharger };
}