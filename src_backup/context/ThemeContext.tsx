// ============================================================
// AIDORA — CONTEXTE THÈME
// ============================================================

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "../config/constants";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  estSombre: boolean;
  basculer: () => void;
  definir: (t: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

function themeInitial(): Theme {
  try {
    const stocke = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stocke === "light" || stocke === "dark") return stocke;
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // ignore
  }
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(themeInitial);

  // Applique la classe au <html> à chaque changement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const basculer = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const definir = useCallback((t: Theme) => setTheme(t), []);

  return (
    <ThemeContext.Provider
      value={{ theme, estSombre: theme === "dark", basculer, definir }}
    >
      {children}
    </ThemeContext.Provider>
  );
}