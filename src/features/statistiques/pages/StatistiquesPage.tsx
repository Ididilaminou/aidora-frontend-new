// ============================================================
// AIDORA — PAGE STATISTIQUES
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  AlertTriangle,
  Users,
  HeartHandshake,
  ClipboardList,
  Package,
  Building2,
  UserCog,
  Droplets,
  TrendingUp,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import {
  ChartCard,
  BarreChart,
  CamembertChart,
} from "../../../components/charts";
import {
  obtenirStatsGlobales,
  obtenirStatsEtablissement,
  obtenirDemandesParStatut,
  obtenirStocksParType,
  libelleStatutDemande,
  libelleTypeProduit,
  libelleTypeEtab,
  libelleRole,
  PERIODES,
  type StatsGlobales,
  type StatsEtablissement,
  type PeriodeStats,
} from "../api";
import { extraireMessageErreur } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";

// ------------------------------------------------------------
// Type unifié
// ------------------------------------------------------------
interface StatsUnifiees {
  donneurs: number;
  dons: number;
  volumeCollecte: number;
  poches: number;
  demandes: number;
  stockActuel: number;
  etablissements: number;
  personnels: number;
  demandesUrgentes: number;
  stocksFaibles: number;
}

function normaliser(
  g: StatsGlobales | null,
  e: StatsEtablissement | null
): StatsUnifiees {
  return {
    donneurs: g?.donneurs ?? 0,
    dons: g?.dons ?? e?.nombreDons ?? 0,
    volumeCollecte: e?.volumeCollecte ?? 0,
    poches: g?.poches ?? e?.nombrePoches ?? 0,
    demandes: g?.demandes ?? e?.nombreDemandes ?? 0,
    stockActuel: g?.stocks ?? e?.stockActuel ?? 0,
    etablissements: g?.etablissements ?? 0,
    personnels: g?.personnels ?? 0,
    demandesUrgentes: g?.demandesUrgentes ?? 0,
    stocksFaibles: g?.stocksFaibles ?? 0,
  };
}

// ============================================================
// PAGE
// ============================================================

export function StatistiquesPage() {
  const { utilisateur } = useAuth();
  const estAdmin = utilisateur?.role === "ADMINISTRATEUR";

  const [periode, setPeriode] = useState<PeriodeStats>("MENSUEL");
  const [stats, setStats] = useState<StatsUnifiees | null>(null);
  const [demandes, setDemandes] = useState<Array<{ statut: string; total: number }>>([]);
  const [stocks, setStocks] = useState<Array<{ type_produit: string; total: number }>>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      // 1. Stats principales
      let statsBrutes: StatsUnifiees;
      if (utilisateur?.role === "ADMINISTRATEUR") {
        statsBrutes = normaliser(await obtenirStatsGlobales(), null);
      } else if (utilisateur?.etablissement_id) {
        const e = await obtenirStatsEtablissement(
          utilisateur.etablissement_id,
          periode
        );
        statsBrutes = normaliser(null, e);
      } else {
        setStats(null);
        setErreur("Aucun établissement associé à votre compte.");
        return;
      }
      setStats(statsBrutes);

      // 2. Répartitions (parallèle)
      const [d, s] = await Promise.all([
        obtenirDemandesParStatut(),
        obtenirStocksParType(),
      ]);
      setDemandes(d);
      setStocks(s);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setStats(null);
    } finally {
      setChargement(false);
    }
  }, [utilisateur, periode]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Données Recharts
  const donneesDemandes = demandes.map((d) => ({
    label: libelleStatutDemande(d.statut),
    valeur: d.total,
  }));

  const donneesStocks = stocks.map((s) => ({
    label: libelleTypeProduit(s.type_produit),
    valeur: s.total,
  }));

  // Rendu
  return (
    <PageLayout
      titre="Statistiques"
      description={
        estAdmin
          ? "Vue globale de la plateforme Aidora."
          : "Indicateurs de performance de votre établissement."
      }
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
      {/* Filtres période */}
      {!estAdmin && (
        <div className="mb-4 flex flex-wrap gap-2">
          {PERIODES.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriode(p.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                periode === p.value
                  ? "bg-primary-500 text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les statistiques
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
          <Loader texte="Chargement des statistiques…" />
        </Card>
      )}

      {!chargement && !erreur && stats && (
        <>
          {/* Alertes */}
          {(stats.demandesUrgentes > 0 || stats.stocksFaibles > 0) && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {stats.demandesUrgentes > 0 && (
                <Card className="border-danger-500/30 bg-danger-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-danger-500" size={20} />
                    <div>
                      <p className="font-medium text-danger-700">
                        {stats.demandesUrgentes} demande
                        {stats.demandesUrgentes > 1 ? "s" : ""} urgente
                        {stats.demandesUrgentes > 1 ? "s" : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-danger-700/80">
                        Traitement prioritaire requis.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
              {stats.stocksFaibles > 0 && (
                <Card className="border-warning-500/30 bg-warning-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-warning-700" size={20} />
                    <div>
                      <p className="font-medium text-warning-700">
                        {stats.stocksFaibles} stock
                        {stats.stocksFaibles > 1 ? "s" : ""} sous le seuil
                      </p>
                      <p className="mt-0.5 text-xs text-warning-700/80">
                        Réapprovisionnement conseillé.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CarteStat
              label="Dons"
              valeur={stats.dons}
              icone={<HeartHandshake size={18} />}
              variante="success"
            />
            <CarteStat
              label="Poches"
              valeur={stats.poches}
              icone={<Package size={18} />}
              variante="info"
            />
            <CarteStat
              label="Demandes"
              valeur={stats.demandes}
              icone={<ClipboardList size={18} />}
              variante="warning"
            />
            <CarteStat
              label="Stock actuel"
              valeur={stats.stockActuel}
              icone={<Droplets size={18} />}
              variante="primary"
            />
          </div>

          {/* Bandeau infos complémentaires */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.volumeCollecte > 0 && (
              <Card>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Volume collecté
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {stats.volumeCollecte} ml
                    </p>
                  </div>
                </div>
              </Card>
            )}
            {estAdmin && (
              <>
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Donneurs
                      </p>
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">
                        {stats.donneurs}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400">
                      <UserCog size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Personnels
                      </p>
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">
                        {stats.personnels}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Établissements
                      </p>
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">
                        {stats.etablissements}
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            )}
            {!estAdmin && stats.volumeCollecte === 0 && (
              <Card className="sm:col-span-2 lg:col-span-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Performance
                    </p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      Période sélectionnée : {periode.toLowerCase()}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Graphiques */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <ChartCard
              titre="Demandes par statut"
              description="Répartition de toutes les demandes."
              vide={donneesDemandes.length === 0}
            >
              <CamembertChart donnees={donneesDemandes} />
            </ChartCard>

            <ChartCard
              titre="Stocks par type de produit"
              description="Répartition du stock actuel."
              vide={donneesStocks.length === 0}
            >
              <BarreChart donnees={donneesStocks} multiCouleurs />
            </ChartCard>
          </div>
        </>
      )}
    </PageLayout>
  );
}

// ------------------------------------------------------------
function CarteStat({
  label,
  valeur,
  icone,
  variante,
}: {
  label: string;
  valeur: number;
  icone: React.ReactNode;
  variante: "primary" | "success" | "warning" | "info";
}) {
  return (
    <Card hoverable>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            {valeur}
          </p>
        </div>
        <Badge variante={variante}>{icone}</Badge>
      </div>
    </Card>
  );
}