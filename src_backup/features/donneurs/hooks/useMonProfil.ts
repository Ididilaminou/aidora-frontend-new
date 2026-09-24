// ============================================================
// AIDORA — HOOK useMonProfil
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { obtenirMonProfil } from "../api";
import { extraireMessageErreur } from "../../../services/api";
import type { ProfilDonneur } from "../../../types/donneur";

export function useMonProfil() {
  const [profil, setProfil] = useState<ProfilDonneur | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      setProfil(await obtenirMonProfil());
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setProfil(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { profil, chargement, erreur, recharger };
}