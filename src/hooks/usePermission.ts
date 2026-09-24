// ============================================================
// AIDORA — HOOK usePermission
// ============================================================

import { useAuth } from "./useAuth";
import { aPermission, type Action } from "../config/permissions";

export function usePermission() {
  const { utilisateur } = useAuth();
  const role = utilisateur?.role as import("../config/roles").Role | undefined;

  return {
    peut: (action: Action) => aPermission(role, action),
    role,
  };
}