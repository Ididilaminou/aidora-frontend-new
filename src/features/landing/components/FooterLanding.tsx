// ============================================================
// AIDORA — FOOTER (landing)
// ------------------------------------------------------------
// Footer public en 4 colonnes : marque + navigation + contact
// + mentions légales. Fond sombre (neutral-950) dans les deux
// modes (light/dark) pour un contraste fort.
// ============================================================

import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { NAV_LINKS, FOOTER } from "../data/content";
import { ROUTES } from "../../../config/routes";
import { APP } from "../../../config/constants";

export function FooterLanding() {
  const annee = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="border-t border-neutral-800 bg-neutral-950 pt-16 pb-8 text-neutral-400"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-4 lg:px-8">
        {/* ---------- COLONNE 1 : MARQUE ---------- */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt={APP.NOM}
              className="h-10 w-10 rounded-xl object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-lg font-bold text-white">{APP.NOM}</span>
          </div>

          <p className="mt-4 max-w-md text-sm leading-relaxed">
            {FOOTER.description}
          </p>

          {/* Statut "En ligne" */}
          <div className="mt-6 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1.5 font-medium text-primary-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
              {FOOTER.statusLabel}
            </span>
            <span className="text-neutral-500">{FOOTER.statusSous}</span>
          </div>
        </div>

        {/* ---------- COLONNE 2 : NAVIGATION ---------- */}
        <div>
          <h4 className="mb-4 font-semibold text-white">Navigation</h4>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.slice(0, 4).map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="transition-colors hover:text-primary-400"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to={ROUTES.CONNEXION}
                className="transition-colors hover:text-primary-400"
              >
                Connexion
              </Link>
            </li>
          </ul>
        </div>

        {/* ---------- COLONNE 3 : CONTACT ---------- */}
        <div>
          <h4 className="mb-4 font-semibold text-white">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-primary-400" />
              {FOOTER.contact.adresse}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="shrink-0 text-primary-400" />
              {FOOTER.contact.email}
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 text-primary-400" />
              {FOOTER.contact.telephone}
            </li>
          </ul>
        </div>
      </div>

      {/* ---------- BARRE DU BAS ---------- */}
      <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-3 border-t border-neutral-800 px-4 pt-6 text-xs lg:flex-row lg:px-8">
        <p>
          © {annee} {APP.NOM} — {APP.SLOGAN}
        </p>
        <div className="flex gap-6">
          {FOOTER.liensLegaux.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="transition-colors hover:text-primary-400"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}