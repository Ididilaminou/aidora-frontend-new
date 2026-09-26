// ============================================================
// AIDORA — ACTIVATION DU COMPTE DONNEUR
// Reçoit : /activation?code=AID-XXXXXX&email=...&tel=...
// Envoie : { identifiant, codeActivation } au backend
// ============================================================

import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Phone, Mail, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle,
  RefreshCw, KeyRound, Loader2,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import { Card } from "../../../components/ui/Card";
import { activerCompte, renvoyerCode } from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import { ROUTES } from "../../../config/routes";

const DELAI_RENVOI = 60;
const CODE_REGEX = /^AID-[A-Z0-9]{6}$/;

export function ActivationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { afficher } = useToast();

  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [modeEmail, setModeEmail] = useState(false);

  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [renvoiChargement, setRenvoiChargement] = useState(false);
  const [compteur, setCompteur] = useState(0);

  useEffect(() => {
    const tel = searchParams.get("tel");
    const mail = searchParams.get("email");
    const codeUrl = searchParams.get("code");

    if (mail) {
      setEmail(mail);
      setModeEmail(true);
    }
    if (tel) setTelephone(tel);
    if (codeUrl) setCode(codeUrl.toUpperCase());
  }, [searchParams]);

  useEffect(() => {
    if (compteur <= 0) return;
    const t = setTimeout(() => setCompteur((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [compteur]);

  // ----------------------------------------------------------
  // Récupère l'identifiant unique (email OU téléphone)
  // ----------------------------------------------------------
  function getIdentifiant(): string {
    return modeEmail ? email.trim().toLowerCase() : telephone.trim();
  }

  // ----------------------------------------------------------
  // Activation
  // ----------------------------------------------------------
  async function activer(e: FormEvent) {
    e.preventDefault();
    setErreur("");

    const codeNettoye = code.trim().toUpperCase();
    if (!CODE_REGEX.test(codeNettoye)) {
      setErreur("Le code doit respecter le format AID-XXXXXX (ex. AID-K9P2X7).");
      return;
    }

    const identifiant = getIdentifiant();

    if (!identifiant) {
      setErreur(modeEmail ? "L'email est obligatoire." : "Le téléphone est obligatoire.");
      return;
    }
    if (!modeEmail && identifiant.length < 8) {
      setErreur("Le numéro de téléphone est invalide.");
      return;
    }
    if (modeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifiant)) {
      setErreur("Le format de l'email est invalide.");
      return;
    }

    setChargement(true);
    try {
      // ✅ Envoie { identifiant, codeActivation } — aligné avec le backend
      await activerCompte({
        identifiant,
        codeActivation: codeNettoye,
      });

      setSucces(true);
      afficher("Compte activé", "success", "Vous pouvez maintenant vous connecter.");
    } catch (err) {
      const msg = extraireMessageErreur(err);
      setErreur(msg);
      afficher("Échec de l'activation", "danger", msg);
    } finally {
      setChargement(false);
    }
  }

  // ----------------------------------------------------------
  // Renvoi du code
  // ----------------------------------------------------------
  async function handleRenvoyer() {
    if (compteur > 0) return;

    const identifiant = getIdentifiant();
    if (!identifiant) {
      afficher("Champ manquant", "warning", "Renseignez votre email ou téléphone.");
      return;
    }

    setRenvoiChargement(true);
    try {
      // ✅ Envoie { identifiant } — aligné avec le backend
      await renvoyerCode({ identifiant });
      afficher("Code renvoyé", "success", "Vérifiez vos SMS / email.");
      setCompteur(DELAI_RENVOI);
    } catch (err) {
      afficher("Échec", "danger", extraireMessageErreur(err));
    } finally {
      setRenvoiChargement(false);
    }
  }

  // ----------------------------------------------------------
  // Écran de succès
  // ----------------------------------------------------------
  if (succes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
        <Card className="w-full max-w-md" padding="lg">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">
              Compte activé !
            </h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Bienvenue sur Aidora. Connectez-vous avec votre mot de passe.
            </p>
            <Button
              iconeDroite={<ArrowRight size={16} />}
              onClick={() => navigate(ROUTES.CONNEXION)}
              className="mt-6 w-full"
            >
              Se connecter
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Activer mon compte
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Saisissez le code reçu par SMS ou email (valable 15 minutes)
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={activer} className="flex flex-col gap-4">
            {/* Bascule Email / Téléphone */}
            <div className="flex gap-2 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => setModeEmail(false)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  !modeEmail
                    ? "bg-white text-primary-600 shadow-sm dark:bg-neutral-900 dark:text-primary-400"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                <Phone size={14} /> Téléphone
              </button>
              <button
                type="button"
                onClick={() => setModeEmail(true)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  modeEmail
                    ? "bg-white text-primary-600 shadow-sm dark:bg-neutral-900 dark:text-primary-400"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                <Mail size={14} /> Email
              </button>
            </div>

            {modeEmail ? (
              <FormField label="Email" obligatoire aide="L'email utilisé à l'inscription">
                <Input
                  required
                  type="email"
                  placeholder="exemple@email.cm"
                  iconeGauche={<Mail size={16} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
            ) : (
              <FormField label="Téléphone" obligatoire aide="Le numéro utilisé à l'inscription">
                <Input
                  required
                  type="tel"
                  placeholder="+237 690 00 00 00"
                  iconeGauche={<Phone size={16} />}
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
              </FormField>
            )}

            <FormField
              label="Code d'activation"
              obligatoire
              aide="Format : AID-XXXXXX"
            >
              <Input
                required
                placeholder="AID-K9P2X7"
                iconeGauche={<KeyRound size={16} />}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono uppercase tracking-widest"
                maxLength={10}
              />
            </FormField>

            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 dark:bg-neutral-900">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Pas reçu de code ?
              </p>
              <button
                type="button"
                onClick={handleRenvoyer}
                disabled={compteur > 0 || renvoiChargement}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary-600 transition hover:bg-primary-50 disabled:opacity-50 dark:text-primary-400"
              >
                {renvoiChargement ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RefreshCw size={12} />
                )}
                {compteur > 0 ? `Renvoyer dans ${compteur}s` : "Renvoyer le code"}
              </button>
            </div>

            <FormError message={erreur} />

            <Button
              type="submit"
              chargement={chargement}
              iconeDroite={<ArrowRight size={16} />}
              className="w-full"
            >
              Activer mon compte
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Déjà activé ?{" "}
            <Link
              to={ROUTES.CONNEXION}
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Se connecter
            </Link>
          </p>
        </Card>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-info-500/30 bg-info-50 p-3 dark:bg-info-500/5">
          <AlertCircle
            className="mt-0.5 shrink-0 text-info-600 dark:text-info-400"
            size={16}
          />
          <p className="text-xs text-info-700 dark:text-info-400">
            Le code est valable <strong>15 minutes</strong>. S'il n'arrive pas, cliquez sur "Renvoyer le code".
          </p>
        </div>
      </div>
    </div>
  );
}

export default ActivationPage;