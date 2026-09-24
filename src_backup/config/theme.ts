// ============================================================
// AIDORA — THÈME (côté JS)
// ------------------------------------------------------------
// Miroir du design system CSS, pour les endroits où Tailwind
// ne s'applique pas : graphiques (Recharts), canvas, charts…
// ⚠️  Si tu changes les couleurs dans styles/index.css,
//     répercute-les ici.
// ============================================================

export const THEME = {
  colors: {
    primary: {
      50:  "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#dc2626",
      600: "#b91c1c",
      700: "#991b1b",
      800: "#7f1d1d",
      900: "#450a0a",
    },
    success: "#10b981",
    danger:  "#ef4444",
    warning: "#f59e0b",
    info:    "#3b82f6",
    neutral: {
      50:  "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.25rem",
    "3xl": "1.75rem",
  },
  durations: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
} as const;

// Palette prête pour Recharts ou autres libs de graphiques
export const CHART_COLORS = [
  THEME.colors.primary[500],
  THEME.colors.info,
  THEME.colors.success,
  THEME.colors.warning,
  THEME.colors.primary[300],
  THEME.colors.danger,
] as const;