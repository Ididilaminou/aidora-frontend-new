// ============================================================
// AIDORA — GRAPHIQUE EN LIGNE
// ============================================================

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AXE_STYLE, GRILLE_STYLE, TOOLTIP_STYLE, COULEURS } from "./theme";

interface LigneChartProps {
  donnees: Array<{ label: string; valeur: number }>;
  couleur?: string;
  hauteur?: number;
}

export function LigneChart({
  donnees,
  couleur = COULEURS.primary,
}: LigneChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={donnees} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid {...GRILLE_STYLE} />
        <XAxis dataKey="label" {...AXE_STYLE} />
        <YAxis {...AXE_STYLE} allowDecimals={false} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Line
          type="monotone"
          dataKey="valeur"
          stroke={couleur}
          strokeWidth={2.5}
          dot={{ r: 3, fill: couleur, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          name="Total"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}