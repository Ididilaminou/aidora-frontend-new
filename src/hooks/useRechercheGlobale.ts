// ============================================================
// AIDORA — HOOK : Recherche globale
// ------------------------------------------------------------
// Recherche multi-sources filtrée par rôle :
//   - Pages (routes autorisées)
//   - Poches (par code, groupe, statut)
//   - Demandes (par statut, groupe)
//   - Établissements (par nom, ville)
//
// Les données sont mises en cache par React Query.
// Le filtrage se fait côté client → instantané.
// ============================================================

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LABELS_ROUTES, ROUTES } from "../config/routes";
import { ROUTES_PAR_ROLE, type Role } from "../config/roles";
import { useAuth } from "./useAuth";
import { useDebounce } from "./useDebounce";
import { obtenirPoches } from "../features/poches/api";
import { obtenirDemandes } from "../features/demandes/api";
import { obtenirEtablissements } from "../features/etablissements/api";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
export type CategorieRecherche = "Page" | "Poche" | "Demande" | "Établissement";

export interface ResultatRecherche {
  id: string;              // clé unique
  categorie: CategorieRecherche;
  label: string;           // texte principal
  description?: string;    // texte secondaire
  route: string;           // destination au clic
}

// ------------------------------------------------------------
// Rôles qui ont accès à chaque catégorie
// ------------------------------------------------------------
const ROLES_POCHES: Role[] = [
  "ADMINISTRATEUR",
  "PERSONNEL_BANQUE",
  "PERSONNEL_HOPITAL",
];

const ROLES_DEMANDES: Role[] = [
  "ADMINISTRATEUR",
  "PERSONNEL_BANQUE",
  "PERSONNEL_HOPITAL",
];

const ROLES_ETABLISSEMENTS: Role[] = [
  "ADMINISTRATEUR",
  "PERSONNEL_BANQUE",
  "PERSONNEL_HOPITAL",
];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function normaliser(s: unknown): string {
  return String(s ?? "").toLowerCase().trim();
}

function match(champ: unknown, q: string): boolean {
  return normaliser(champ).includes(q);
}

// ------------------------------------------------------------
// Hook principal
// ------------------------------------------------------------
export function useRechercheGlobale(requete: string): ResultatRecherche[] {
  const { utilisateur } = useAuth();
  const role = utilisateur?.role as Role | undefined;
  const q = normaliser(useDebounce(requete, 200));

  const peutVoirPoches = role ? ROLES_POCHES.includes(role) : false;
  const peutVoirDemandes = role ? ROLES_DEMANDES.includes(role) : false;
  const peutVoirEtabs = role ? ROLES_ETABLISSEMENTS.includes(role) : false;

  // --------------------------------------------------------
  // Requêtes API (mises en cache 60s)
  // --------------------------------------------------------
  const { data: poches = [] } = useQuery({
    queryKey: ["recherche-poches"],
    queryFn: async () => {
      const r = await obtenirPoches({ limite: 200 });
      return r.poches;
    },
    enabled: peutVoirPoches && q.length >= 2,
    staleTime: 60_000,
  });

  const { data: demandes = [] } = useQuery({
    queryKey: ["recherche-demandes"],
    queryFn: async () => {
      const r = await obtenirDemandes({ limite: 200 });
      return r.demandes;
    },
    enabled: peutVoirDemandes && q.length >= 2,
    staleTime: 60_000,
  });

  const { data: etablissements = [] } = useQuery({
    queryKey: ["recherche-etablissements"],
    queryFn: () => obtenirEtablissements(),
    enabled: peutVoirEtabs && q.length >= 2,
    staleTime: 60_000,
  });

  // --------------------------------------------------------
  // Filtrage local
  // --------------------------------------------------------
  return useMemo<ResultatRecherche[]>(() => {
    if (q.length < 1) return [];
    if (!role) return [];

    const resultats: ResultatRecherche[] = [];

    // ---- 1. Pages ----
    const routesAutorisees = ROUTES_PAR_ROLE[role] ?? [];
    for (const route of routesAutorisees) {
      if (!route || route === ROUTES.DASHBOARD) continue;
      const label = LABELS_ROUTES[route] ?? route;
      if (match(label, q)) {
        resultats.push({
          id: `page-${route}`,
          categorie: "Page",
          label,
          route,
        });
      }
    }

    // ---- 2. Poches ----
    if (peutVoirPoches && q.length >= 2) {
      for (const p of poches.slice(0, 100)) {
        if (
          match(p.code_poche, q) ||
          match(p.groupe_sanguin, q) ||
          match(p.statut, q)
        ) {
          resultats.push({
            id: `poche-${p.id}`,
            categorie: "Poche",
            label: p.code_poche ?? `Poche #${p.id}`,
            description: `${p.groupe_sanguin}${p.rhesus === "POSITIF" ? "+" : "−"} · ${p.statut}`,
            route: ROUTES.POCHES ?? "/poches",
          });
        }
      }
    }

    // ---- 3. Demandes ----
    if (peutVoirDemandes && q.length >= 2) {
      for (const d of demandes.slice(0, 100)) {
        if (
          match(d.statut, q) ||
          match(d.groupe_sanguin, q) ||
          match(d.motif, q)
        ) {
          resultats.push({
            id: `demande-${d.id}`,
            categorie: "Demande",
            label: `Demande #${d.id}`,
            description: `${d.groupe_sanguin} · ${d.statut} · ${d.quantite_demandee} poches`,
            route: ROUTES.DEMANDES ?? "/demandes",
          });
        }
      }
    }

    // ---- 4. Établissements ----
    if (peutVoirEtabs && q.length >= 2) {
      for (const e of etablissements.slice(0, 100)) {
        if (match(e.nom, q) || match(e.ville, q)) {
          resultats.push({
            id: `etab-${e.id}`,
            categorie: "Établissement",
            label: e.nom,
            description: `${e.type === "BANQUE_DE_SANG" ? "Banque" : "Hôpital"} · ${e.ville ?? ""}`,
            route: ROUTES.ETABLISSEMENTS ?? "/etablissements",
          });
        }
      }
    }

    // Max 12 résultats
    return resultats.slice(0, 12);
  }, [q, role, poches, demandes, etablissements, peutVoirPoches, peutVoirDemandes, peutVoirEtabs]);
}