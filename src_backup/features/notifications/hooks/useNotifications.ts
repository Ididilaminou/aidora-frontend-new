// ============================================================
// AIDORA — HOOK useNotifications
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { obtenirNotifications } from "../api";
import { extraireMessageErreur } from "../../../services/api";
import type { Notification } from "../../../types/notification";

interface UseNotificationsResult {
  notifications: Notification[];
  total: number;
  chargement: boolean;
  erreur: string | null;
  recharger: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const resultat = await obtenirNotifications();
      setNotifications(resultat.notifications);
      setTotal(resultat.total);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setNotifications([]);
      setTotal(0);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return { notifications, total, chargement, erreur, recharger };
}