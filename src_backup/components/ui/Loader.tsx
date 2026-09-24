// ============================================================
// AIDORA — INDICATEUR DE CHARGEMENT
// ============================================================

import { cn } from "../../utils/cn";

interface LoaderProps {
  taille?: "sm" | "md" | "lg";
  pleinEcran?: boolean;
  texte?: string;
  className?: string;
}

const tailles = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

export function Loader({ taille = "md", pleinEcran, texte, className }: LoaderProps) {
  const spinner = (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-primary-500 border-t-transparent",
          tailles[taille]
        )}
      />
      {texte && <p className="text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">{texte}</p>}
    </div>
  );

  if (pleinEcran) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}