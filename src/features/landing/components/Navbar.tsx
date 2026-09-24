// ============================================================
// AIDORA — NAVBAR (landing)
// ------------------------------------------------------------
// Barre de navigation fixe en haut de la page d'accueil.
// Transparente en haut, devient blanche/floutée au scroll.
// Menu burger sur mobile.
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useScrolled } from "../hooks/useScrolled";
import { NAV_LINKS } from "../data/content";
import { Button } from "../../../components/ui/Button";
import { ThemeToggle } from "../../../components/ui/ThemeToggle";
import { ROUTES } from "../../../config/routes";
import { APP } from "../../../config/constants";
import { cn } from "../../../utils/cn";

export function Navbar() {
  const scrolled = useScrolled();
  const [ouvert, setOuvert] = useState(false);

  // Ferme le menu mobile automatiquement si on passe en desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOuvert(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-neutral-200 bg-white/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/80"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* ---------- LOGO ---------- */}
        <Link to="/" className="group flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt={APP.NOM}
            className="h-9 w-9 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Si le logo n'existe pas encore, on le cache proprement
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            {APP.NOM}
          </span>
        </Link>

        {/* ---------- LIENS DESKTOP ---------- */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* ---------- ACTIONS DESKTOP ---------- */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link to={ROUTES.CONNEXION}>
            <Button variante="ghost" taille="sm">
              Se connecter
            </Button>
          </Link>
          <Link to={ROUTES.INSCRIPTION}>
            <Button
              variante="primary"
              taille="sm"
              iconeDroite={<ArrowRight size={14} />}
            >
              S'inscrire
            </Button>
          </Link>
        </div>

        {/* ---------- BURGER MOBILE ---------- */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOuvert((v) => !v)}
            aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={ouvert}
            className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {ouvert ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ---------- MENU MOBILE ---------- */}
      {ouvert && (
        <div className="animate-slide-up border-t border-neutral-200 bg-white px-4 py-4 shadow-card dark:border-neutral-800 dark:bg-neutral-900 md:hidden">
          <ul className="space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOuvert(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <Link to={ROUTES.CONNEXION} onClick={() => setOuvert(false)}>
              <Button variante="outline" className="w-full justify-center">
                Se connecter
              </Button>
            </Link>
            <Link to={ROUTES.INSCRIPTION} onClick={() => setOuvert(false)}>
              <Button variante="primary" className="w-full justify-center">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}