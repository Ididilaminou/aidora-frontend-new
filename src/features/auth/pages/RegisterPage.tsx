// ============================================================
// AIDORA — INSCRIPTION DONNEUR (Cameroun)
// ============================================================

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart, Mail, Lock, User, Phone, MapPin, ArrowRight,
  CheckCircle2, AlertCircle, Navigation, Loader2, Droplets,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import { Card } from "../../../components/ui/Card";
import { register } from "../api";
import { reverseGeocode } from "../../donneurs/api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import { ROUTES } from "../../../config/routes";

const EXEMPLES_PRENOMS = [
  "Marie", "Aïcha", "Fadimatou", "Émilienne", "Nadège",
  "Ibrahim", "Oumarou", "Jean-Pierre", "Bouba", "Céline",
  "Salamatou", "Hawaou", "Rachidatou", "Yaya", "Moussa",
];

const EXEMPLES_NOMS = [
  "Ngo Bakang", "Tchoumi", "Mbarga", "Fotso", "Njoya",
  "Bello", "Oumarou", "Hamadou", "Djibrilla", "Aboubakar",
  "Ndam Njoya", "Ekambi", "Mefire", "Kouam", "Sadou",
];

function placeholderPrenom() {
  return EXEMPLES_PRENOMS[Math.floor(Math.random() * EXEMPLES_PRENOMS.length)];
}

function placeholderNom() {
  return EXEMPLES_NOMS[Math.floor(Math.random() * EXEMPLES_NOMS.length)];
}

const GROUPES = [
  { value: "O", label: "O" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "AB", label: "AB" },
];

