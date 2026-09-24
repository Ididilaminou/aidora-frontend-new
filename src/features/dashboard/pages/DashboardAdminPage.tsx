// ============================================================
// AIDORA — TABLEAU DE BORD ADMINISTRATEUR
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  Users, HeartHandshake, ClipboardList, Package, Building2,
  AlertTriangle, TrendingUp, RefreshCw, Droplets, UserCog,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import {
  ChartCard, LigneChart, BarreChart, CamembertChart,
} from "../../../components/charts";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import { ROUTES } from "../../../config/routes";
import {
  obtenirStatsGlobales, obtenirEvolutionDons,
  libelleStatutDemande, libelleTypeProduit, libelleTypeEtab, libelleRole,
  type StatsGlobales,
} from "../../statistiques/api";

const MOIS_COURTS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

function sixDerniersMois(): string[] {
  const resultat: string[] = [];
  const maintenant = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    resultat.push(MOIS_COURTS[d.getMonth()]);
  }
  return resultat;
}

export function DashboardAdminPage() {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsGlobales | null>(null);
  const [evolution, setEvolution] = useState<Array<{ periode: string; total: number }>>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      setStats(await obtenirStatsGlobales());
      try {
        setEvolution(await obtenirEvolutionDons("MENSUEL"));
      } catch {
        setEvolution([]);
      }
    } catch (err) {
      setErreur(extraireMessageErreur(err));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const s = {
    donneurs: stats?.donneurs ?? 0,
    dons: stats?.dons ?? 0,
    etablissements: stats?.etablissements ?? 0,
    personnels: stats?.personnels ?? 0,
    demandes: stats?.demandes ?? 0,
    stocks: stats?.stocks ?? 0,
    poches: stats?.poches ?? 0,
    demandesUrgentes: stats?.demandesUrgentes ?? 0,
    stocksFaibles: stats?.stocksFaibles ?? 0,
    demandesParStatut: stats?.demandesParStatut ?? [],
    stocksParType: stats?.stocksParType ?? [],
    etablissementsParType: stats?.etablissementsParType ?? [],
    personnelsParRole: stats?.personnelsParRole ?? [],
  };

  const donneesEvolution =
    evolution.length > 0
      ? evolution.map((e) => ({ label: e.periode ?? "—", valeur: e.total ?? 0 }))
      : sixDerniersMois().map((mois, i, arr) => ({
          label: mois,
          valeur: i === arr.length - 1 ? s.dons : 0,
        }));

  return (
    <PageLayout
      titre={`Bonjour ${utilisateur?.prenom ?? ""} 👋`}
      description="Vue globale de la plateforme Aidora."
      actions={
        <Button variante="outline" iconeGauche={<RefreshCw size={16} />}
          onClick={charger} disabled={chargement}>
          Actualiser
        </Button>
      }
    >
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">Impossible de charger les données</p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={charger}>Réessayer</Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (<Card><Loader texte="Chargement…" /></Card>)}

      {!chargement && !erreur && (
        <>
          {/* Alertes globales */}
          {(s.demandesUrgentes > 0 || s.stocksFaibles > 0) && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {s.demandesUrgentes > 0 && (
                <Card className="border-danger-500/30 bg-danger-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-danger-500" size={20} />
                    <div>
                      <p className="font-medium text-danger-700">
                        {s.demandesUrgentes} demande{s.demandesUrgentes > 1 ? "s" : ""} urgente{s.demandesUrgentes > 1 ? "s" : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-danger-700/80">
                        Sur toute la plateforme.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
              {s.stocksFaibles > 0 && (
                <Card className="border-warning-500/30 bg-warning-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-warning-700" size={20} />
                    <div>
                      <p className="font-medium text-warning-700">
                        {s.stocksFaibles} stock{s.stocksFaibles > 1 ? "s" : ""} sous le seuil
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
            <CarteStat label="Donneurs" valeur={s.donneurs}
              icone={<Users size={18} />} variante="primary" />
            <CarteStat label="Dons" valeur={s.dons}
              icone={<HeartHandshake size={18} />} variante="success" />
            <CarteStat label="Demandes" valeur={s.demandes}
              icone={<ClipboardList size={18} />} variante="warning" />
            <CarteStat label="Poches" valeur={s.poches}
              icone={<Package size={18} />} variante="info" />
          </div>

          {/* 2e ligne */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CarteStat label="Établissements" valeur={s.etablissements}
              icone={<Building2 size={18} />} variante="primary" />
            <CarteStat label="Personnels" valeur={s.personnels}
              icone={<UserCog size={18} />} variante="info" />
            <CarteStat label="Stocks" valeur={s.stocks}
              icone={<Package size={18} />} variante="success" />
            <CarteStat label="Stocks faibles" valeur={s.stocksFaibles}
              icone={<TrendingUp size={18} />} variante="warning" />
          </div>

          {/* Graphiques */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <ChartCard titre="Évolution des dons" description="6 derniers mois"
              className="lg:col-span-2">
              <LigneChart donnees={donneesEvolution} />
            </ChartCard>

            <ChartCard titre="Demandes par statut" description="Répartition actuelle"
              vide={s.demandesParStatut.length === 0}>
              <CamembertChart donnees={s.demandesParStatut.map((d) => ({
                label: libelleStatutDemande(d.statut), valeur: d.total,
              }))} />
            </ChartCard>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <ChartCard titre="Stocks par type" description="Volume disponible"
              vide={s.stocksParType.length === 0}>
              <BarreChart donnees={s.stocksParType.map((p) => ({
                label: libelleTypeProduit(p.type_produit), valeur: p.total,
              }))} multiCouleurs />
            </ChartCard>

            <ChartCard titre="Établissements" description="Par type"
              vide={s.etablissementsParType.length === 0}>
              <CamembertChart donnees={s.etablissementsParType.map((e) => ({
                label: libelleTypeEtab(e.type), valeur: e.total,
              }))} />
            </ChartCard>

            <ChartCard titre="Personnels par rôle" description="Comptes utilisateurs"
              vide={s.personnelsParRole.length === 0}>
              <BarreChart donnees={s.personnelsParRole.map((p) => ({
                label: libelleRole(p.role), valeur: p.total,
              }))} multiCouleurs />
            </ChartCard>
          </div>

          {/* Actions rapides admin */}
          <Card className="mt-6">
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription className="mb-4">
              Raccourcis vers les tâches administratives.
            </CardDescription>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ActionCard label="Établissements" description="Valider / gérer"
                onClick={() => navigate(ROUTES.ETABLISSEMENTS)} />
              <ActionCard label="Utilisateurs" description="Comptes personnel"
                onClick={() => navigate(ROUTES.UTILISATEURS)} />
              <ActionCard label="Statistiques" description="Vue détaillée"
                onClick={() => navigate(ROUTES.STATISTIQUES)} />
              <ActionCard label="Journal d'audit" description="Traçabilité"
                onClick={() => navigate(ROUTES.JOURNAL_AUDIT)} />
            </div>
          </Card>
        </>
      )}
    </PageLayout>
  );
}

function CarteStat({
  label, valeur, icone, variante,
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
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{valeur}</p>
        </div>
        <Badge variante={variante}>{icone}</Badge>
      </div>
    </Card>
  );
}

function ActionCard({
  label, description, onClick,
}: {
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-primary-500/30 hover:shadow-soft dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </div>
      <ArrowRight size={14}
        className="shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500" />
    </button>
  );
}