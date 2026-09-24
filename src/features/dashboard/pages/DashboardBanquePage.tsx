// ============================================================
// AIDORA — TABLEAU DE BORD BANQUE DE SANG
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  HeartHandshake, Droplets, Package, ClipboardList, AlertTriangle,
  RefreshCw, TrendingUp, Users, CalendarDays, ArrowRight, Plus, Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ChartCard, BarreChart } from "../../../components/charts";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import { ROUTES } from "../../../config/routes";
import {
  obtenirStatsEtablissement,
  obtenirDemandesParStatut, obtenirStocksParType,
  libelleStatutDemande, libelleTypeProduit,
  type StatsEtablissement,
} from "../../statistiques/api";
import { useDons } from "../../dons/hooks/useDons";
import { useDemandes } from "../../demandes/hooks/useDemandes";
import {
  formatDateDon, formatTypeDon, varianteStatut, libelleStatut,
  nomCompletDonneur, type Don,
} from "../../../types/don";
import {
  groupeDemande, libelleStatutDemande as libStatDem,
  varianteStatutDemande, libelleUrgence, varianteUrgence,
  type Demande,
} from "../../../types/demande";

// ------------------------------------------------------------
function CarteStat({
  label, valeur, suffixe, icone, variante,
}: {
  label: string;
  valeur: number | string;
  suffixe?: string;
  icone: React.ReactNode;
  variante: "primary" | "success" | "warning" | "info" | "danger";
}) {
  return (
    <Card hoverable>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{valeur}</p>
          {suffixe && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{suffixe}</p>
          )}
        </div>
        <Badge variante={variante}>{icone}</Badge>
      </div>
    </Card>
  );
}

// ============================================================
// PAGE
// ============================================================

