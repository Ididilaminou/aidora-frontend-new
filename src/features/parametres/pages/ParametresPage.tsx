// ============================================================
// AIDORA — PAGE PARAMÈTRES
// ------------------------------------------------------------
// Sections : profil, sécurité, préférences, à propos.
// ============================================================

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Bell,
  Info,
  Save,
  Shield,
  LogOut,
  Mail,
  Phone,
  Smartphone,
  Monitor,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { APP } from "../../../config/constants";
import { ROUTES } from "../../../config/routes";
import { extraireMessageErreur } from "../../../services/api";
import api from "../../../services/api";

type Onglet = "profil" | "securite" | "preferences" | "apropos";

const ONGLETS: { id: Onglet; label: string; icone: typeof User }[] = [
  { id: "profil",      label: "Profil",       icone: User },
  { id: "securite",    label: "Sécurité",     icone: Lock },
  { id: "preferences", label: "Préférences",  icone: Bell },
  { id: "apropos",     label: "À propos",     icone: Info },
];

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export function ParametresPage() {
  const { utilisateur } = useAuth();
  const { afficher } = useToast();
  const [onglet, setOnglet] = useState<Onglet>("profil");

  return (
    <PageLayout
      titre="Paramètres"
      description="Gérez votre compte et vos préférences."
    >
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        {/* -------- Onglets -------- */}
        <Card padding="sm" className="h-fit lg:sticky lg:top-24">
          <nav className="flex flex-col gap-1">
            {ONGLETS.map((o) => {
              const Icone = o.icone;
              const actif = onglet === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setOnglet(o.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    actif
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                  }`}
                >
                  <Icone size={16} />
                  {o.label}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* -------- Contenu -------- */}
        <div className="space-y-6">
          {onglet === "profil" && (
            <SectionProfil utilisateur={utilisateur} afficher={afficher} />
          )}
          {onglet === "securite" && (
            <SectionSecurite afficher={afficher} />
          )}
          {onglet === "preferences" && (
            <SectionPreferences afficher={afficher} />
          )}
          {onglet === "apropos" && <SectionAPropos />}
        </div>
      </div>
    </PageLayout>
  );
}

// ============================================================
// PROFIL
// ============================================================
function SectionProfil({
  utilisateur,
  afficher,
}: {
  utilisateur: ReturnType<typeof useAuth>["utilisateur"];
  afficher: ReturnType<typeof useToast>["afficher"];
}) {
  const [enregistrement, setEnregistrement] = useState(false);
  const [form, setForm] = useState({
    nom: utilisateur?.nom ?? "",
    prenom: utilisateur?.prenom ?? "",
    email: utilisateur?.email ?? "",
    telephone: utilisateur?.telephone ?? "",
  });

  async function sauvegarder(e: FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    try {
      // Route à adapter selon ton backend
      await api.put("/auth/profil", {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim() || undefined,
        telephone: form.telephone.trim() || undefined,
      });
      afficher("Profil mis à jour", "success");
    } catch (err) {
      afficher("Échec de la mise à jour", "danger", extraireMessageErreur(err));
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <>
      {/* Bandeau utilisateur */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar
            taille="xl"
            prenom={utilisateur?.prenom}
            nom={utilisateur?.nom}
          />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {utilisateur?.prenom} {utilisateur?.nom}
            </p>
            <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
              {utilisateur?.email}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge variante="primary">{utilisateur?.role}</Badge>
              <Badge variante="success">
                {utilisateur?.statut_compte ?? "ACTIF"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Formulaire */}
      <Card>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription className="mb-4">
          Ces informations sont visibles par votre établissement.
        </CardDescription>

        <form onSubmit={sauvegarder} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Prénom">
              <Input
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
            </FormField>
            <FormField label="Nom">
              <Input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Email">
            <Input
              type="email"
              iconeGauche={<Mail size={16} />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>

          <FormField label="Téléphone">
            <Input
              iconeGauche={<Phone size={16} />}
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end">
            <Button
              type="submit"
              iconeGauche={<Save size={16} />}
              chargement={enregistrement}
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}

// ============================================================
// SÉCURITÉ
// ============================================================
function SectionSecurite({
  afficher,
}: {
  afficher: ReturnType<typeof useToast>["afficher"];
}) {
  const navigate = useNavigate();
  const { deconnexion } = useAuth();
  const [form, setForm] = useState({ actuel: "", nouveau: "", confirme: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);

  async function changerMotDePasse(e: FormEvent) {
    e.preventDefault();
    setErreur("");

    if (form.actuel.length < 1) {
      setErreur("Saisissez votre mot de passe actuel.");
      return;
    }
    if (form.nouveau.length < 8) {
      setErreur("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!/[A-Za-z]/.test(form.nouveau)) {
      setErreur("Le nouveau mot de passe doit contenir au moins une lettre.");
      return;
    }
    if (!/\d/.test(form.nouveau)) {
      setErreur("Le nouveau mot de passe doit contenir au moins un chiffre.");
      return;
    }
    if (form.nouveau !== form.confirme) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setChargement(true);
    try {
      await api.put("/auth/mot-de-passe", {
        ancienMotDePasse: form.actuel,
        nouveauMotDePasse: form.nouveau,
      });
      afficher("Mot de passe modifié", "success", "Utilisez-le à votre prochaine connexion.");
      setForm({ actuel: "", nouveau: "", confirme: "" });
    } catch (err) {
      const msg = extraireMessageErreur(err);
      setErreur(msg);
      afficher("Échec", "danger", msg);
    } finally {
      setChargement(false);
    }
  }

  async function deconnecterPartout() {
    if (!confirm("Se déconnecter de tous les appareils ?")) return;
    setDeconnexionEnCours(true);
    try {
      // Optionnel : prévenir le backend pour invalider tous les tokens
      try {
        await api.post("/auth/logout-all");
      } catch {
        // Si la route n'existe pas, on continue quand même
      }
      deconnexion();
      navigate(ROUTES.CONNEXION);
    } catch {
      afficher("Action impossible", "danger");
    } finally {
      setDeconnexionEnCours(false);
    }
  }

  return (
    <>
      {/* Changement de mot de passe */}
      <Card>
        <CardTitle>Changer le mot de passe</CardTitle>
        <CardDescription className="mb-4">
          8 caractères minimum, dont au moins une lettre et un chiffre.
        </CardDescription>

        <form onSubmit={changerMotDePasse} className="space-y-4">
          <FormField label="Mot de passe actuel" obligatoire>
            <Input
              type="password"
              iconeGauche={<Lock size={16} />}
              placeholder="••••••••"
              value={form.actuel}
              onChange={(e) => setForm({ ...form, actuel: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Nouveau mot de passe" obligatoire>
            <Input
              type="password"
              iconeGauche={<Shield size={16} />}
              placeholder="••••••••"
              value={form.nouveau}
              onChange={(e) => setForm({ ...form, nouveau: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Confirmer le nouveau mot de passe" obligatoire>
            <Input
              type="password"
              iconeGauche={<Shield size={16} />}
              placeholder="••••••••"
              value={form.confirme}
              onChange={(e) => setForm({ ...form, confirme: e.target.value })}
              required
            />
          </FormField>

          <FormError message={erreur} />

          <div className="flex justify-end">
            <Button
              type="submit"
              iconeGauche={<Save size={16} />}
              chargement={chargement}
            >
              Modifier le mot de passe
            </Button>
          </div>
        </form>
      </Card>

      {/* Sessions actives */}
      <Card>
        <CardTitle>Sessions actives</CardTitle>
        <CardDescription className="mb-4">
          Vous êtes actuellement connecté sur ces appareils.
        </CardDescription>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-success-500/30 bg-success-50 p-3 dark:bg-success-500/5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-500/10 text-success-600 dark:text-success-400">
              <Monitor size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Cet appareil
                </p>
                <Badge variante="success">
                  <CheckCircle2 size={10} className="mr-1" />
                  Actif
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Navigateur web · Maintenant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              <Smartphone size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                Application mobile
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Bientôt disponible
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <Button
            variante="outline"
            iconeGauche={<LogOut size={16} />}
            onClick={deconnecterPartout}
            chargement={deconnexionEnCours}
            className="text-danger-600 hover:bg-danger-50 dark:text-danger-400"
          >
            Déconnecter tous les appareils
          </Button>
        </div>
      </Card>
    </>
  );
}

// ============================================================
// PRÉFÉRENCES
// ============================================================
const CLE_PREFS = "aidora-preferences";

function SectionPreferences({
  afficher,
}: {
  afficher: ReturnType<typeof useToast>["afficher"];
}) {
  const [prefs, setPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem(CLE_PREFS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      emailNotifications: true,
      smsNotifications: false,
      alertesStock: true,
      alertesDemandes: true,
      alertesRdv: true,
      resumeHebdo: false,
    };
  });

  // Persiste à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(CLE_PREFS, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs]);

  function toggle(cle: keyof typeof prefs) {
    setPrefs((p: typeof prefs) => ({ ...p, [cle]: !p[cle] }));
    afficher("Préférence enregistrée", "success");
  }

  const items: {
    cle: keyof typeof prefs;
    label: string;
    desc: string;
    icone: typeof Bell;
  }[] = [
    {
      cle: "emailNotifications",
      label: "Notifications par email",
      desc: "Recevoir un résumé par email",
      icone: Mail,
    },
    {
      cle: "smsNotifications",
      label: "Notifications par SMS",
      desc: "Alertes urgentes uniquement",
      icone: Smartphone,
    },
    {
      cle: "alertesStock",
      label: "Alertes de stock",
      desc: "Me prévenir quand un stock est bas",
      icone: AlertCircle,
    },
    {
      cle: "alertesDemandes",
      label: "Alertes de demandes",
      desc: "Me prévenir des nouvelles demandes",
      icone: Bell,
    },
    {
      cle: "alertesRdv",
      label: "Rappels de rendez-vous",
      desc: "Me rappeler mes RDV de don",
      icone: Calendar,
    },
    {
      cle: "resumeHebdo",
      label: "Résumé hebdomadaire",
      desc: "Un email chaque lundi matin",
      icone: Mail,
    },
  ];

  return (
    <Card>
      <CardTitle>Préférences de notification</CardTitle>
      <CardDescription className="mb-4">
        Choisissez comment vous souhaitez être informé. Ces préférences sont
        sauvegardées sur cet appareil.
      </CardDescription>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {items.map((it) => {
          const Icone = it.icone;
          return (
            <div
              key={it.cle}
              className="flex items-center justify-between py-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  <Icone size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {it.label}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {it.desc}
                  </p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={prefs[it.cle]}
                aria-label={it.label}
                onClick={() => toggle(it.cle)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  prefs[it.cle]
                    ? "bg-primary-500"
                    : "bg-neutral-200 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    prefs[it.cle] ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================
// À PROPOS
// ============================================================
function SectionAPropos() {
  return (
    <>
      <Card>
        <CardTitle>À propos d'Aidora</CardTitle>
        <CardDescription className="mb-4">
          Plateforme de gestion du don de sang au Cameroun.
        </CardDescription>

        <div className="space-y-3 text-sm">
          <Ligne label="Application"   valeur={APP.NOM} />
          <Ligne label="Version"       valeur={APP.VERSION} />
          <Ligne label="Slogan"        valeur={APP.SLOGAN} />
          <Ligne label="Environnement" valeur="Production" />
          <Ligne label="Support"       valeur="contact@aidora.cm" />
        </div>
      </Card>

      <Card>
        <CardTitle>Zone de danger</CardTitle>
        <CardDescription className="mb-4">
          Ces actions sont irréversibles.
        </CardDescription>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
              Supprimer mon compte
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Contactez le support à contact@aidora.cm pour cette action.
            </p>
          </div>
          <Button
            variante="outline"
            iconeGauche={<Trash2 size={16} />}
            disabled
            className="text-danger-600"
          >
            Bientôt disponible
          </Button>
        </div>
      </Card>
    </>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex justify-between border-b border-neutral-100 pb-2 last:border-0 dark:border-neutral-800">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-900 dark:text-white">
        {valeur}
      </span>
    </div>
  );
}