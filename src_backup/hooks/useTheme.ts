// ============================================================
// AIDORA — HOOK useTheme (lit le contexte)
// ============================================================

import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export type { Theme } from "../context/ThemeContext";

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans <ThemeProvider>");
  return ctx;
}