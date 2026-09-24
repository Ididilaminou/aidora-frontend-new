// ============================================================
// AIDORA — HOOK : useReveal
// ------------------------------------------------------------
// Révèle un élément (fondu + translation) quand il entre dans
// le viewport. Utilise IntersectionObserver (perf-friendly).
// ============================================================

import { useEffect, useRef, useState } from "react";

/**
 * Détecte quand un élément devient visible à l'écran.
 * Une fois révélé, il reste visible (pas de toggle).
 *
 * @example
 * const { ref, visible } = useReveal();
 * <div ref={ref} className={visible ? "opacity-100" : "opacity-0"}>
 *   ...
 * </div>
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15 }
) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Si IntersectionObserver n'est pas supporté (vieux navigateurs),
    // on affiche directement pour ne pas casser l'UX.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect(); // une seule fois suffit
      }
    }, options);

    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);

  return { ref, visible };
}