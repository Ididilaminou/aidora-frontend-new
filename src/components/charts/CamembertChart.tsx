// ============================================================
// AIDORA — GRAPHIQUE EN CAMEMBERT (DONUT)
// ============================================================

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PALETTE, TOOLTIP_STYLE } from "./theme";

interface CamembertChartProps {
  donnees: Array<{ label: string; valeur: number }>;
}

export function CamembertChart({ donnees }: CamembertChartProps) {
  // Recharts attend une clé "name" pour le label
  const data = donnees.map((d) => ({ name: d.label, value: d.valeur }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={3}
          stroke="#ffffff"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip {...TOOLTIP_STYLE} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}