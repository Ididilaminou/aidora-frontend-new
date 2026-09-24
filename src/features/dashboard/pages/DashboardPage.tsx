// ============================================================
// AIDORA — TABLEAU DE BORD
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  Users, HeartHandshake, ClipboardList, Package, Building2,
  AlertTriangle, TrendingUp, RefreshCw, Droplets,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import {
  ChartCard, LigneChart, BarreChart, CamembertChart,
} from "../../../components/charts";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import {
  obtenirStatsGlobales, obtenirStatsEtablissement, obtenirEvolutionDons,
  libelleStatutDemande, libelleTypeProduit, libelleTypeEtab, libelleRole,
  type StatsGlobales, type StatsEtablissement,
} from "../../statistiques/api";

// ------------------------------------------------------------
// Mois courts pour le graphique d'évolution (fallback)
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Type unifié
// ------------------------------------------------------------
interface StatsUnifiees {
  donneurs: number;
  dons: number;
  etablissements: number;
  personnels: number;
  demandes: number;
  stocks: number;
  poches: number;
  volumeCollecte: number;
  demandesUrgentes: number;
  stocksFaibles: number;
  demandesParStatut: Array<{ statut: string; total: number }>;
  stocksParType: Array<{ type_produit: string; total: number }>;
  etablissementsParType: Array<{ type: string; total: number }>;
  personnelsParRole: Array<{ role: string; total: number }>;
}

function normaliser(
  data: StatsGlobales | StatsEtablissement | null
): StatsUnifiees {
  const g = data as StatsGlobales | null;
  const e = data as StatsEtablissement | null;

  return {
    donneurs: g?.donneurs ?? 0,
    dons: g?.dons ?? e?.nombreDons ?? 0,
    etablissements: g?.etablissements ?? 0,
    personnels: g?.personnels ?? 0,
    demandes: g?.demandes ?? e?.nombreDemandes ?? 0,
    stocks: g?.stocks ?? e?.stockActuel ?? 0,
    poches: g?.poches ?? e?.nombrePoches ?? 0,
    volumeCollecte: e?.volumeCollecte ?? 0,
    demandesUrgentes: g?.demandesUrgentes ?? 0,
    stocksFaibles: g?.stocksFaibles ?? 0,
    demandesParStatut: g?.demandesParStatut ?? [],
    stocksParType: g?.stocksParType ?? [],
    etablissementsParType: g?.etablissementsParType ?? [],
    personnelsParRole: g?.personnelsParRole ?? [],
  };
}

// ============================================================
// PAGE
// ============================================================

export function DashboardPage() {
  const { utilisateur } = useAuth();
  const [donnees, setDonnees] = useState<StatsUnifiees | null>(null);
  const [evolution, setEvolution] = useState<Array<{ periode: string; total: number }>>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // ✅ Dépendance = objet utilisateur complet (fix React Compiler)
  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const role = utilisateur?.role;
      const etabId = utilisateur?.etablissement_id;

      // 1. Stats principales
      if (role === "ADMINISTRATEUR") {
        const brut = await obtenirStatsGlobales();
        setDonnees(normaliser(brut));
      } else if (etabId) {
        const brut = await obtenirStatsEtablissement(etabId);
        setDonnees(normaliser(brut));
      } else {
        setDonnees(null);
        setErreur("Aucun établissement associé à votre compte.");
        return;
      }

      // 2. Évolution des dons — UNIQUEMENT admin + banque
      const peutVoirEvolution =
        role === "ADMINISTRATEUR" || role === "PERSONNEL_BANQUE";

      if (peutVoirEvolution) {
        try {
          const evo = await obtenirEvolutionDons("MENSUEL");
          setEvolution(evo);
        } catch {
          setEvolution([]);
        }
      }
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setDonnees(null);
    } finally {
      setChargement(false);
    }
  }, [utilisateur]);

  useEffect(() => {
    charger();
  }, [charger]);

  const estAdmin = utilisateur?.role === "ADMINISTRATEUR";

  // --------------------------------------------------------
  // Données Recharts
  // --------------------------------------------------------
  const donneesDemandes = (donnees?.demandesParStatut ?? []).map((d) => ({
    label: libelleStatutDemande(d.statut),
    valeur: d.total,
  }));

  const donneesStocks = (donnees?.stocksParType ?? []).map((sp) => ({
    label: libelleTypeProduit(sp.type_produit),
    valeur: sp.total,
  }));

  const donneesEtab = (donnees?.etablissementsParType ?? []).map((e) => ({
    label: libelleTypeEtab(e.type),
    valeur: e.total,
  }));

  const donneesRoles = (donnees?.personnelsParRole ?? []).map((p) => ({
    label: libelleRole(p.role),
    valeur: p.total,
  }));

  const donneesEvolution =
    evolution.length > 0
      ? evolution.map((e) => ({
          label: e.periode ?? "—",
          valeur: e.total ?? 0,
        }))
      : sixDerniersMois().map((mois, i, arr) => ({
          label: mois,
          valeur: i === arr.length - 1 ? donnees?.dons ?? 0 : 0,
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

      {!chargement && !erreur && donnees && (
        <>
          {/* Alertes admin */}
          {estAdmin &&
            (donnees.demandesUrgentes > 0 || donnees.stocksFaibles > 0) && (
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                {donnees.demandesUrgentes > 0 && (
                  <Card className="border-danger-500/30 bg-danger-50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-danger-500" size={20} />
                      <div>
                        <p className="font-medium text-danger-700">
                          {donnees.demandesUrgentes} demande
                          {donnees.demandesUrgentes > 1 ? "s" : ""} urgente
                          {donnees.demandesUrgentes > 1 ? "s" : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-danger-700/80">
                          Traitement prioritaire requis.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
                {donnees.stocksFaibles > 0 && (
                  <Card className="border-warning-500/30 bg-warning-50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-warning-700" size={20} />
                      <div>
                        <p className="font-medium text-warning-700">
                          {donnees.stocksFaibles} stock
                          {donnees.stocksFaibles > 1 ? "s" : ""} sous le seuil
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
              valeur={donnees.dons}
              icone={<HeartHandshake size={18} />}
              variante="success"
            />
            <CarteStat
              label="Poches"
              valeur={donnees.poches}
              icone={<Package size={18} />}
              variante="info"
            />
            <CarteStat
              label="Demandes"
              valeur={donnees.demandes}
              icone={<ClipboardList size={18} />}
              variante="warning"
            />
            <CarteStat
              label="Stock actuel"
              valeur={donnees.stocks}
              icone={<Droplets size={18} />}
              variante="primary"
            />
          </div>

          {/* Bandeau non-admin */}
          {!estAdmin && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      {donnees.volumeCollecte} ml
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                    <HeartHandshake size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Dons enregistrés
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {donnees.dons}
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Établissement
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      #{utilisateur?.etablissement_id}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Graphiques admin */}
          {estAdmin && (
            <>
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

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Établissements
                      </p>
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">
                        {donnees.etablissements}
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
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Personnels
                      </p>
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">
                        {donnees.personnels}
                      </p>
                    </div>
                  </div>
                </Card>
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
                        {donnees.donneurs}
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
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Stocks faibles
                      </p>
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">
                        {donnees.stocksFaibles}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
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