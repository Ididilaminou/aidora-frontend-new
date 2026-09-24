// ============================================================
// AIDORA — LANDING PAGE
// ------------------------------------------------------------
// Page d'accueil publique. Assemble toutes les sections dans
// l'ordre. C'est CE composant qu'on branche sur la route "/".
// ============================================================

import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Stats } from "../components/Stats";
import { HowItWorks } from "../components/HowItWorks";
import { Features } from "../components/Features";
import { BloodCompatibility } from "../components/BloodCompatibility";
import { CTA } from "../components/CTA";
import { FooterLanding } from "../components/FooterLanding";
import { Testimonials } from "../components/Testimonials";
import { FAQ } from "../components/FAQ";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-800 antialiased dark:bg-neutral-950 dark:text-neutral-200">
      {/* Navigation fixe en haut */}
      <Navbar />

      {/* Contenu principal */}
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <BloodCompatibility />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>

      {/* Pied de page */}
      <FooterLanding />
    </div>
  );
}

export default LandingPage;