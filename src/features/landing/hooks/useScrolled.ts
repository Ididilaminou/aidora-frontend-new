// ============================================================
// AIDORA — HOOK : useScrolled
// ------------------------------------------------------------
// Détecte si l'utilisateur a scrollé la page au-delà d'un seuil.
// Utilisé par la Navbar pour changer son fond (transparent → blanc).
// ============================================================

import { useEffect, useState } from "react";

/**
 * Retourne `true` dès que la page est scrollée au-delà du seuil.
 *
 * @param seuil - Nombre de pixels à partir duquel on considère
 *                que la page est scrollée. Par défaut : 20px.
 *
 * @example
 * const scrolled = useScrolled();
 * <header className={scrolled ? "bg-white" : "bg-transparent"} />
 */
export function useScrolled(seuil = 20) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > seuil);

    // Vérifie l'état au montage (utile si on recharge au milieu de la page)
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [seuil]);

  return scrolled;
}