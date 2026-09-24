// ============================================================
// AIDORA — BADGE
// ============================================================

import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

type Variante = "primary" | "neutral" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variante?: Variante;
}

const variantes: Record<Variante, string> = {
  primary: "bg-primary-50 text-primary-700",
  neutral: "bg-neutral-100 text-neutral-700 dark:text-neutral-300",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger:  "bg-danger-50 text-danger-700",
  info:    "bg-info-50 text-info-700",
};

export function Badge({ variante = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantes[variante],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}