const RHESUS = [
  { value: "POSITIF", label: "+ (Positif)" },
  { value: "NEGATIF", label: "- (Négatif)" },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { afficher } = useToast();

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    telephone: "+237 ",
    email: "",
    motDePasse: "",
    confirme: "",
    ville: "",
    quartier: "",
    adresse: "",
    latitude: null as number | null,
    longitude: null as number | null,
    groupeSanguin: "",
    rhesus: "",
  });

  const [placeholders] = useState({
    prenom: placeholderPrenom(),
    nom: placeholderNom(),
  });

  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);

  const [geoChargement, setGeoChargement] = useState(false);
  const [geoSucces, setGeoSucces] = useState(false);

  async function utiliserMaPosition() {
    if (!navigator.geolocation) {
      afficher("Géolocalisation non supportée", "danger");
      return;
    }

    setGeoChargement(true);
    setGeoSucces(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setForm((f) => ({ ...f, latitude, longitude }));

        const adresse = await reverseGeocode(latitude, longitude);

        setForm((f) => ({
          ...f,
          latitude,
          longitude,
          ville: adresse.ville ?? f.ville,
          quartier: adresse.quartier ?? f.quartier,
          adresse: adresse.adresse ?? f.adresse,
        }));

        setGeoChargement(false);
        setGeoSucces(true);

        if (adresse.ville) {
          afficher(
            "Position détectée",
            "success",
            `${adresse.quartier ? adresse.quartier + ", " : ""}${adresse.ville}`
          );
        } else {
          afficher("Position enregistrée", "success");
        }
      },
      (err) => {
        setGeoChargement(false);
        let msg = "Impossible de vous localiser.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Géolocalisation refusée. Remplissez manuellement.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Délai dépassé. Réessayez ou remplissez manuellement.";
        }
        afficher("Géolocalisation", "warning", msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreur("");

    if (!form.prenom.trim() || !form.nom.trim()) {
      setErreur("Le prénom et le nom sont obligatoires.");
      return;
    }
    if (!form.telephone.trim() || form.telephone.trim().length < 8) {
      setErreur("Le numéro de téléphone est invalide.");
      return;
    }
    if (!form.groupeSanguin) {
      setErreur("Veuillez sélectionner votre groupe sanguin.");
      return;
    }
    if (!form.rhesus) {
      setErreur("Veuillez sélectionner votre rhésus.");
      return;
    }
    // Aligné backend : min 8 + lettre + chiffre
    if (form.motDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!/[a-zA-Z]/.test(form.motDePasse)) {
      setErreur("Le mot de passe doit contenir au moins une lettre.");
      return;
    }
    if (!/\d/.test(form.motDePasse)) {
      setErreur("Le mot de passe doit contenir au moins un chiffre.");
      return;
    }
    if (form.motDePasse !== form.confirme) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    setChargement(true);
    try {
      await register({
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim() || undefined,
        motDePasse: form.motDePasse,
        ville: form.ville.trim() || undefined,
        quartier: form.quartier.trim() || undefined,
        adresse: form.adresse.trim() || undefined,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
        groupeSanguin: form.groupeSanguin,
        rhesus: form.rhesus,
      });

      setSucces(true);
      afficher(
        "Compte créé",
        "success",
        "Un code d'activation (valable 15 min) vous a été envoyé."
      );
    } catch (err) {
      const msg = extraireMessageErreur(err);
      setErreur(msg);
      afficher("Échec de l'inscription", "danger", msg);
    } finally {
      setChargement(false);
    }
  }

  if (succes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
        <Card className="w-full max-w-md" padding="lg">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">
              Inscription réussie !
            </h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Un code d'activation (valable <strong>15 minutes</strong>) a été envoyé au{" "}
              <strong className="text-neutral-700 dark:text-neutral-300">
                {form.telephone}
              </strong>
              {form.email && (
                <>
                  {" "}et à{" "}
                  <strong className="text-neutral-700 dark:text-neutral-300">
                    {form.email}
                  </strong>
                </>
              )}
              .
            </p>

            <div className="mt-6 w-full">
              <div className="flex w-full flex-col gap-2">
                <Button
                  iconeDroite={<ArrowRight size={16} />}
                  onClick={() =>
                    navigate(
                      `${ROUTES.ACTIVATION}?tel=${encodeURIComponent(form.telephone)}`
                    )
                  }
                  className="w-full"
                >
                  Activer mon compte
                </Button>
                <Button
                  variante="ghost"
                  onClick={() => navigate(ROUTES.CONNEXION)}
                  className="w-full"
                >
                  Aller à la connexion
                </Button>
              </div>
            </div>
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
            <Heart size={32} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Rejoignez Aidora
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Créez votre compte donneur en quelques secondes
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={soumettre} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Prénom" obligatoire>
                <Input
                  required
                  placeholder={placeholders.prenom}
                  iconeGauche={<User size={16} />}
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </FormField>
              <FormField label="Nom" obligatoire>
                <Input
                  required
                  placeholder={placeholders.nom}
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </FormField>
            </div>

            <div className="rounded-xl border-2 border-primary-500/20 bg-primary-50/50 p-4 dark:border-primary-500/20 dark:bg-primary-500/5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
                  <Droplets size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Votre groupe sanguin
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Obligatoire pour être donneur
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Groupe" obligatoire>
                  <Select
                    value={form.groupeSanguin}
                    onChange={(e) =>
                      setForm({ ...form, groupeSanguin: e.target.value })
                    }
                    placeholder="Choisir…"
                    options={GROUPES}
                  />
                </FormField>
                <FormField label="Rhésus" obligatoire>
                  <Select
                    value={form.rhesus}
                    onChange={(e) =>
                      setForm({ ...form, rhesus: e.target.value })
                    }
                    placeholder="Choisir…"
                    options={RHESUS}
                  />
                </FormField>
              </div>
            </div>

            <FormField
              label="Téléphone"
              obligatoire
              aide="Format : +237 6XX XX XX XX"
            >
              <Input
                required
                type="tel"
                placeholder="+237 690 00 00 00"
                iconeGauche={<Phone size={16} />}
                value={form.telephone}
                onChange={(e) =>
                  setForm({ ...form, telephone: e.target.value })
                }
              />
            </FormField>

            <FormField
              label="Email"
              aide="Optionnel — pour recevoir le code d'activation"
            >
              <Input
                type="email"
                placeholder="exemple@email.cm"
                iconeGauche={<Mail size={16} />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>

            <div className="rounded-xl border-2 border-primary-500/20 bg-primary-50/50 p-4 dark:border-primary-500/20 dark:bg-primary-500/5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white">
                  <Navigation size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Détecter ma position
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                    Remplit automatiquement votre ville et quartier.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variante={geoSucces ? "outline" : "primary"}
                taille="sm"
                iconeGauche={
                  geoChargement ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : geoSucces ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Navigation size={14} />
                  )
                }
                onClick={utiliserMaPosition}
                disabled={geoChargement}
                className="mt-3 w-full justify-center"
              >
                {geoChargement
                  ? "Localisation en cours…"
                  : geoSucces
                  ? "Position détectée ✓"
                  : "Utiliser ma position actuelle"}
              </Button>

              {form.latitude != null && form.longitude != null && (
                <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
                  📍 {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Ville"
                obligatoire
                aide={geoSucces ? "Rempli automatiquement" : undefined}
              >
                <Input
                  required
                  placeholder="Ex : Yaoundé"
                  iconeGauche={<MapPin size={16} />}
                  value={form.ville}
                  onChange={(e) =>
                    setForm({ ...form, ville: e.target.value })
                  }
                />
              </FormField>
              <FormField
                label="Quartier"
                aide={geoSucces ? "Rempli automatiquement" : undefined}
              >
                <Input
                  placeholder="Ex : Bastos"
                  iconeGauche={<MapPin size={16} />}
                  value={form.quartier}
                  onChange={(e) =>
                    setForm({ ...form, quartier: e.target.value })
                  }
                />
              </FormField>
            </div>

            <FormField label="Adresse détaillée" aide="Optionnel">
              <Input
                placeholder="Ex : Rue 1.234, Immeuble ABC"
                iconeGauche={<MapPin size={16} />}
                value={form.adresse}
                onChange={(e) =>
                  setForm({ ...form, adresse: e.target.value })
                }
              />
            </FormField>

            <FormField
              label="Mot de passe"
              obligatoire
              aide="Au moins 8 caractères, une lettre et un chiffre"
            >
              <Input
                required
                type="password"
                placeholder="••••••••"
                iconeGauche={<Lock size={16} />}
                value={form.motDePasse}
                onChange={(e) =>
                  setForm({ ...form, motDePasse: e.target.value })
                }
              />
            </FormField>

            <FormField label="Confirmer le mot de passe" obligatoire>
              <Input
                required
                type="password"
                placeholder="••••••••"
                iconeGauche={<Lock size={16} />}
                value={form.confirme}
                onChange={(e) =>
                  setForm({ ...form, confirme: e.target.value })
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

          <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Déjà inscrit ?{" "}
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
            Après inscription, vous recevrez un{" "}
            <strong>code d'activation</strong> (valable 15 minutes) par SMS
            ou email. Utilisez-le pour activer votre compte.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
