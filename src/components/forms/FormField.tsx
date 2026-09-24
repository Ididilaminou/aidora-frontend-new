// ============================================================
// AIDORA — CHAMP DE FORMULAIRE (label + input + erreur)
// ============================================================

import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  obligatoire?: boolean;
  erreur?: string;
  aide?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  obligatoire,
  erreur,
  aide,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
        {obligatoire && <span className="ml-0.5 text-danger-500">*</span>}
      </label>

      {children}

      {erreur ? (
        <p className="text-xs text-danger-500">{erreur}</p>
      ) : aide ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{aide}</p>
      ) : null}
    </div>
  );
}