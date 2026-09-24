// ============================================================
// AIDORA — TABLEAU DE BORD
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  HeartHandshake,
  ClipboardList,
  Package,
  Building2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import {
  ChartCard,
  LigneChart,
  BarreChart,
  CamembertChart,
} from "../../../components/charts";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import {
  obtenirStatsGlobales,
  libelleStatutDemande,
  libelleTypeProduit,
  libelleTypeEtab,
  libelleRole,
  type StatsGlobales,
} from "../../statistiques/api";

// ------------------------------------------------------------
// Génère un libellé court pour les 6 derniers mois
// ------------------------------------------------------------
const MOIS_COURTS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function sixDerniersMois(): string[] {
  const resultat: string[] = [];
  const maintenant = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    resultat.push(MOIS_COURTS[d.getMonth()]);
  }
  return resultat;
}

// ============================================================
// PAGE
// ============================================================

export function DashboardPage() {
  const { utilisateur } = useAuth();
  const [stats, setStats] = useState<StatsGlobales | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      setStats(await obtenirStatsGlobales());
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setStats(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // --------------------------------------------------------
  // Données prêtes pour Recharts
  // --------------------------------------------------------
  const donneesDemandes = (stats?.demandesParStatut ?? []).map((d) => ({
    label: libelleStatutDemande(d.statut),
    valeur: d.total,
  }));

  const donneesStocks = (stats?.stocksParType ?? []).map((s) => ({
    label: libelleTypeProduit(s.type_produit),
    valeur: s.total,
  }));

  const donneesEtab = (stats?.etablissementsParType ?? []).map((e) => ({
    label: libelleTypeEtab(e.type),
    valeur: e.total,
  }));

  const donneesRoles = (stats?.personnelsParRole ?? []).map((p) => ({
    label: libelleRole(p.role),
    valeur: p.total,
  }));

  // ⚠️ L'évolution des dons nécessite un endpoint dédié.
  //    Pour l'instant, on génère un placeholder basé sur les données réelles.
  const donneesEvolution = sixDerniersMois().map((mois, i, arr) => ({
    label: mois,
    valeur: i === arr.length - 1 ? stats?.dons ?? 0 : 0,
  }));

  return (
    <PageLayout
      titre={`Bonjour ${utilisateur?.prenom ?? ""} 👋`}
      description="Voici l'activité de votre établissement aujourd'hui."
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
      {/* Erreur */}
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

      {/* Chargement */}
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
              label="Donneurs"
              valeur={stats.donneurs}
              icone={<Users size={18} />}
              variante="primary"
            />
            <CarteStat
              label="Dons"
              valeur={stats.dons}
              icone={<HeartHandshake size={18} />}
              variante="success"
            />
            <CarteStat
              label="Demandes"
              valeur={stats.demandes}
              icone={<ClipboardList size={18} />}
              variante="warning"
            />
            <CarteStat
              label="Poches"
              valeur={stats.poches}
              icone={<Package size={18} />}
              variante="info"
            />
          </div>

          {/* Graphiques ligne 1 : Évolution + Demandes */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <ChartCard
              titre="Évolution des dons"
              description="6 derniers mois"
              className="lg:col-span-2"
            >
              <LigneChart donnees={donneesEvolution} />
            </ChartCard>

            <ChartCard
              titre="Demandes par statut"
              description="Répartition actuelle"
              vide={donneesDemandes.length === 0}
            >
              <CamembertChart donnees={donneesDemandes} />
            </ChartCard>
          </div>

          {/* Graphiques ligne 2 : Stocks + Établissements + Rôles */}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <ChartCard
              titre="Stocks par type de produit"
              description="Volume disponible"
              vide={donneesStocks.length === 0}
            >
              <BarreChart donnees={donneesStocks} multiCouleurs />
            </ChartCard>

            <ChartCard
              titre="Établissements"
              description="Par type"
              vide={donneesEtab.length === 0}
            >
              <CamembertChart donnees={donneesEtab} />
            </ChartCard>

            <ChartCard
              titre="Personnels par rôle"
              description="Comptes utilisateurs"
              vide={donneesRoles.length === 0}
            >
              <BarreChart donnees={donneesRoles} multiCouleurs />
            </ChartCard>
          </div>

          {/* Bandeau d'infos complémentaires */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <Building2 size={18} />
                </div>
                <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
                    Établissements
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {stats.etablissements}
                    </p>
                </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400">
                    <Users size={18} />
                </div>
                <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                    <Package size={18} />
                </div>
                <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
                    Stocks
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {stats.stocks}
                    </p>
                </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400">
                    <TrendingUp size={18} />
                </div>
                <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
                    Stocks faibles
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {stats.stocksFaibles}
                    </p>
                </div>
                </div>
            </Card>
            </div>
        </>
      )}
    </PageLayout>
  );
}

// ------------------------------------------------------------
// KPI Card
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
          <p className="text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
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