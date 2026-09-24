// ============================================================
// AIDORA — COMPOSANT CanDo
// ------------------------------------------------------------
// Affiche son contenu UNIQUEMENT si l'utilisateur a la permission.
//
// Usage :
//   <CanDo action="don.valider">
//     <Button>Valider</Button>
//   </CanDo>
// ============================================================

import type { ReactNode } from "react";
import { usePermission } from "../../hooks/usePermission";
import type { Action } from "../../config/permissions";

interface CanDoProps {
  action: Action;
  children: ReactNode;
  /** Affiché si pas la permission (optionnel) */
  fallback?: ReactNode;
}

export function CanDo({ action, children, fallback = null }: CanDoProps) {
  const { peut } = usePermission();
  return peut(action) ? <>{children}</> : <>{fallback}</>;
}