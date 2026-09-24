// ============================================================
// AIDORA — CHAMP DE SAISIE
// ============================================================

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  iconeGauche?: ReactNode;
  iconeDroite?: ReactNode;
  erreur?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ iconeGauche, iconeDroite, erreur, className, ...props }, ref) => {
    return (
      <div className="relative">
        {iconeGauche && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {iconeGauche}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 rounded-lg border bg-white px-4 text-sm dark:bg-neutral-900",
            "text-neutral-900 dark:text-white",
            "placeholder:text-neutral-400 dark:placeholder:text-neutral-500 dark:text-neutral-400 dark:text-neutral-500",
            "transition-all duration-150",
            "outline-none focus:ring-4",
            erreur
              ? "border-danger-500 focus:border-danger-500 focus:ring-danger-50"
              : "border-neutral-200 dark:border-neutral-700 focus:border-primary-500 focus:ring-primary-100",
            "disabled:bg-neutral-50 disabled:cursor-not-allowed dark:disabled:bg-neutral-800",
            iconeGauche && "pl-10",
            iconeDroite && "pr-10",
            className
          )}
          {...props}
        />
        {iconeDroite && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
            {iconeDroite}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";