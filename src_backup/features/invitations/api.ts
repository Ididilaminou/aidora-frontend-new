// ============================================================
// AIDORA — API INVITATIONS (REGISTRES)
// ------------------------------------------------------------
// ⚠️ Alignés sur la réponse réelle du backend :
//   GET /api/registres/invitations →
//     { data: { invitations: [...] } }
// ============================================================

import api from "../../services/api";

export type StatutInvitation = "EN_ATTENTE" | "ACCEPTEE" | "EXPIREE" | "ANNULEE";

export interface Invitation {
  id: number;
  etablissement_id?: number;
  etablissement_nom?: string;
  donneur_existant_id?: number | null;

  prenom: string;
  nom: string;
  telephone?: string | null;
  email?: string | null;

  groupe_sanguin?: string;
  rhesus?: string;

  code_activation?: string;
  statut: StatutInvitation;
  source?: string;

  date_expiration?: string;
  date_reponse?: string | null;
  created_at?: string;
}

function nettoyer(f: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(f).filter(([, v]) => v !== undefined && v !== "")
  );
}

export async function obtenirInvitations(
  filtres: { statut?: string } = {}
): Promise<Invitation[]> {
  const reponse = await api.get("/registres/invitations", {
    params: nettoyer(filtres),
  });
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.invitations)
    ? data.invitations
    : Array.isArray(data)
    ? data
    : [];
}

export async function inviterDonneur(payload: {
  prenom: string;
  nom: string;
  email?: string;
  telephone?: string;
}): Promise<Invitation> {
  const reponse = await api.post("/registres/inviter", payload);
  return reponse.data?.data ?? reponse.data;
}

export async function annulerInvitation(id: number): Promise<void> {
  await api.delete(`/registres/invitations/${id}`);
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

export function libelleStatutInvitation(s?: StatutInvitation): string {
  switch (s) {
    case "EN_ATTENTE": return "En attente";
    case "ACCEPTEE":   return "Acceptée";
    case "EXPIREE":    return "Expirée";
    case "ANNULEE":    return "Annulée";
    default:           return "—";
  }
}

export function varianteStatutInvitation(
  s?: StatutInvitation
): "warning" | "success" | "danger" | "neutral" {
  switch (s) {
    case "ACCEPTEE":   return "success";
    case "EN_ATTENTE": return "warning";
    case "EXPIREE":    return "danger";
    case "ANNULEE":    return "neutral";
    default:           return "neutral";
  }
}

export function nomInvite(i: Invitation): string {
  const n = `${i.prenom ?? ""} ${i.nom ?? ""}`.trim();
  return n || i.email || i.telephone || "—";
}

export function groupeInvitation(i: Invitation): string {
  if (!i.groupe_sanguin) return "—";
  if (!i.rhesus) return i.groupe_sanguin;
  const signe = i.rhesus === "POSITIF" ? "+" : i.rhesus === "NEGATIF" ? "-" : "";
  return `${i.groupe_sanguin}${signe}`;
}