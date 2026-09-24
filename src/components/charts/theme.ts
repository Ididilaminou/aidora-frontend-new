// ============================================================
// AIDORA — THÈME GRAPHIQUES (Recharts)
// ------------------------------------------------------------
// ⚠️ Miroir de src/styles/index.css pour Recharts
//    (qui ne lit pas les variables CSS Tailwind).
// ============================================================

export const COULEURS = {
  primary: "#dc2626",
  primaryLight: "#fca5a5",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#8b5cf6",
  neutral: "#94a3b8",
} as const;

// Palette cyclique pour les répartitions
export const PALETTE = [
  COULEURS.primary,
  COULEURS.info,
  COULEURS.success,
  COULEURS.warning,
  COULEURS.purple,
  COULEURS.danger,
  COULEURS.neutral,
] as const;

// Style par défaut des axes et grilles
export const AXE_STYLE = {
  stroke: "#94a3b8",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

export const GRILLE_STYLE = {
  stroke: "#e2e8f0",
  strokeDasharray: "3 3",
  vertical: false,
} as const;

export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 12,
    boxShadow: "0 8px 32px rgba(15, 23, 42, 0.12)",
  },
  labelStyle: {
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 4,
  },
} as const;