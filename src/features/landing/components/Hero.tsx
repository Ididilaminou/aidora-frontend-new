// ============================================================
// AIDORA — HERO (landing)
// ------------------------------------------------------------
// Section d'accroche principale. Contient :
//  - Titre principal avec dégradé et soulignement animé
//  - Sous-titre + 2 CTA
//  - Preuve sociale (avatars + "100% gratuit")
//  - Visuel : LOGO plein écran dans le carré rouge + badges
// ============================================================

import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ROUTES } from "../../../config/routes";
import { HERO } from "../data/content";

export function Hero() {
  return (
    <section
      id="accueil"
      className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24"
    >
      {/* ==================================================
          DÉCOR DE FOND (halos + grille)
          ================================================== */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Halo principal */}
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-200/50 via-primary-100/40 to-transparent blur-3xl dark:from-primary-900/30 dark:via-primary-800/20" />
        {/* Halos latéraux */}
        <div className="absolute -left-32 top-40 h-72 w-72 rounded-full bg-primary-300/30 blur-3xl dark:bg-primary-900/20" />
        <div className="absolute -right-32 top-60 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-900/20" />
        {/* Grille subtile */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ==================================================
          CONTENU
          ================================================== */}
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* ---------- COLONNE GAUCHE : TEXTE ---------- */}
        <div className="animate-fade-in">
          <Badge variante="primary" className="mb-6 px-3 py-1.5 text-xs">
            <Sparkles size={12} className="mr-1.5" />
            {HERO.badge}
          </Badge>

          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 dark:text-white md:text-6xl lg:text-7xl">
            {HERO.titreLigne1}
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
                {HERO.titreLigne2}
              </span>
              {/* Soulignement animé */}
              <svg
                className="absolute -bottom-2 left-0 z-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 9C50 3 100 2 150 5C200 8 250 7 298 3"
                  stroke="url(#underline-grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-pulse-soft"
                />
                <defs>
                  <linearGradient
                    id="underline-grad"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0" />
                    <stop offset="50%" stopColor="#dc2626" stopOpacity="1" />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            {HERO.description}
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={ROUTES.INSCRIPTION}>
              <Button
                variante="primary"
                taille="lg"
                iconeDroite={<ArrowRight size={18} />}
                className="shadow-lg shadow-primary-500/25"
              >
                {HERO.ctaPrimaire}
              </Button>
            </Link>
            <a href="#fonctionnement">
              <Button variante="outline" taille="lg">
                {HERO.ctaSecondaire}
              </Button>
            </a>
          </div>

          {/* Preuve sociale */}
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["A", "M", "J", "S", "K"].map((initiale, i) => (
                  <div
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white dark:border-neutral-950"
                  >
                    {initiale}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {HERO.preuveSociale}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {HERO.preuveSocialeSous}
                </p>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-neutral-200 dark:bg-neutral-800 sm:block" />

            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-50 text-success-500 dark:bg-success-500/10">
                <CheckCircle2 size={16} />
              </div>
              <p className="font-medium text-neutral-700 dark:text-neutral-300">
                {HERO.badgeGratuit}
              </p>
            </div>
          </div>
        </div>

        {/* ---------- COLONNE DROITE : VISUEL ---------- */}
        <div className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            {/* Halo pulsant derrière */}
            <div className="absolute inset-0 animate-pulse-soft rounded-full bg-gradient-to-br from-primary-500/30 to-primary-700/20 blur-3xl" />

            {/* ==========================================
                CARTE PRINCIPALE — logo plein écran
                ========================================== */}
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 shadow-float">
              {/* Logo plein écran dans le carré rouge */}
              <img
                src="/logo.png"
                alt="Aidora"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />

              {/* Overlay dégradé léger pour lisibilité des badges */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

              {/* Badge flottant HAUT */}
              <div className="absolute left-4 top-4 z-10 flex items-center gap-3 rounded-2xl bg-white/95 px-3.5 py-3 shadow-card backdrop-blur-md dark:bg-neutral-900/95">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-500 dark:bg-success-500/10">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {HERO.badgeFlottantHaut.label}
                  </p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    {HERO.badgeFlottantHaut.valeur}
                  </p>
                </div>
              </div>

              {/* Badge flottant BAS */}
              <div className="absolute bottom-4 right-4 z-10 rounded-2xl bg-white/95 px-3.5 py-3 shadow-card backdrop-blur-md dark:bg-neutral-900/95">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-primary-500" />
                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {HERO.badgeFlottantBas.label}
                  </p>
                </div>
                <p className="mt-0.5 text-sm font-bold text-neutral-900 dark:text-white">
                  {HERO.badgeFlottantBas.valeur}
                </p>
              </div>
            </div>

            {/* Petite carte flottante DROITE (desktop) */}
            <div className="absolute -right-6 top-1/3 z-10 hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-card dark:border-neutral-800 dark:bg-neutral-900 md:block">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {HERO.badgeFlottantDroite.label}
                  </p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    {HERO.badgeFlottantDroite.valeur}
                  </p>
                </div>
              </div>
            </div>

            {/* Petite carte flottante GAUCHE (desktop) */}
            <div className="absolute -left-6 bottom-1/4 z-10 hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-card dark:border-neutral-800 dark:bg-neutral-900 md:block">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-500 dark:bg-warning-500/10">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {HERO.badgeFlottantGauche.label}
                  </p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    {HERO.badgeFlottantGauche.valeur}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}