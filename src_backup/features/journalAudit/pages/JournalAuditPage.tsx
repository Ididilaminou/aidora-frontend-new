// ============================================================
// AIDORA — PAGE JOURNAL D'AUDIT
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  ScrollText,
  RefreshCw,
  AlertTriangle,
  User,
  Globe,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import {
  obtenirJournalAudit,
  varianteAction,
  dateAudit,
  type EntreeAudit,
} from "../api";
import { extraireMessageErreur } from "../../../services/api";

export function JournalAuditPage() {
  const [entrees, setEntrees] = useState<EntreeAudit[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      setEntrees(await obtenirJournalAudit());
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setEntrees([]);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  return (
    <PageLayout
      titre="Journal d'audit"
      description={`${entrees.length} action${entrees.length > 1 ? "s" : ""} enregistrée${entrees.length > 1 ? "s" : ""}.`}
      actions={
        <Button
          variante="outline"
          iconeGauche={<RefreshCw size={16} />}
          onClick={charger}
          disabled={chargement}
        >
          Actualiser
        </Button>
      }
    >
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger le journal
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={charger}>
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (
        <Card>
          <Loader texte="Chargement du journal…" />
        </Card>
      )}

      {!chargement && !erreur && entrees.length === 0 && (
        <Card>
          <EmptyState
            icone={<ScrollText size={22} />}
            titre="Aucune action enregistrée"
            description="Les actions effectuées dans l'application apparaîtront ici."
          />
        </Card>
      )}

      {!chargement && !erreur && entrees.length > 0 && (
        <Card>
          <CardTitle>Actions récentes</CardTitle>
          <CardDescription className="mb-4">
            Historique complet des actions effectuées dans l'application.
          </CardDescription>
          <div>
            {entrees.map((e) => {
              const nom =
                `${e.utilisateur_prenom ?? ""} ${e.utilisateur_nom ?? ""}`.trim() ||
                "Système";

              return (
                <div
                  key={e.id}
                  className="flex flex-col gap-2 border-b border-neutral-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
                      <User size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variante={varianteAction(e.action)}>
                          {e.action}
                        </Badge>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
                          par <strong>{nom}</strong>
                        </span>
                      </div>
                      {e.details && (
                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 dark:text-neutral-500">
                          {e.details}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
                        <span>{dateAudit(e)}</span>
                        {e.ip && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Globe size={11} />
                              {e.ip}
                            </span>
                          </>
                        )}
                        {e.entite && (
                          <>
                            <span>·</span>
                            <span>
                              {e.entite}
                              {e.entite_id ? ` #${e.entite_id}` : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
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