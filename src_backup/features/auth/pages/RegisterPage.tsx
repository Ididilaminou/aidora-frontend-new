// ============================================================
// AIDORA — PAGE D'INSCRIPTION
// ============================================================

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowRight, Droplets } from "lucide-react";
import { register } from "../api";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import { ROUTES } from "../../../config/routes";

export function RegisterPage() {
  const navigate = useNavigate();
  const { connexion } = useAuth();
  const { afficher } = useToast();

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    motDePasse: "",
  });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const resultat = await register(form);
      connexion(resultat);
      afficher("Compte créé", "success", "Bienvenue sur Aidora !");
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const message = extraireMessageErreur(err);
      setErreur(message);
      afficher("Échec de l'inscription", "danger", message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg">
            <Droplets size={32} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Créer un compte</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
            Rejoignez la communauté Aidora
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-soft">
          <form onSubmit={soumettre} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Prénom" obligatoire>
                <Input
                  required
                  placeholder="Jean"
                  iconeGauche={<User size={16} />}
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </FormField>
              <FormField label="Nom" obligatoire>
                <Input
                  required
                  placeholder="Dupont"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Email" obligatoire>
              <Input
                type="email"
                required
                placeholder="exemple@email.com"
                iconeGauche={<Mail size={16} />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>

            <FormField label="Téléphone">
              <Input
                placeholder="+237 6XX XX XX XX"
                iconeGauche={<Phone size={16} />}
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
            </FormField>

            <FormField label="Mot de passe" obligatoire>
              <Input
                type="password"
                required
                placeholder="••••••••"
                iconeGauche={<Lock size={16} />}
                value={form.motDePasse}
                onChange={(e) =>
                  setForm({ ...form, motDePasse: e.target.value })
                }
              />
            </FormField>

            <FormError message={erreur} />

            <Button
              type="submit"
              chargement={chargement}
              iconeDroite={<ArrowRight size={16} />}
              className="w-full"
            >
              Créer mon compte
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
            Déjà inscrit ?{" "}
            <Link
              to={ROUTES.CONNEXION}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}