// ============================================================
// AIDORA — API NOTIFICATIONS
// ============================================================

import api from "../../services/api";
import type {
  Notification,
  ReponseNotifications,
} from "../../types/notification";

export interface FiltresNotifications {
  lue?: boolean;
  page?: number;
  limite?: number;
}

function nettoyer(filtres: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== undefined && v !== "")
  );
}

// ------------------------------------------------------------
// GET /api/notifications
// ------------------------------------------------------------
export async function obtenirNotifications(
  filtres: FiltresNotifications = {}
): Promise<ReponseNotifications> {
  const reponse = await api.get("/notifications", {
    params: nettoyer(filtres),
  });
  const data = reponse.data?.data ?? reponse.data ?? {};

  const notifications: Notification[] = Array.isArray(data?.notifications)
    ? data.notifications
    : Array.isArray(data)
    ? data
    : [];

  return {
    notifications,
    total: data?.total ?? notifications.length,
    page: data?.page ?? 1,
    limite: data?.limite ?? 20,
  };
}

// ------------------------------------------------------------
// GET /api/notifications/compteur
// ------------------------------------------------------------
export async function obtenirCompteurNonLues(): Promise<number> {
  try {
    const reponse = await api.get("/notifications/compteur");
    const data = reponse.data?.data ?? reponse.data;
    return (
      data?.total ??
      data?.compteur ??
      data?.non_lues ??
      (typeof data === "number" ? data : 0)
    );
  } catch {
    return 0;
  }
}

// ------------------------------------------------------------
// GET /api/notifications/non-lues
// ------------------------------------------------------------
export async function obtenirNonLues(): Promise<Notification[]> {
  const reponse = await api.get("/notifications/non-lues");
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.notifications)
    ? data.notifications
    : Array.isArray(data)
    ? data
    : [];
}

// ------------------------------------------------------------
// PATCH /api/notifications/:id/lue
// ------------------------------------------------------------
export async function marquerCommeLue(id: number): Promise<Notification> {
  const reponse = await api.patch(`/notifications/${id}/lue`);
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// PATCH /api/notifications/toutes-lues
// ------------------------------------------------------------
export async function marquerToutesCommeLues(): Promise<void> {
  await api.patch("/notifications/toutes-lues");
}

// ------------------------------------------------------------
// DELETE /api/notifications/:id
// ------------------------------------------------------------
export async function supprimerNotification(id: number): Promise<void> {
  await api.delete(`/notifications/${id}`);
}