// ============================================================
// AIDORA — PAGE PARAMÈTRES
// ------------------------------------------------------------
// Sections : profil, sécurité, préférences, à propos.
// ============================================================

import { useState, type FormEvent } from "react";
import {
  User,
  Lock,
  Bell,
  Info,
  Save,
  Palette,
  Shield,
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

type Onglet = "profil" | "securite" | "preferences" | "apropos";

const ONGLETS: { id: Onglet; label: string; icone: typeof User }[] = [
  { id: "profil",      label: "Profil",       icone: User },
  { id: "securite",    label: "Sécurité",     icone: Lock },
  { id: "preferences", label: "Préférences",  icone: Bell },
  { id: "apropos",     label: "À propos",     icone: Info },
];

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
            {ONGLETS.map((o) => (
              <button
                key={o.id}
                onClick={() => setOnglet(o.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  onglet === o.id
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:text-white"
                }`}
              >
                <o.icone size={16} />
                {o.label}
              </button>
            ))}
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
// Profil
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
      // TODO: brancher sur PUT /api/personnels/moi ou /utilisateurs/moi
      await new Promise((r) => setTimeout(r, 600));
      afficher("Profil mis à jour", "success");
    } catch {
      afficher("Échec de la mise à jour", "danger");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-center gap-4">
          <Avatar
            taille="xl"
            prenom={utilisateur?.prenom}
            nom={utilisateur?.nom}
          />
          <div className="min-w-0">
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
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>

          <FormField label="Téléphone">
            <Input
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
// Sécurité
// ============================================================
function SectionSecurite({
  afficher,
}: {
  afficher: ReturnType<typeof useToast>["afficher"];
}) {
  const [form, setForm] = useState({ actuel: "", nouveau: "", confirme: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function changerMotDePasse(e: FormEvent) {
    e.preventDefault();
    setErreur("");

    if (form.nouveau.length < 8) {
      setErreur("Le nouveau mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (form.nouveau !== form.confirme) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    setChargement(true);
    try {
      // TODO: PUT /api/auth/mot-de-passe
      await new Promise((r) => setTimeout(r, 600));
      afficher("Mot de passe modifié", "success");
      setForm({ actuel: "", nouveau: "", confirme: "" });
    } catch {
      afficher("Échec", "danger");
    } finally {
      setChargement(false);
    }
  }

  return (
    <Card>
      <CardTitle>Changer le mot de passe</CardTitle>
      <CardDescription className="mb-4">
        Utilisez un mot de passe fort (8 caractères minimum).
      </CardDescription>

      <form onSubmit={changerMotDePasse} className="space-y-4">
        <FormField label="Mot de passe actuel" obligatoire>
          <Input
            type="password"
            iconeGauche={<Lock size={16} />}
            value={form.actuel}
            onChange={(e) => setForm({ ...form, actuel: e.target.value })}
            required
          />
        </FormField>

        <FormField label="Nouveau mot de passe" obligatoire>
          <Input
            type="password"
            iconeGauche={<Shield size={16} />}
            value={form.nouveau}
            onChange={(e) => setForm({ ...form, nouveau: e.target.value })}
            required
          />
        </FormField>

        <FormField label="Confirmer le nouveau mot de passe" obligatoire>
          <Input
            type="password"
            iconeGauche={<Shield size={16} />}
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
            Modifier
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ============================================================
// Préférences
// ============================================================
function SectionPreferences({
  afficher,
}: {
  afficher: ReturnType<typeof useToast>["afficher"];
}) {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    smsNotifications: false,
    alertesStock: true,
    alertesDemandes: true,
  });

  function toggle(cle: keyof typeof prefs) {
    setPrefs((p) => ({ ...p, [cle]: !p[cle] }));
    afficher("Préférence enregistrée", "success");
  }

  const items: { cle: keyof typeof prefs; label: string; desc: string }[] = [
    { cle: "emailNotifications", label: "Notifications par email", desc: "Recevoir un résumé quotidien" },
    { cle: "smsNotifications",   label: "Notifications par SMS",   desc: "Alertes urgentes uniquement" },
    { cle: "alertesStock",       label: "Alertes de stock",        desc: "Me prévenir quand un stock est bas" },
    { cle: "alertesDemandes",    label: "Alertes de demandes",     desc: "Me prévenir des nouvelles demandes" },
  ];

  return (
    <Card>
      <CardTitle>Préférences de notification</CardTitle>
      <CardDescription className="mb-4">
        Choisissez comment vous souhaitez être informé.
      </CardDescription>

      <div className="divide-y divide-neutral-100">
        {items.map((it) => (
          <div key={it.cle} className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {it.label}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{it.desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={prefs[it.cle]}
              onClick={() => toggle(it.cle)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                prefs[it.cle] ? "bg-primary-500" : "bg-neutral-200"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  prefs[it.cle] ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// À propos
// ============================================================
function SectionAPropos() {
  return (
    <Card>
      <CardTitle>À propos d'Aidora</CardTitle>
      <CardDescription className="mb-4">
        Plateforme de gestion du don de sang.
      </CardDescription>

      <div className="space-y-3 text-sm">
        <Ligne label="Application" valeur={APP.NOM} />
        <Ligne label="Version" valeur={APP.VERSION} />
        <Ligne label="Slogan" valeur={APP.SLOGAN} />
        <Ligne label="Environnement" valeur="Développement" />
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-lg bg-primary-50 p-3">
        <Palette size={16} className="text-primary-600" />
        <p className="text-xs text-primary-700">
          Pour changer la charte graphique de toute l'app, modifiez{" "}
          <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">
            src/styles/index.css
          </code>
          .
        </p>
      </div>
    </Card>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex justify-between border-b border-neutral-100 pb-2 last:border-0">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-900 dark:text-white">{valeur}</span>
    </div>
  );
}