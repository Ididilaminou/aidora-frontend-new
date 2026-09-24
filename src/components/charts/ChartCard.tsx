// ============================================================
// AIDORA — CONTENEUR DE GRAPHIQUE
// ------------------------------------------------------------
// Enveloppe un graphique avec titre, description et état vide.
// ============================================================

import type { ReactNode } from "react";
import { Card, CardTitle, CardDescription } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { BarChart3 } from "lucide-react";
import { cn } from "../../utils/cn";

interface ChartCardProps {
  titre: string;
  description?: string;
  vide?: boolean;
  hauteur?: number;
  className?: string;
  children: ReactNode;
}

export function ChartCard({
  titre,
  description,
  vide = false,
  hauteur = 280,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardTitle>{titre}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}

      <div className="mt-4" style={{ height: hauteur }}>
        {vide ? (
          <EmptyState
            icone={<BarChart3 size={20} />}
            titre="Aucune donnée"
            description="Rien à afficher pour l'instant."
          />
        ) : (
          children
        )}
      </div>
    </Card>
  );
}