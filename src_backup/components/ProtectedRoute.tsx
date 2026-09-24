// ============================================================
// AIDORA — ROUTE PROTÉGÉE
// ------------------------------------------------------------
// Vérifie :
//   1. Que l'utilisateur est connecté
//   2. Qu'il a accès à cette route selon son rôle
// ============================================================

import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../config/routes";
import { aAcces, accueilPour, type Role } from "../config/roles";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { estConnecte, chargement, utilisateur } = useAuth();
  const location = useLocation();

  if (chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // Non connecté
  if (!estConnecte) {
    return (
      <Navigate to={ROUTES.CONNEXION} state={{ from: location }} replace />
    );
  }

  // Connecté mais pas autorisé sur cette route
  const role = utilisateur?.role as Role | undefined;
  if (!aAcces(role, location.pathname)) {
    return <Navigate to={accueilPour(role)} replace />;
  }

  return <>{children}</>;
}