// ============================================================
// AIDORA — TABLEAU DE BORD DONNEUR
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  HeartHandshake, RefreshCw, AlertTriangle, Droplets, Calendar,
  Award, TrendingUp, Clock, CheckCircle2, XCircle, HelpCircle,
  ArrowRight, Brain, MapPin, Star, Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import api from "../../../services/api";
import { ROUTES } from "../../../config/routes";
import {
  obtenirMonProfil,
  obtenirMesDons,
} from "../../donneurs/api";
import { obtenirDerniereEvaluation } from "../../ia/api";
import {
  groupeAfficheDonneur,
  type ProfilDonneur,
} from "../../../types/donneur";
import {
  formatDateDon,
  formatTypeDon,
  varianteStatut,
  libelleStatut,
  type Don,
} from "../../../types/don";
import {
  libelleResultat,
  varianteResultat,
  estValide as evaluationValide,
  type EvaluationIA,
} from "../../../types/evaluationIa";

// ------------------------------------------------------------
// Règles d'éligibilité (délai entre dons)
// ------------------------------------------------------------
const DELAI_MIN_JOURS = 56; // 8 semaines

interface RdvSimple {
  id: number;
  date_rendez_vous: string;
  heure_rendez_vous: string;
  statut: string;
  etablissement_nom?: string;
}

// ------------------------------------------------------------
// Calcule les jours restants avant le prochain don
// ------------------------------------------------------------
function joursAvantProchainDon(dernierDon: string | null | undefined): number {
  if (!dernierDon) return 0;
  const dernier = new Date(dernierDon).getTime();
  const aujourdHui = Date.now();
  const diffJours = Math.floor((aujourdHui - dernier) / (24 * 3600 * 1000));
  return Math.max(0, DELAI_MIN_JOURS - diffJours);
}

// ------------------------------------------------------------
// Niveau de donneur selon le nombre de dons
// ------------------------------------------------------------
function niveauDonneur(total: number): {
  label: string;
  couleur: "neutral" | "warning" | "info" | "success";
  emoji: string;
} {
  if (total >= 10) return { label: "Or", couleur: "warning", emoji: "🥇" };
  if (total >= 5)  return { label: "Argent", couleur: "info", emoji: "🥈" };
  if (total >= 1)  return { label: "Bronze", couleur: "success", emoji: "🥉" };
  return { label: "Nouveau", couleur: "neutral", emoji: "🩸" };
}

// ============================================================
// PAGE
// ============================================================

