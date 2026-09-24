// ============================================================
// AIDORA — HOOK useToast
// ============================================================

import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans <ToastProvider>");
  return ctx;
}