// ============================================================
// AIDORA — BOUTON BASCULE THÈME
// ============================================================

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle() {
  const { estSombre, basculer } = useTheme();

  return (
    <button
      onClick={basculer}
      aria-label={estSombre ? "Passer en mode clair" : "Passer en mode sombre"}
      className="rounded-lg p-2 text-neutral-600 dark:text-neutral-400 dark:text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {estSombre ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}