// ============================================================
// AIDORA — PAGE POCHES
// ============================================================

import { useState } from "react";
import {
  Package,
  RefreshCw,
  AlertTriangle,
  Droplets,
  Calendar,
  Clock,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { usePoches } from "../hooks/usePoches";
import {
  groupePoche,
  datePeremption,
  joursRestants,
  libelleStatutPoche,
  varianteStatutPoche,
  formatTypeProduit,
} from "../../../types/poche";

const FILTRES = [
  { value: "",            label: "Tous" },
  { value: "EN_CONTROLE", label: "En contrôle" },
  { value: "DISPONIBLE",  label: "Disponibles" },
  { value: "RESERVEE",    label: "Réservées" },
  { value: "VENDUE",      label: "Vendues" },
  { value: "EXPIREE",     label: "Expirées" },
] as const;

export function PochesPage() {
  const [statut, setStatut] = useState("");
  const { poches, total, chargement, erreur, recharger } = usePoches(
    statut ? { statut } : {}
  );

  const expirees = poches.filter((p) => p.statut === "EXPIREE").length;
  const controle = poches.filter((p) => p.statut === "EN_CONTROLE").length;

  return (
    <PageLayout
      titre="Poches de sang"
      description={`${total} poche${total > 1 ? "s" : ""} tracée${total > 1 ? "s" : ""}.`}
      actions={
        <Button
          variante="outline"
          iconeGauche={<RefreshCw size={16} />}
          onClick={recharger}
          disabled={chargement}
        >
          Actualiser
        </Button>
      }
    >
      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatut(f.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              statut === f.value
                ? "bg-primary-500 text-white"
                : "border border-neutral-200 bg-white text-neutral-600 dark:text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {!chargement && !erreur && poches.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{total}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">En contrôle</p>
            <p className="mt-1 text-2xl font-bold text-info-700">{controle}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Expirées</p>
            <p className="mt-1 text-2xl font-bold text-danger-700">
              {expirees}
            </p>
          </Card>
        </div>
      )}

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les poches
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={recharger}>
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (
        <Card>
          <Loader texte="Chargement des poches…" />
        </Card>
      )}

      {!chargement && !erreur && poches.length === 0 && (
        <Card>
          <EmptyState
            icone={<Package size={22} />}
            titre="Aucune poche"
            description="Les poches apparaîtront ici une fois créées."
          />
        </Card>
      )}

      {!chargement && !erreur && poches.length > 0 && (
        <Card>
          <CardTitle>Liste des poches</CardTitle>
          <CardDescription className="mb-4">
            Chaque poche est tracée de son prélèvement à son utilisation.
          </CardDescription>
          <div>
            {poches.map((p) => {
              const jours = joursRestants(p);
              const bientot =
                jours !== null &&
                jours <= 7 &&
                jours > 0 &&
                p.statut === "DISPONIBLE";

              return (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-lg font-bold text-primary-700">
                      {groupePoche(p)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                        {p.code_poche}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
                        <span className="inline-flex items-center gap-1">
                          <Droplets size={11} />
                          {formatTypeProduit(p.type_produit)}
                        </span>
                        <span>·</span>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {p.volume ?? 0} ml
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={11} />
                          Exp. {datePeremption(p)}
                        </span>
                        {p.etablissement_nom && (
                          <>
                            <span>·</span>
                            <span>{p.etablissement_nom}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {bientot && (
                      <Badge variante="warning">
                        <Clock size={11} />
                        Expire dans {jours}j
                      </Badge>
                    )}
                    <Badge variante={varianteStatutPoche(p.statut)}>
                      {libelleStatutPoche(p.statut)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}