export function DashboardDonneurPage() {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();

  const [profil, setProfil] = useState<ProfilDonneur | null>(null);
  const [dons, setDons] = useState<Don[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationIA | null>(null);
  const [rdvs, setRdvs] = useState<RdvSimple[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const p = await obtenirMonProfil();
      setProfil(p);

      // Dons
      try {
        setDons(await obtenirMesDons(p.id));
      } catch {
        setDons([]);
      }

      // Évaluation IA
      try {
        setEvaluation(await obtenirDerniereEvaluation());
      } catch {
        setEvaluation(null);
      }

      // RDV
      try {
        const repRdv = await api.get("/rdv/moi");
        const dataRdv = repRdv.data?.data ?? repRdv.data;
        setRdvs(Array.isArray(dataRdv) ? dataRdv : []);
      } catch {
        setRdvs([]);
      }
    } catch (err) {
      setErreur(extraireMessageErreur(err));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // --------------------------------------------------------
  // Statistiques personnelles
  // --------------------------------------------------------
  const donsValides = dons.filter((d) => d.statut === "VALIDE");
  const totalDons = donsValides.length;
  const volumeTotal = donsValides.reduce((s, d) => s + (d.quantite ?? 0), 0);
  const viesSauvees = totalDons * 3; // 1 don ≈ 3 vies sauvées (estimation standard)

  const dernierDon = donsValides.length > 0
    ? donsValides.reduce(
        (max, d) =>
          new Date(d.date_don) > new Date(max) ? d.date_don : max,
        donsValides[0].date_don
      )
    : null;

  const joursRestants = joursAvantProchainDon(dernierDon);
  const peutDonner = joursRestants === 0;
  const groupe = groupeAfficheDonneur(profil);
  const niveau = niveauDonneur(totalDons);

  // Prochain RDV à venir
  const prochainRdv = rdvs
    .filter((r) => r.statut === "PLANIFIE" || r.statut === "CONFIRME")
    .sort(
      (a, b) =>
        new Date(a.date_rendez_vous).getTime() -
        new Date(b.date_rendez_vous).getTime()
    )[0];

  return (
    <PageLayout
      titre={`Bonjour ${utilisateur?.prenom ?? ""} 👋`}
      description="Votre espace personnel de donneur."
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
              <p className="font-medium text-danger-700">Impossible de charger vos données</p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={charger}>Réessayer</Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (<Card><Loader texte="Chargement…" /></Card>)}

      {!chargement && !erreur && profil && (
        <>
          {/* ============ CARTE IDENTITÉ ============ */}
          <Card className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-500 text-2xl font-bold text-white shadow-md">
                  {groupe}
                </div>
                <div>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {profil.prenom} {profil.nom}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variante={niveau.couleur}>
                      {niveau.emoji} Niveau {niveau.label}
                    </Badge>
                    <Badge variante="neutral">
                      {totalDons} don{totalDons > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Prochain don possible */}
              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  peutDonner
                    ? "border-success-500/30 bg-success-50 dark:bg-success-500/10"
                    : "border-warning-500/30 bg-warning-50 dark:bg-warning-500/10"
                }`}
              >
                {peutDonner ? (
                  <CheckCircle2 className="text-success-600" size={26} />
                ) : (
                  <Clock className="text-warning-700" size={26} />
                )}
                <div>
                  <p className={`text-sm font-semibold ${
                    peutDonner ? "text-success-700" : "text-warning-700"
                  }`}>
                    {peutDonner ? "Vous pouvez donner !" : `Prochain don dans ${joursRestants}j`}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {peutDonner
                      ? "Prenez rendez-vous dès maintenant"
                      : `Délai de ${DELAI_MIN_JOURS} jours entre 2 dons`}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* ============ KPI PERSONNELS ============ */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CarteStat label="Total dons" valeur={totalDons}
              suffix="don" icone={<HeartHandshake size={18} />} variante="success" />
            <CarteStat label="Volume donné" valeur={volumeTotal}
              suffix="ml" icone={<Droplets size={18} />} variante="primary" />
            <CarteStat label="Vies sauvées" valeur={viesSauvees}
              suffix="estimées" icone={<Award size={18} />} variante="warning" />
            <CarteStat label="Niveau" valeur={niveau.label}
              suffix="" icone={<Star size={18} />} variante="info" />
          </div>

          {/* ============ ACTIONS RAPIDES ============ */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ActionRapide
              titre="Prendre un RDV"
              description="Choisissez une banque et un créneau"
              icone={<Calendar size={20} />}
              couleur="primary"
              onClick={() => navigate(ROUTES.DONNEUR_PRENDRE_RDV)}
            />
            <ActionRapide
              titre="Mon éligibilité"
              description="Refaire la pré-évaluation IA"
              icone={<Brain size={20} />}
              couleur="info"
              onClick={() => navigate(ROUTES.DONNEUR_EVALUATION)}
            />
            <ActionRapide
              titre="Mes rendez-vous"
              description="Voir et gérer mes RDV"
              icone={<Calendar size={20} />}
              couleur="success"
              onClick={() => navigate(ROUTES.DONNEUR_RDV)}
            />
            <ActionRapide
              titre="Mon profil"
              description="Compléter mes informations"
              icone={<MapPin size={20} />}
              couleur="warning"
              onClick={() => navigate(ROUTES.DONNEUR_PROFIL)}
            />
          </div>

          {/* ============ 2 COLONNES ============ */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* Derniers dons */}
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <CardTitle>Mes derniers dons</CardTitle>
                  <CardDescription>Votre historique récent.</CardDescription>
                </div>
                <Button variante="ghost" taille="sm"
                  onClick={() => navigate(ROUTES.DONNEUR_DONS)}>
                  Voir tout <ArrowRight size={14} />
                </Button>
              </div>

              {dons.length === 0 ? (
                <EmptyState
                  icone={<HeartHandshake size={22} />}
                  titre="Aucun don"
                  description="Votre premier don apparaîtra ici."
                />
              ) : (
                <div>
                  {dons.slice(0, 4).map((don) => (
                    <div key={don.id}
                      className="flex items-center justify-between border-b border-neutral-100 py-3 last:border-0 dark:border-neutral-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                          <Droplets size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {formatTypeDon(don.type_don)} · {don.quantite} ml
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatDateDon(don)}
                          </p>
                        </div>
                      </div>
                      <Badge variante={varianteStatut(don.statut)}>
                        {libelleStatut(don.statut)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Prochain RDV + Éligibilité */}
            <div className="space-y-4">
              {/* Prochain RDV */}
              <Card>
                <CardTitle>Prochain rendez-vous</CardTitle>
                <CardDescription className="mb-4">
                  Votre prochaine visite à la banque.
                </CardDescription>

                {prochainRdv ? (
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
                      <span className="text-[10px] font-medium uppercase">
                        {new Date(prochainRdv.date_rendez_vous).toLocaleDateString("fr-FR", { month: "short" })}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {new Date(prochainRdv.date_rendez_vous).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {new Date(prochainRdv.date_rendez_vous).toLocaleDateString("fr-FR", {
                          weekday: "long", day: "2-digit", month: "long",
                        })}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        <Clock size={11} className="mr-1 inline" />
                        {prochainRdv.heure_rendez_vous?.slice(0, 5)}
                        {prochainRdv.etablissement_nom && ` · ${prochainRdv.etablissement_nom}`}
                      </p>
                    </div>
                    <Badge variante={prochainRdv.statut === "CONFIRME" ? "success" : "info"}>
                      {prochainRdv.statut === "CONFIRME" ? "Confirmé" : "Planifié"}
                    </Badge>
                  </div>
                ) : (
                  <EmptyState
                    icone={<Calendar size={20} />}
                    titre="Aucun RDV à venir"
                    description="Prenez rendez-vous dans une banque."
                    action={
                      <Button taille="sm" iconeGauche={<Plus size={14} />}
                        onClick={() => navigate(ROUTES.DONNEUR_PRENDRE_RDV)}>
                        Prendre RDV
                      </Button>
                    }
                  />
                )}
              </Card>

              {/* Éligibilité IA */}
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <CardTitle>Mon éligibilité</CardTitle>
                    <CardDescription>Résultat de la pré-évaluation IA.</CardDescription>
                  </div>
                  <Button variante="ghost" taille="sm"
                    onClick={() => navigate(ROUTES.DONNEUR_EVALUATION)}>
                    Détails <ArrowRight size={14} />
                  </Button>
                </div>

                {evaluation && evaluationValide(evaluation) ? (
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      evaluation.resultat === "ELIGIBLE"
                        ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                        : evaluation.resultat === "NON_ELIGIBLE"
                        ? "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400"
                        : "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
                    }`}>
                      {evaluation.resultat === "ELIGIBLE" ? (
                        <CheckCircle2 size={18} />
                      ) : evaluation.resultat === "NON_ELIGIBLE" ? (
                        <XCircle size={18} />
                      ) : (
                        <HelpCircle size={18} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge variante={varianteResultat(evaluation.resultat)}>
                        {libelleResultat(evaluation.resultat)}
                      </Badge>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Évaluée le{" "}
                        {new Date(evaluation.date_evaluation).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icone={<Brain size={20} />}
                    titre="Pas d'évaluation récente"
                    description="Répondez au questionnaire pour connaître votre éligibilité."
                    action={
                      <Button taille="sm" iconeGauche={<Brain size={14} />}
                        onClick={() => navigate(ROUTES.DONNEUR_EVALUATION)}>
                        Faire le test
                      </Button>
                    }
                  />
                )}
              </Card>
            </div>
          </div>

          {/* ============ IMPACT PERSONNEL ============ */}
          <Card className="mt-6 border-success-500/30 bg-success-50 dark:bg-success-500/5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-500 text-white">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="font-semibold text-success-700 dark:text-success-400">
                  Votre impact en tant que donneur
                </p>
                <p className="mt-1 text-sm text-success-700/80 dark:text-success-400/80">
                  Grâce à vos {totalDons} don{totalDons > 1 ? "s" : ""}, vous avez
                  potentiellement sauvé <strong>{viesSauvees} vie{viesSauvees > 1 ? "s" : ""}</strong>.
                  Un don de sang peut sauver jusqu'à 3 personnes.
                </p>
                <p className="mt-2 text-xs italic text-success-700/70 dark:text-success-400/70">
                  « Chaque don compte. Merci pour votre engagement. »
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </PageLayout>
  );
}

// ------------------------------------------------------------
function CarteStat({
  label, valeur, suffix, icone, variante,
}: {
  label: string;
  valeur: number | string;
  suffix: string;
  icone: React.ReactNode;
  variante: "primary" | "success" | "warning" | "info";
}) {
  return (
    <Card hoverable>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            {valeur}
          </p>
          {suffix && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{suffix}</p>
          )}
        </div>
        <Badge variante={variante}>{icone}</Badge>
      </div>
    </Card>
  );
}

// ------------------------------------------------------------
function ActionRapide({
  titre, description, icone, couleur, onClick,
}: {
  titre: string;
  description: string;
  icone: React.ReactNode;
  couleur: "primary" | "success" | "warning" | "info";
  onClick: () => void;
}) {
  const couleurClass = {
    primary: "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
    success: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
    warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400",
    info: "bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400",
  }[couleur];

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-primary-500/30 hover:shadow-soft dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${couleurClass}`}>
        {icone}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600">
          {titre}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </div>
      <ArrowRight size={14} className="mt-1 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500" />
    </button>
  );
}