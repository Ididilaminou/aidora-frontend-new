// ============================================================
// AIDORA — PAGE DE CONNEXION
// ============================================================

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Droplets, ArrowRight } from "lucide-react";
import { login } from "../api";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import { ROUTES } from "../../../config/routes";
import { accueilPour, type Role } from "../../../config/roles";

export function LoginPage() {
  const navigate = useNavigate();
  const { connexion } = useAuth();
  const { afficher } = useToast();

  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const resultat = await login({ identifiant, motDePasse });
      connexion(resultat);
      afficher("Connexion réussie", "success", `Bienvenue ${resultat.user.prenom} !`);
      navigate(accueilPour(resultat.user.role as Role), { replace: true });
    } catch (err) {
      const message = extraireMessageErreur(err);
      setErreur(message);
      afficher("Échec de la connexion", "danger", message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg">
            <Droplets size={32} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Bienvenue sur Aidora
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Connectez-vous à votre espace
          </p>
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-soft">
          <form onSubmit={soumettre} className="flex flex-col gap-4">
            <FormField label="Courriel ou téléphone" obligatoire>
              <Input
                required
                autoComplete="username"
                placeholder="exemple@email.com"
                iconeGauche={<Mail size={16} />}
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
              />
            </FormField>

            <FormField label="Mot de passe" obligatoire>
              <Input
                required
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                iconeGauche={<Lock size={16} />}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
              />
            </FormField>

            <FormError message={erreur} />

            <Button
              type="submit"
              chargement={chargement}
              iconeDroite={<ArrowRight size={16} />}
              className="w-full"
            >
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Pas encore de compte ?{" "}
            <Link
              to={ROUTES.INSCRIPTION}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}