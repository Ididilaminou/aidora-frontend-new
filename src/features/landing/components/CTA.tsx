// ============================================================
// AIDORA — CTA FINAL (landing)
// ------------------------------------------------------------
// Bandeau rouge avec appel à l'action "Devenir donneur" ou
// "Espace établissement". Goutte en filigrane + halos décoratifs.
// ============================================================

import { Link } from "react-router-dom";
import { ArrowRight, Building2, Droplets, Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { CTA as CTA_CONTENT } from "../data/content";
import { ROUTES } from "../../../config/routes";

export function CTA() {
  return (
    <section className="bg-white py-16 dark:bg-neutral-900 md:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 p-10 shadow-float md:p-16">
          {/* ---------- DÉCOR ---------- */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          {/* Goutte géante en filigrane à droite */}
          <Droplets
            size={300}
            strokeWidth={0.5}
            className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 text-white/5"
            aria-hidden
          />

          {/* ---------- CONTENU ---------- */}
          <div className="relative text-center">
            <Badge className="mb-4 border border-white/20 bg-white/10 text-white">
              <Sparkles size={12} className="mr-1.5" />
              {CTA_CONTENT.badge}
            </Badge>

            <h2 className="text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
              {CTA_CONTENT.titre}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-50/90">
              {CTA_CONTENT.description}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={ROUTES.INSCRIPTION}>
                <Button
                  variante="secondary"
                  taille="lg"
                  iconeDroite={<ArrowRight size={18} />}
                  className="bg-white text-primary-700 hover:bg-neutral-100"
                >
                  {CTA_CONTENT.ctaPrimaire}
                </Button>
              </Link>

              <Link to={ROUTES.CONNEXION}>
                <Button
                  variante="ghost"
                  taille="lg"
                  iconeGauche={<Building2 size={18} />}
                  className="border border-white/30 text-white hover:bg-white/10"
                >
                  {CTA_CONTENT.ctaSecondaire}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}