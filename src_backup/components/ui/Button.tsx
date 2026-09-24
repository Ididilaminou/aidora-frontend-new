// ============================================================
// AIDORA — BOUTON
// ------------------------------------------------------------
// Variantes : primary | secondary | ghost | danger | outline
// Tailles    : sm | md | lg
// ============================================================

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

type Variante = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Taille   = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  taille?: Taille;
  chargement?: boolean;
  iconeGauche?: React.ReactNode;
  iconeDroite?: React.ReactNode;
}

const stylesVariante: Record<Variante, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm",
  secondary:
    "bg-neutral-100 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
  ghost:
    "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800",
  danger:
    "bg-danger-500 text-white hover:bg-danger-700 shadow-sm",
  outline:
    "border border-neutral-200 bg-white text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
};

const stylesTaille: Record<Taille, string> = {
  sm: "h-9  px-3 text-sm  gap-1.5 rounded-md",
  md: "h-11 px-5 text-sm  gap-2   rounded-lg",
  lg: "h-13 px-7 text-base gap-2.5 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variante = "primary",
      taille = "md",
      chargement = false,
      iconeGauche,
      iconeDroite,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const desactive = disabled || chargement;

    return (
      <button
        ref={ref}
        disabled={desactive}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "active:scale-[0.98]",
          stylesVariante[variante],
          stylesTaille[taille],
          className
        )}
        {...props}
      >
        {chargement ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          iconeGauche
        )}
        {children}
        {!chargement && iconeDroite}
      </button>
    );
  }
);

Button.displayName = "Button";