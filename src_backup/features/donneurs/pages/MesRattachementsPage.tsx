// ============================================================
// AIDORA — MES RATTACHEMENTS (DONNEUR)
// ------------------------------------------------------------
// ⚠️ Alignés sur la réponse réelle du backend :
//   GET /api/rattachements/moi → { data: [...] }
// Champs :
//   est_principal : 0 ou 1 (nombre)
//   statut        : "ACTIF" | "INACTIF"
// ============================================================

import { useEffect, useState } from "react";
import {
  Star,
  RefreshCw,
  AlertTriangle,
  Building2,
  Check,
  X,
  MapPin,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import api from "../../../services/api";
import { extraireMessageErreur } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

// ------------------------------------------------------------
// Type local (aligné sur la réponse backend)
// ------------------------------------------------------------
interface Rattachement {
  id: number;
  donneur_id: number;
  etablissement_id: number;
  statut: "ACTIF" | "INACTIF";
  est_principal: number | boolean;
  source?: string;
  date_rattachement?: string;
  date_detachement?: string | null;
  created_at?: string;
  updated_at?: string;
  etablissement_nom?: string;
  etablissement_ville?: string;
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function estPrincipal(r: Rattachement): boolean {
  if (typeof r.est_principal === "boolean") return r.est_principal;
  return r.est_principal === 1;
}

function estActif(r: Rattachement): boolean {
  return r.statut === "ACTIF";
}

function dateRattachement(r: Rattachement): string {
  const iso = r.date_rattachement ?? r.created_at;
  return iso
    ? new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";
}

function libelleSource(s?: string): string {
  switch (s) {
    case "REGISTRE_MANUEL": return "Ajouté manuellement";
    case "INVITATION":      return "Par invitation";
    case "RDV":             return "Via un rendez-vous";
    default:                return s ?? "—";
  }
}

// ============================================================
// PAGE
// ============================================================

export function MesRattachementsPage() {
  const [rattachements, setRattachements] = useState<Rattachement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [action, setAction] = useState<number | null>(null);
  const { afficher } = useToast();

  async function charger() {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await api.get("/rattachements/moi");
      const data = reponse.data?.data ?? reponse.data;
      setRattachements(Array.isArray(data) ? data : []);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setRattachements([]);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function definirPrincipal(id: number) {
    setAction(id);
    try {
      await api.patch(`/rattachements/${id}/principal`);
      afficher("Rattachement principal mis à jour", "success");
      await charger();
    } catch (err) {
      afficher("Échec", "danger", extraireMessageErreur(err));
    } finally {
      setAction(null);
    }
  }

  const principaux = rattachements.filter(estPrincipal);
  const secondaires = rattachements.filter((r) => !estPrincipal(r));

  return (
    <PageLayout
      titre="Mes rattachements"
      description="Vos liens avec les établissements."
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
                Impossible de charger vos rattachements
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
          <Loader texte="Chargement…" />
        </Card>
      )}

      {!chargement && !erreur && rattachements.length === 0 && (
        <Card>
          <EmptyState
            icone={<Star size={22} />}
            titre="Aucun rattachement"
            description="Vous n'êtes rattaché à aucun établissement pour l'instant."
          />
        </Card>
      )}

      {!chargement && !erreur && rattachements.length > 0 && (
        <>
          {/* Résumé */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Total</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                {rattachements.length}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Actifs</p>
              <p className="mt-1 text-2xl font-bold text-success-700">
                {rattachements.filter(estActif).length}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Principal</p>
              <p className="mt-1 text-2xl font-bold text-warning-700">
                {principaux.length}
              </p>
            </Card>
          </div>

          {/* Établissements rattachés */}
          <Card>
            <CardTitle>Établissements rattachés</CardTitle>
            <CardDescription className="mb-4">
              Vous pouvez être rattaché à plusieurs banques. Définissez-en une
              comme principale.
            </CardDescription>

            <div>
              {[...principaux, ...secondaires].map((r) => {
                const principal = estPrincipal(r);
                const actif = estActif(r);

                return (
                  <div
                    key={r.id}
                    className="flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={
                          principal
                            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-50 text-warning-600"
                            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600"
                        }
                      >
                        <Building2 size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                          {r.etablissement_nom ??
                            `Établissement #${r.etablissement_id}`}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
                          {r.etablissement_ville && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={11} />
                              {r.etablissement_ville}
                            </span>
                          )}
                          <span>·</span>
                          <span>{libelleSource(r.source)}</span>
                          <span>·</span>
                          <span>Depuis {dateRattachement(r)}</span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {principal && (
                            <Badge variante="warning">
                              <Star size={11} />
                              Principal
                            </Badge>
                          )}
                          {actif ? (
                            <Badge variante="success">
                              <Check size={11} />
                              Actif
                            </Badge>
                          ) : (
                            <Badge variante="danger">
                              <X size={11} />
                              Inactif
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {!principal && actif && (
                      <Button
                        taille="sm"
                        variante="outline"
                        iconeGauche={<Star size={14} />}
                        onClick={() => definirPrincipal(r.id)}
                        disabled={action === r.id}
                        chargement={action === r.id}
                      >
                        Définir principal
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </PageLayout>
  );
}