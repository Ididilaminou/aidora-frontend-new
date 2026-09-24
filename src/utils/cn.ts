// ============================================================
// Fusionne des classes Tailwind conditionnelles
// Ex: cn("p-4", actif && "bg-primary-500", className)
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}