// ============================================================
// AIDORA — GRAPHIQUE EN BARRES
// ============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AXE_STYLE, GRILLE_STYLE, TOOLTIP_STYLE, PALETTE } from "./theme";

interface BarreChartProps {
  donnees: Array<{ label: string; valeur: number }>;
  /** Si vrai, chaque barre prend une couleur différente */
  multiCouleurs?: boolean;
}

export function BarreChart({
  donnees,
  multiCouleurs = false,
}: BarreChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={donnees} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid {...GRILLE_STYLE} />
        <XAxis dataKey="label" {...AXE_STYLE} />
        <YAxis {...AXE_STYLE} allowDecimals={false} />
        <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: "rgba(148, 163, 184, 0.1)" }} />
        <Bar dataKey="valeur" radius={[6, 6, 0, 0]} maxBarSize={48} name="Total">
          {multiCouleurs &&
            donnees.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}