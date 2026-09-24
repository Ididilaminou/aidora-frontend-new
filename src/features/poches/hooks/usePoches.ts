// ============================================================
// AIDORA — HOOK usePoches
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { obtenirPoches, type FiltresPoches } from "../api";
import { extraireMessageErreur } from "../../../services/api";
import type { Poche } from "../../../types/poche";

export function usePoches(filtres: FiltresPoches = {}) {
  const [poches, setPoches] = useState<Poche[]>([]);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const cle = JSON.stringify(filtres);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const r = await obtenirPoches(filtres);
      setPoches(r.poches);
      setTotal(r.total);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setPoches([]);
      setTotal(0);
    } finally {
      setChargement(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { poches, total, chargement, erreur, recharger };
}