// ============================================================
// AIDORA — PRÉ-ÉVALUATION D'ÉLIGIBILITÉ AU DON (IA)
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  RefreshCw,
  Save,
  ShieldCheck,
  X,
  Clock,
  History,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { Input } from "../../../components/ui/Input";
import { EmptyState } from "../../../components/ui/EmptyState";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import {
  soumettreEvaluation,
  obtenirDerniereEvaluation,
  obtenirHistoriqueEvaluations,
} from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import {
  libelleResultat,
  varianteResultat,
  estValide,
  type EvaluationIA,
  type ReponsesQuestionnaire,
} from "../../../types/evaluationIa";

// ------------------------------------------------------------
// Questions médicales
// ------------------------------------------------------------
type CleBool =
  | "a_ete_malade_recemment"
  | "a_pris_antibiotiques"
  | "a_subi_chirurgie_recente"
  | "est_enceinte"
  | "a_transfusion_recente"
  | "a_hepatite_ou_vih"
  | "a_voyage_zone_risque"
  | "consomme_drogues"
  | "a_pris_medicament_regular"
  | "a_tatouage_recent";

interface Question {
  cle: CleBool;
  label: string;
  aide?: string;
  critique?: boolean;
}

const QUESTIONS: Question[] = [
  {
    cle: "a_ete_malade_recemment",
    label: "Avez-vous été malade ces 7 derniers jours ?",
    aide: "Rhume, grippe, fièvre...",
    critique: true,
  },
  {
    cle: "a_pris_antibiotiques",
    label: "Avez-vous pris des antibiotiques ces 7 derniers jours ?",
    critique: true,
  },
  {
    cle: "a_subi_chirurgie_recente",
    label: "Avez-vous subi une chirurgie ces 6 derniers mois ?",
    critique: true,
  },
  {
    cle: "est_enceinte",
    label: "Êtes-vous enceinte ou avez-vous accouché depuis moins de 6 mois ?",
    critique: true,
  },
  {
    cle: "a_transfusion_recente",
    label: "Avez-vous reçu une transfusion ces 12 derniers mois ?",
    critique: true,
  },
  {
    cle: "a_hepatite_ou_vih",
    label: "Avez-vous une hépatite B, C ou le VIH ?",
    critique: true,
  },
  {
    cle: "a_voyage_zone_risque",
    label: "Avez-vous voyagé dans une zone à risque (paludisme, etc.) ces 6 derniers mois ?",
    critique: true,
  },
  {
    cle: "consomme_drogues",
    label: "Consommez-vous des drogues injectables ?",
    critique: true,
  },
  {
    cle: "a_pris_medicament_regular",
    label: "Prenez-vous des médicaments régulièrement ?",
    aide: "Un avis médical sera demandé.",
  },
  {
    cle: "a_tatouage_recent",
    label: "Avez-vous fait un tatouage ou piercing récemment ?",
    aide: "Une vérification sera nécessaire.",
  },
];

// ============================================================
// PAGE
// ============================================================

