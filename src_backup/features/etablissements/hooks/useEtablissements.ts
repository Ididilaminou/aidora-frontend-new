// ============================================================
// AIDORA — HOOK useEtablissements
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  obtenirEtablissements,
  type FiltresEtablissements,
} from "../api";
import { extraireMessageErreur } from "../../../services/api";
import type { Etablissement } from "../../../types/etablissement";

interface UseEtablissementsResult {
  etablissements: Etablissement[];
  chargement: boolean;
  erreur: string | null;
  recharger: () => Promise<void>;
}

export function useEtablissements(
  filtres: FiltresEtablissements = {}
): UseEtablissementsResult {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const filtresSerialises = JSON.stringify(filtres);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const data = await obtenirEtablissements(filtres);
      setEtablissements(data);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setEtablissements([]);
    } finally {
      setChargement(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtresSerialises]);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { etablissements, chargement, erreur, recharger };
}