export function DashboardBanquePage() {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<StatsEtablissement | null>(null);
  const [demandesParStatut, setDemandesParStatut] = useState<Array<{ statut: string; total: number }>>([]);
  const [stocksParType, setStocksParType] = useState<Array<{ type_produit: string; total: number }>>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const { dons } = useDons();
  const { demandes } = useDemandes();

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      if (!utilisateur?.etablissement_id) {
        setErreur("Aucun établissement associé à votre compte.");
        return;
      }
      const [s, d, st] = await Promise.all([
        obtenirStatsEtablissement(utilisateur.etablissement_id),
        obtenirDemandesParStatut(),
        obtenirStocksParType(),
      ]);
      setStats(s);
      setDemandesParStatut(d);
      setStocksParType(st);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
    } finally {
      setChargement(false);
    }
  }, [utilisateur?.etablissement_id]);

  useEffect(() => { charger(); }, [charger]);

  // Calculs locaux
  const donsEnAttente = dons.filter((x) => x.statut === "EN_ATTENTE").length;
  const demandesEnAttente = demandes.filter((x) => x.statut === "EN_ATTENTE").length;
  const demandesCritiques = demandes.filter((x) => x.urgence >= 2).length;

  const derniersDons = [...dons]
    .sort((a, b) => new Date(b.date_don).getTime() - new Date(a.date_don).getTime())
    .slice(0, 4);

  const demandesA_Traiter = [...demandes]
    .filter((x) => x.statut === "EN_ATTENTE")
    .sort((a, b) => b.urgence - a.urgence)
    .slice(0, 4);

  return (
    <PageLayout
      titre={`Bonjour ${utilisateur?.prenom ?? ""} 👋`}
      description="Activité de votre banque de sang en un coup d'œil."
      actions={
        <>
          <Button variante="outline" iconeGauche={<RefreshCw size={16} />}
            onClick={charger} disabled={chargement}>
            Actualiser
          </Button>
          <Button iconeGauche={<Plus size={16} />}
            onClick={() => navigate(ROUTES.DONS)}>
            Nouveau don
          </Button>
        </>
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
          {/* Alertes */}
          {(demandesCritiques > 0 || (stats?.stockActuel ?? 0) < 10) && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {demandesCritiques > 0 && (
                <Card className="border-danger-500/30 bg-danger-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-danger-500" size={20} />
                    <div>
                      <p className="font-medium text-danger-700">
                        {demandesCritiques} demande{demandesCritiques > 1 ? "s" : ""} critique{demandesCritiques > 1 ? "s" : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-danger-700/80">
                        Priorité maximale.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
              {(stats?.stockActuel ?? 0) < 10 && (
                <Card className="border-warning-500/30 bg-warning-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-warning-700" size={20} />
                    <div>
                      <p className="font-medium text-warning-700">
                        Stock bas : {stats?.stockActuel ?? 0} poches
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

          {/* KPI */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CarteStat label="Dons" valeur={stats?.nombreDons ?? 0}
              icone={<HeartHandshake size={18} />} variante="success" />
            <CarteStat label="Poches" valeur={stats?.nombrePoches ?? 0}
              icone={<Package size={18} />} variante="info" />
            <CarteStat label="Stock actuel" valeur={stats?.stockActuel ?? 0}
              suffixe="poches disponibles" icone={<Droplets size={18} />}
              variante="primary" />
            <CarteStat label="Demandes" valeur={stats?.nombreDemandes ?? 0}
              icone={<ClipboardList size={18} />} variante="warning" />
          </div>

          {/* 2e ligne */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
                    {stats?.volumeCollecte ?? 0} ml
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400">
                  <HeartHandshake size={18} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Dons en attente
                  </p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {donsEnAttente}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400">
                  <ClipboardList size={18} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Demandes à traiter
                  </p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {demandesEnAttente}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions rapides */}
          <Card className="mt-6">
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription className="mb-4">
              Raccourcis vers les tâches du quotidien.
            </CardDescription>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ActionCard label="Gérer les dons" description={`${donsEnAttente} en attente`}
                onClick={() => navigate(ROUTES.DONS)} />
              <ActionCard label="Traiter les demandes" description={`${demandesEnAttente} à traiter`}
                onClick={() => navigate(ROUTES.DEMANDES)} />
              <ActionCard label="Gérer le stock" description={`${stats?.stockActuel ?? 0} poches`}
                onClick={() => navigate(ROUTES.STOCKS)} />
              <ActionCard label="Voir les poches" description={`${stats?.nombrePoches ?? 0} tracées`}
                onClick={() => navigate(ROUTES.POCHES)} />
            </div>
          </Card>

          {/* 2 colonnes : derniers dons + demandes urgentes */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* Derniers dons */}
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <CardTitle>Derniers dons</CardTitle>
                  <CardDescription>Les 4 derniers enregistrements.</CardDescription>
                </div>
                <Button variante="ghost" taille="sm"
                  onClick={() => navigate(ROUTES.DONS)}>
                  Voir tout <ArrowRight size={14} />
                </Button>
              </div>

              {derniersDons.length === 0 ? (
                <EmptyState icone={<HeartHandshake size={20} />}
                  titre="Aucun don" description="Enregistrez votre premier don."
                  action={
                    <Button taille="sm" iconeGauche={<Plus size={14} />}
                      onClick={() => navigate(ROUTES.DONS)}>
                      Nouveau don
                    </Button>
                  } />
              ) : (
                <div>
                  {derniersDons.map((don) => (
                    <div key={don.id}
                      className="flex items-center justify-between border-b border-neutral-100 py-3 last:border-0 dark:border-neutral-800">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                          {nomCompletDonneur(don)}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                          {formatTypeDon(don.type_don)} · {don.quantite} ml ·{" "}
                          {formatDateDon(don)}
                        </p>
                      </div>
                      <Badge variante={varianteStatut(don.statut)}>
                        {libelleStatut(don.statut)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Demandes à traiter */}
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <CardTitle>Demandes à traiter</CardTitle>
                  <CardDescription>Priorité aux plus urgentes.</CardDescription>
                </div>
                <Button variante="ghost" taille="sm"
                  onClick={() => navigate(ROUTES.DEMANDES)}>
                  Voir tout <ArrowRight size={14} />
                </Button>
              </div>

              {demandesA_Traiter.length === 0 ? (
                <EmptyState icone={<ClipboardList size={20} />}
                  titre="Aucune demande en attente"
                  description="Tout est à jour." />
              ) : (
                <div>
                  {demandesA_Traiter.map((d) => (
                    <div key={d.id}
                      className="flex items-center justify-between border-b border-neutral-100 py-3 last:border-0 dark:border-neutral-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
                          {groupeDemande(d)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {d.quantite_demandee} unité{d.quantite_demandee > 1 ? "s" : ""}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                            {d.demandeur_nom}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {d.urgence > 0 && (
                          <Badge variante={varianteUrgence(d.urgence)}>
                            {libelleUrgence(d.urgence)}
                          </Badge>
                        )}
                        <Badge variante={varianteStatutDemande(d.statut)}>
                          {libStatDem(d.statut)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Graphique stocks par type */}
          <div className="mt-6">
            <ChartCard titre="Stocks par type de produit"
              description="Volume disponible dans votre banque"
              vide={stocksParType.length === 0}>
              <BarreChart donnees={stocksParType.map((p) => ({
                label: libelleTypeProduit(p.type_produit), valeur: p.total,
              }))} multiCouleurs />
            </ChartCard>
          </div>
        </>
      )}
    </PageLayout>
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