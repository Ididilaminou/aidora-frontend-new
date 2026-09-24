// ============================================================
// AIDORA — FAQ (landing)
// ------------------------------------------------------------
// Accordéon de questions fréquentes. Une seule question
// ouverte à la fois. Animation fluide d'ouverture/fermeture.
// ============================================================

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQ as FAQ_CONTENT } from "../data/content";
import { Badge } from "../../../components/ui/Badge";
import { useReveal } from "../hooks/useReveal";
import { cn } from "../../../utils/cn";

export function FAQ() {
  const { ref, visible } = useReveal();
  const [ouverte, setOuverte] = useState<number | null>(0); // 1ère ouverte par défaut

  const toggle = (index: number) => {
    setOuverte(ouverte === index ? null : index);
  };

  return (
    <section
      ref={ref}
      className="bg-neutral-50 py-20 dark:bg-neutral-950 md:py-28"
    >
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* ---------- EN-TÊTE ---------- */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge variante="primary" className="mb-4">
            <HelpCircle size={12} className="mr-1.5" />
            FAQ
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white md:text-4xl lg:text-5xl">
            Questions fréquentes
          </h2>
          <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-400">
            Tout ce que vous devez savoir avant de donner votre sang.
          </p>
        </div>

        {/* ---------- ACCORDÉON ---------- */}
        <div
          className={cn(
            "space-y-3 transition-all duration-700",
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          )}
        >
          {FAQ_CONTENT.map((item, index) => {
            const estOuverte = ouverte === index;

            return (
              <div
                key={item.question}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white transition-all duration-300",
                  "dark:bg-neutral-900",
                  estOuverte
                    ? "border-primary-300 shadow-card dark:border-primary-700"
                    : "border-neutral-200 hover:border-primary-200 dark:border-neutral-800 dark:hover:border-primary-800"
                )}
              >
                {/* ---------- QUESTION (bouton) ---------- */}
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={estOuverte}
                  aria-controls={`faq-reponse-${index}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <span className="flex items-center gap-3">
                    {/* Numéro */}
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                        estOuverte
                          ? "bg-primary-500 text-white"
                          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Question */}
                    <span
                      className={cn(
                        "text-base font-semibold transition-colors",
                        estOuverte
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-neutral-900 dark:text-white"
                      )}
                    >
                      {item.question}
                    </span>
                  </span>

                  {/* Chevron */}
                  <ChevronDown
                    size={20}
                    className={cn(
                      "shrink-0 text-neutral-400 transition-transform duration-300",
                      estOuverte && "rotate-180 text-primary-500"
                    )}
                  />
                </button>

                {/* ---------- RÉPONSE ---------- */}
                <div
                  id={`faq-reponse-${index}`}
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    estOuverte
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 pl-16 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {item.reponse}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------- PIED ---------- */}
        <div
          className={cn(
            "mt-10 text-center transition-all duration-700 delay-300",
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Vous avez une autre question ?{" "}
            <a
              href="#contact"
              className="font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Contactez-nous
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}