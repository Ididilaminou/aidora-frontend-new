// ============================================================
// AIDORA — TABLEAU DE BORD HÔPITAL
// ------------------------------------------------------------
// • Hôpital SANS banque → vue demandes uniquement
// • Hôpital AVEC banque → bandeau info + demandes
//   (les stats dons ne s'affichent qu'au personnel BANQUE)
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  ClipboardList, RefreshCw, AlertTriangle, PackageCheck,
  Truck, Clock, TrendingUp, Droplets, Plus, ArrowRight,
  HeartHandshake, Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { CanDo } from "../../../components/auth/CanDo";
import { useDemandes } from "../../demandes/hooks/useDemandes";
import { useDons } from "../../dons/hooks/useDons";
import { useAuth } from "../../../hooks/useAuth";
import { ROUTES } from "../../../config/routes";
import api from "../../../services/api";
import { possedeBanque, type Etablissement } from "../../../types/etablissement";
import {
  groupeDemande, dateDemande, varianteStatutDemande,
  libelleStatutDemande, type Demande,
} from "../../../types/demande";

// ------------------------------------------------------------
function CarteStat({
  label, valeur, icone, variante,
}: {
  label: string;
  valeur: number;
  icone: React.ReactNode;
  variante: "primary" | "success" | "warning" | "info" | "danger";
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

// ------------------------------------------------------------
function LigneCompacte({
  demande, onVoir,
}: {
  demande: Demande;
  onVoir: () => void;
}) {
  const groupe = groupeDemande(demande);
  return (
    <button
      onClick={onVoir}
      className="flex w-full items-center gap-3 border-b border-neutral-100 py-3 text-left transition last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
        {groupe}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
          {demande.quantite_demandee} unité
          {demande.quantite_demandee > 1 ? "s" : ""} — {groupe}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {dateDemande(demande)}
        </p>
      </div>
      <Badge variante={varianteStatutDemande(demande.statut)}>
        {libelleStatutDemande(demande.statut)}
      </Badge>
      <ArrowRight size={14} className="shrink-0 text-neutral-400" />
    </button>
  );
}

// ============================================================
// PAGE
// ============================================================

export function DashboardHopitalPage() {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();
  const { demandes, total, chargement, erreur, recharger } = useDemandes();

  const [etablissement, setEtablissement] = useState<Etablissement | null>(null);
  const [chargementEtab, setChargementEtab] = useState(true);

  // ✅ On ne charge les dons QUE si l'utilisateur est personnel banque
  const estBanque = utilisateur?.role === "PERSONNEL_BANQUE";
  const { dons } = useDons();

  useEffect(() => {
    if (!utilisateur?.etablissement_id) {
      setChargementEtab(false);
      return;
    }
    (async () => {
      try {
        const rep = await api.get(
          `/etablissements/${utilisateur.etablissement_id}`
        );
        setEtablissement(rep.data?.data ?? rep.data);
      } catch {
        setEtablissement(null);
      } finally {
        setChargementEtab(false);
      }
    })();
  }, [utilisateur?.etablissement_id]);

  const aUneBanque = possedeBanque(etablissement ?? undefined);

  // Stats demandes
  const enAttente = demandes.filter((d) => d.statut === "EN_ATTENTE").length;
  const enCours = demandes.filter(
    (d) => d.statut === "ACCEPTEE" || d.statut === "LIVREE"
  ).length;
  const recues = demandes.filter((d) => d.statut === "RECUE").length;
  const rejetees = demandes.filter((d) => d.statut === "REJETEE").length;
  const critiques = demandes.filter((d) => d.urgence >= 2).length;

  const recentes = [...demandes]
    .sort(
      (a, b) =>
        new Date(b.date_demande).getTime() - new Date(a.date_demande).getTime()
    )
    .slice(0, 5);

  // Stats banque (uniquement utilisées si estBanque)
  const donsValides = dons.filter((d) => d.statut === "VALIDE").length;
  const donsEnAttente = dons.filter((d) => d.statut === "EN_ATTENTE").length;

  const chargementGlobal = chargement || chargementEtab;

  return (
    <PageLayout
      titre={`Bonjour ${utilisateur?.prenom ?? ""} 👋`}
      description={
        aUneBanque
          ? "Suivi de vos demandes et de la banque de sang de votre hôpital."
          : "Suivi de vos demandes de sang auprès des banques partenaires."
      }
      actions={
        <>
          <Button
            variante="outline"
            iconeGauche={<RefreshCw size={16} />}
            onClick={recharger}
            disabled={chargement}
          >
            Actualiser
          </Button>
          <CanDo action="demande.creer">
            <Button
              iconeGauche={<Plus size={16} />}
              onClick={() => navigate(ROUTES.DEMANDES)}
            >
              Nouvelle demande
            </Button>
          </CanDo>
        </>
      }
    >
      {/* ============ BANDEAU BANQUE DE SANG ============ */}
      {!chargementEtab && aUneBanque && (
        <Card className="mb-4 border-success-500/30 bg-success-50 dark:bg-success-500/5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-500 text-white">
              <Droplets size={18} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-success-700 dark:text-success-400">
                🩸 Votre hôpital dispose d'une banque de sang
              </p>
              <p className="mt-0.5 text-sm text-success-700/80 dark:text-success-400/80">
                {estBanque
                  ? "Vous pouvez enregistrer des dons et gérer le stock de poches."
                  : "La banque de sang de votre hôpital est gérée par le personnel banque. Contactez-les pour toute question sur les dons et les stocks."}
              </p>
            </div>

            {/* ✅ Bouton visible UNIQUEMENT pour le personnel banque */}
            <CanDo action="don.creer">
              <Button
                variante="outline"
                taille="sm"
                onClick={() => navigate(ROUTES.DONS)}
              >
                Gérer les dons
              </Button>
            </CanDo>
          </div>
        </Card>
      )}

      {/* ============ URGENCES ============ */}
      {!chargementGlobal && critiques > 0 && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-danger-500" size={20} />
            <div>
              <p className="font-medium text-danger-700">
                {critiques} demande{critiques > 1 ? "s" : ""} critique
                {critiques > 1 ? "s" : ""} en cours
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">
                Ces demandes nécessitent une attention immédiate.
              </p>
            </div>
          </div>
        </Card>
      )}

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les données
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={recharger}>
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {chargementGlobal && !erreur && (
        <Card>
          <Loader texte="Chargement…" />
        </Card>
      )}

      {!chargementGlobal && !erreur && (
        <>
          {/* ============ SECTION BANQUE — réservée personnel banque ============ */}
          {aUneBanque && (
            <CanDo action="don.creer">
              <>
                <div className="mb-2 flex items-center gap-2">
                  <HeartHandshake size={18} className="text-success-600" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Activité de la banque de sang
                  </h2>
                </div>
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <CarteStat
                    label="Dons validés"
                    valeur={donsValides}
                    icone={<HeartHandshake size={18} />}
                    variante="success"
                  />
                  <CarteStat
                    label="Dons en attente"
                    valeur={donsEnAttente}
                    icone={<Clock size={18} />}
                    variante="warning"
                  />
                  <CarteStat
                    label="Poches générées"
                    valeur={donsValides * 2}
                    icone={<Package size={18} />}
                    variante="info"
                  />
                  <CarteStat
                    label="Raccourcis"
                    valeur={4}
                    icone={<TrendingUp size={18} />}
                    variante="primary"
                  />
                </div>
              </>
            </CanDo>
          )}

          {/* ============ SECTION DEMANDES ============ */}
          <div className="mb-2 flex items-center gap-2">
            <ClipboardList size={18} className="text-primary-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Mes demandes de sang
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CarteStat
              label="En attente"
              valeur={enAttente}
              icone={<Clock size={18} />}
              variante="warning"
            />
            <CarteStat
              label="En cours"
              valeur={enCours}
              icone={<Truck size={18} />}
              variante="info"
            />
            <CarteStat
              label="Reçues"
              valeur={recues}
              icone={<PackageCheck size={18} />}
              variante="success"
            />
            <CarteStat
              label="Rejetées"
              valeur={rejetees}
              icone={<AlertTriangle size={18} />}
              variante="danger"
            />
          </div>

          {/* Bandeau infos */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <ClipboardList size={18} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Total demandes
                  </p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {total}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Urgences
                  </p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {critiques}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Taux de satisfaction
                  </p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {total > 0 ? Math.round((recues / total) * 100) : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Demandes récentes */}
          <Card className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <CardTitle>Demandes récentes</CardTitle>
                <CardDescription>
                  Les 5 dernières demandes enregistrées.
                </CardDescription>
              </div>
              <Button
                variante="ghost"
                taille="sm"
                onClick={() => navigate(ROUTES.DEMANDES)}
              >
                Voir tout <ArrowRight size={14} />
              </Button>
            </div>

            {recentes.length === 0 ? (
              <EmptyState
                icone={<ClipboardList size={22} />}
                titre="Aucune demande"
                description="Créez votre première demande de sang."
                action={
                  <CanDo action="demande.creer">
                    <Button
                      iconeGauche={<Plus size={16} />}
                      onClick={() => navigate(ROUTES.DEMANDES)}
                    >
                      Nouvelle demande
                    </Button>
                  </CanDo>
                }
              />
            ) : (
              <div>
                {recentes.map((d) => (
                  <LigneCompacte
                    key={d.id}
                    demande={d}
                    onVoir={() => navigate(ROUTES.DEMANDES)}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Répartition urgence */}
          {demandes.length > 0 && (
            <Card className="mt-6">
              <CardTitle>Répartition par urgence</CardTitle>
              <CardDescription className="mb-4">
                Niveau d'urgence de vos demandes.
              </CardDescription>
              <div className="space-y-3">
                {[
                  { niveau: 0, label: "Normale",  couleur: "bg-success-500" },
                  { niveau: 1, label: "Urgente",  couleur: "bg-warning-500" },
                  { niveau: 2, label: "Critique", couleur: "bg-danger-500" },
                ].map((n) => {
                  const nb = demandes.filter(
                    (d) => d.urgence === n.niveau
                  ).length;
                  const pct =
                    demandes.length > 0 ? (nb / demandes.length) * 100 : 0;
                  return (
                    <div key={n.niveau}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {n.label}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {nb} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                          className={`h-full rounded-full transition-all ${n.couleur}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </PageLayout>
  );
}