export function PreEvaluationPage() {
  const { afficher } = useToast();
  const [vue, setVue] = useState<"derniere" | "questionnaire" | "historique">(
    "derniere"
  );

  const [derniere, setDerniere] = useState<EvaluationIA | null>(null);
  const [historique, setHistorique] = useState<EvaluationIA[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // Questionnaire
  const [etape, setEtape] = useState(0);
  const [poids, setPoids] = useState("");
  const [reponses, setReponses] = useState<Partial<Record<CleBool, boolean>>>({});
  const [envoi, setEnvoi] = useState(false);
  const [formErreur, setFormErreur] = useState("");

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [d, h] = await Promise.all([
        obtenirDerniereEvaluation(),
        obtenirHistoriqueEvaluations(),
      ]);
      setDerniere(d);
      setHistorique(h);
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
  function demarrerQuestionnaire() {
    setEtape(0);
    setPoids("");
    setReponses({});
    setFormErreur("");
    setVue("questionnaire");
  }

  function repondre(cle: CleBool, valeur: boolean) {
    setReponses((r) => ({ ...r, [cle]: valeur }));
    // Auto-avance après 200ms pour un côté fluide
    setTimeout(() => {
      if (etape < QUESTIONS.length) {
        setEtape((e) => e + 1);
      }
    }, 250);
  }

  function peutAvancer(): boolean {
    // Étape 0 = poids
    if (etape === 0) {
      return poids.trim() !== "" && Number(poids) >= 20 && Number(poids) <= 300;
    }
    // Autres étapes = questions
    const q = QUESTIONS[etape - 1];
    if (!q) return true;
    return reponses[q.cle] !== undefined;
  }

  async function soumettre() {
    setFormErreur("");

    // Vérifie que toutes les questions sont répondues
    const manquantes = QUESTIONS.filter((q) => reponses[q.cle] === undefined);
    if (manquantes.length > 0) {
      setFormErreur(
        `${manquantes.length} question(s) sans réponse. Revenez en arrière pour compléter.`
      );
      return;
    }

    setEnvoi(true);
    try {
      const payload: ReponsesQuestionnaire = {
        poids: Number(poids),
        a_ete_malade_recemment: reponses.a_ete_malade_recemment ?? false,
        a_pris_antibiotiques: reponses.a_pris_antibiotiques ?? false,
        a_subi_chirurgie_recente: reponses.a_subi_chirurgie_recente ?? false,
        est_enceinte: reponses.est_enceinte ?? false,
        a_transfusion_recente: reponses.a_transfusion_recente ?? false,
        a_hepatite_ou_vih: reponses.a_hepatite_ou_vih ?? false,
        a_voyage_zone_risque: reponses.a_voyage_zone_risque ?? false,
        consomme_drogues: reponses.consomme_drogues ?? false,
        a_pris_medicament_regular: reponses.a_pris_medicament_regular ?? false,
        a_tatouage_recent: reponses.a_tatouage_recent ?? false,
      };

      const resultat = await soumettreEvaluation(payload);
      setDerniere(resultat);
      afficher("Pré-évaluation effectuée", "success");
      await charger();
      setVue("derniere");
    } catch (err) {
      setFormErreur(extraireMessageErreur(err));
    } finally {
      setEnvoi(false);
    }
  }

  // ========================================================
  // RENDU
  // ========================================================

  const totalEtapes = QUESTIONS.length + 1; // +1 pour le poids

  return (
    <PageLayout
      titre="Pré-évaluation d'éligibilité"
      description="Vérifiez si vous pouvez donner votre sang en quelques questions."
      actions={
        vue === "derniere" ? (
          <>
            <Button
              variante="outline"
              iconeGauche={<History size={16} />}
              onClick={() => setVue("historique")}
              disabled={historique.length === 0}
            >
              Historique
            </Button>
            <Button iconeGauche={<Brain size={16} />} onClick={demarrerQuestionnaire}>
              Nouvelle évaluation
            </Button>
          </>
        ) : vue === "questionnaire" ? (
          <Button
            variante="outline"
            iconeGauche={<ChevronLeft size={16} />}
            onClick={() => setVue("derniere")}
          >
            Annuler
          </Button>
        ) : (
          <Button
            variante="outline"
            iconeGauche={<ChevronLeft size={16} />}
            onClick={() => setVue("derniere")}
          >
            Retour
          </Button>
        )
      }
    >
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les évaluations
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

      {/* ============ VUE : DERNIÈRE ============ */}
      {!chargement && vue === "derniere" && (
        <>
          {!derniere ? (
            <Card>
              <EmptyState
                icone={<Brain size={22} />}
                titre="Aucune évaluation"
                description="Répondez à un court questionnaire pour connaître votre éligibilité."
                action={
                  <Button iconeGauche={<Brain size={16} />} onClick={demarrerQuestionnaire}>
                    Commencer le test
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              {/* Bandeau info */}
              <Card className="mb-4 border-info-500/30 bg-info-50">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 text-info-600" size={20} />
                  <div className="text-sm text-info-700">
                    <p className="font-medium">Pré-évaluation automatique</p>
                    <p className="mt-0.5 text-info-700/80">
                      Ce résultat est une aide à la décision. La validation finale
                      est toujours effectuée par le personnel de santé de la banque.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Résultat */}
              <Card
                className={`mb-4 ${
                  derniere.resultat === "ELIGIBLE"
                    ? "border-success-500/30"
                    : derniere.resultat === "NON_ELIGIBLE"
                    ? "border-danger-500/30"
                    : "border-warning-500/30"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        derniere.resultat === "ELIGIBLE"
                          ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                          : derniere.resultat === "NON_ELIGIBLE"
                          ? "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400"
                          : "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
                      }`}
                    >
                      {derniere.resultat === "ELIGIBLE" ? (
                        <Check size={26} />
                      ) : derniere.resultat === "NON_ELIGIBLE" ? (
                        <X size={26} />
                      ) : (
                        <AlertTriangle size={26} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Résultat de la pré-évaluation
                      </p>
                      <p className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-white">
                        {libelleResultat(derniere.resultat)}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variante={varianteResultat(derniere.resultat)}>
                          {estValide(derniere) ? "Valide" : "Expirée"}
                        </Badge>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          <Clock size={11} className="mr-1 inline" />
                          {new Date(derniere.date_evaluation).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button iconeGauche={<RefreshCw size={16} />} onClick={demarrerQuestionnaire}>
                    Refaire le test
                  </Button>
                </div>

                {/* Analyse */}
                <div className="mt-5 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                  <p className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400">
                    Analyse
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                    {derniere.analyse}
                  </p>
                </div>
              </Card>

              {/* Recommandations */}
              {derniere.resultat === "ELIGIBLE" && (
                <Card className="border-success-500/30 bg-success-50">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 text-success-600" size={20} />
                    <div className="text-sm text-success-700">
                      <p className="font-medium">Prochaine étape</p>
                      <p className="mt-0.5">
                        Présentez-vous dans une banque de sang partenaire avec une
                        pièce d'identité. Un entretien médical final sera effectué.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* ============ VUE : QUESTIONNAIRE ============ */}
      {!chargement && vue === "questionnaire" && (
        <>
          {/* Barre de progression */}
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Question {etape + 1} sur {totalEtapes}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {Math.round(((etape) / totalEtapes) * 100)}%
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-300"
                style={{ width: `${((etape + 1) / totalEtapes) * 100}%` }}
              />
            </div>
          </Card>

          {/* Contenu */}
          <Card>
            {/* Étape 0 : Poids */}
            {etape === 0 && (
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <Heart size={20} />
                  </div>
                  <div>
                    <CardTitle>Quel est votre poids ?</CardTitle>
                    <CardDescription>
                      Le poids minimum requis est de 50 kg.
                    </CardDescription>
                  </div>
                </div>

                <FormField label="Poids (kg)" obligatoire>
                  <Input
                    type="number"
                    min={20}
                    max={300}
                    step={1}
                    placeholder="Ex : 70"
                    value={poids}
                    onChange={(e) => setPoids(e.target.value)}
                    autoFocus
                  />
                </FormField>
              </div>
            )}

            {/* Étapes questions */}
            {etape > 0 && etape <= QUESTIONS.length && (
              <QuestionView
                question={QUESTIONS[etape - 1]}
                valeur={reponses[QUESTIONS[etape - 1].cle]}
                onRepondre={(v) => repondre(QUESTIONS[etape - 1].cle, v)}
              />
            )}

            {/* Erreur */}
            <div className="mt-4">
              <FormError message={formErreur} />
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <Button
                variante="ghost"
                iconeGauche={<ChevronLeft size={16} />}
                onClick={() => setEtape((e) => Math.max(0, e - 1))}
                disabled={etape === 0}
              >
                Précédent
              </Button>

              {etape < totalEtapes - 1 ? (
                <Button
                  iconeDroite={<ChevronRight size={16} />}
                  onClick={() => setEtape((e) => e + 1)}
                  disabled={!peutAvancer()}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  iconeGauche={<Save size={16} />}
                  onClick={soumettre}
                  chargement={envoi}
                  disabled={!peutAvancer()}
                >
                  Voir mon résultat
                </Button>
              )}
            </div>
          </Card>
        </>
      )}

      {/* ============ VUE : HISTORIQUE ============ */}
      {!chargement && vue === "historique" && (
        <Card>
          <CardTitle>Historique de mes évaluations</CardTitle>
          <CardDescription className="mb-4">
            {historique.length} évaluation{historique.length > 1 ? "s" : ""} au total.
          </CardDescription>

          <div>
            {historique.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      e.resultat === "ELIGIBLE"
                        ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                        : e.resultat === "NON_ELIGIBLE"
                        ? "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400"
                        : "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
                    }`}
                  >
                    {e.resultat === "ELIGIBLE" ? (
                      <Check size={16} />
                    ) : e.resultat === "NON_ELIGIBLE" ? (
                      <X size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {libelleResultat(e.resultat)}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(e.date_evaluation).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <Badge variante={estValide(e) ? "success" : "neutral"}>
                  {estValide(e) ? "Valide" : "Expirée"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}

// ============================================================
// Sous-composant : question oui/non
// ============================================================
function QuestionView({
  question,
  valeur,
  onRepondre,
}: {
  question: Question;
  valeur?: boolean;
  onRepondre: (v: boolean) => void;
}) {
  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
          <Brain size={20} />
        </div>
        <div>
          <CardTitle className="leading-snug">{question.label}</CardTitle>
          {question.aide && (
            <CardDescription className="mt-1">{question.aide}</CardDescription>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onRepondre(false)}
          className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition ${
            valeur === false
              ? "border-success-500 bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-success-500 hover:bg-success-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          }`}
        >
          <Check size={18} />
          Non
        </button>

        <button
          type="button"
          onClick={() => onRepondre(true)}
          className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition ${
            valeur === true
              ? question.critique
                ? "border-danger-500 bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400"
                : "border-warning-500 bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-danger-500 hover:bg-danger-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          }`}
        >
          <X size={18} />
          Oui
        </button>
      </div>
    </div>
  );
}