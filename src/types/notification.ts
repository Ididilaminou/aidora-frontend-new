// ============================================================
// AIDORA — TYPES NOTIFICATION
// ------------------------------------------------------------
// ⚠️ Alignés sur la réponse réelle du backend :
//   GET /api/notifications →
//     { data: { notifications: [...], total, page, limite } }
//
// Particularités :
//   - type peut être "SYSTEME"
//   - lue est un NOMBRE (0/1), pas un booléen
//   - date_envoi (pas created_at)
// ============================================================

export type TypeNotification =
  | "INFO"
  | "ALERTE"
  | "SUCCES"
  | "URGENT"
  | "SYSTEME";

export interface Notification {
  id: number;
  utilisateur_id: number;
  titre?: string;
  message: string;
  type?: TypeNotification;
  lue: number | boolean;
  date_envoi?: string;
  created_at?: string;
}

export interface ReponseNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  limite: number;
}

// ============================================================
// Helpers
// ============================================================

/** Accepte 0/1 (nombre) ou true/false */
export function estLue(n: Notification): boolean {
  if (typeof n.lue === "boolean") return n.lue;
  return n.lue === 1;
}

export function dateNotification(n: Notification): string {
  const iso = n.date_envoi ?? n.created_at;
  if (!iso) return "—";

  const date = new Date(iso);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMin < 1)    return "À l'instant";
  if (diffMin < 60)   return `Il y a ${diffMin} min`;
  if (diffMin < 1440) return `Il y a ${Math.floor(diffMin / 60)} h`;
  if (diffMin < 10080) {
    const j = Math.floor(diffMin / 1440);
    return `Il y a ${j} jour${j > 1 ? "s" : ""}`;
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function libelleType(t?: TypeNotification): string {
  switch (t) {
    case "INFO":    return "Information";
    case "ALERTE":  return "Alerte";
    case "SUCCES":  return "Succès";
    case "URGENT":  return "Urgent";
    case "SYSTEME": return "Système";
    default:        return "Notification";
  }
}

export function varianteType(
  t?: TypeNotification
): "info" | "warning" | "success" | "danger" | "primary" {
  switch (t) {
    case "SUCCES":  return "success";
    case "ALERTE":  return "warning";
    case "URGENT":  return "danger";
    case "SYSTEME": return "primary";
    default:        return "info";
  }
}