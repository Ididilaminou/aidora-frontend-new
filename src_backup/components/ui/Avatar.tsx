// ============================================================
// AIDORA — AVATAR
// ============================================================

import { cn } from "../../utils/cn";

interface AvatarProps {
  nom?: string;
  prenom?: string;
  src?: string;
  taille?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const tailles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({ nom, prenom, src, taille = "md", className }: AvatarProps) {
  const initiales =
    `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";

  if (src) {
    return (
      <img
        src={src}
        alt={`${prenom ?? ""} ${nom ?? ""}`}
        className={cn("rounded-full object-cover", tailles[taille], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700",
        tailles[taille],
        className
      )}
    >
      {initiales}
    </div>
  );
}