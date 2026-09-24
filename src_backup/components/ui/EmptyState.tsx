// ============================================================
// AIDORA — ÉTAT VIDE
// ============================================================

import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface EmptyStateProps {
  icone?: ReactNode;
  titre: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icone,
  titre,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        className
      )}
    >
      {icone && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:text-neutral-500">
          {icone}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-white">{titre}</h3>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}