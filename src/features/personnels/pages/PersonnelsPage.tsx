// ============================================================
// AIDORA — PAGE UTILISATEURS (PERSONNELS)
// ------------------------------------------------------------
// • L'admin crée les comptes personnel
// • Le backend génère un mot de passe temporaire et le
//   renvoie UNE SEULE FOIS → on l'affiche dans une modale
// ============================================================

import { useEffect, useState, type FormEvent } from "react";
import {
  Users, RefreshCw, AlertTriangle, UserCheck, UserX,
  Mail, Phone, Building2, Plus, Save, Search, Check,
  KeyRound, Copy,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Avatar } from "../../../components/ui/Avatar";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import { CanDo } from "../../../components/auth/CanDo";
import { usePersonnels } from "../hooks/usePersonnels";
import {
  activerPersonnel,
  desactiverPersonnel,
  creerPersonnel,
} from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import api from "../../../services/api";
import {
  nomCompletPersonnel, libelleRole, varianteRole,
  libelleStatutCompte, varianteStatutCompte,
  type Personnel,
} from "../../../types/personnel";

// ------------------------------------------------------------
interface EtablissementSimple {
  id: number;
  nom: string;
  type: "BANQUE_DE_SANG" | "HOPITAL";
  possede_banque_de_sang?: number | boolean;
}

function estHopitalAvecBanque(e?: EtablissementSimple): boolean {
  if (!e || e.type !== "HOPITAL") return false;
  if (typeof e.possede_banque_de_sang === "boolean") {
    return e.possede_banque_de_sang;
  }
  return e.possede_banque_de_sang === 1;
}

// ------------------------------------------------------------
// Ligne d'un personnel
// ------------------------------------------------------------
function LignePersonnel({
  p, onAction, enCours,
}: {
  p: Personnel;
  onAction: (id: number, action: "activer" | "desactiver") => void;
  enCours: boolean;
}) {
  const nom = nomCompletPersonnel(p);
  const [prenom, ...reste] = nom.split(" ");

  return (
    <div className="flex flex-col gap-4 border-b border-neutral-100 py-4 last:border-0 lg:flex-row lg:items-center lg:justify-between dark:border-neutral-800">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar taille="md" prenom={prenom} nom={reste.join(" ")} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
            {nom}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <Mail size={11} />
              {p.email}
            </span>
            {p.telephone && (
              <span className="inline-flex items-center gap-1">
                <Phone size={11} />
                {p.telephone}
              </span>
            )}
            {p.etablissement_nom && (
              <span className="inline-flex items-center gap-1">
                <Building2 size={11} />
                {p.etablissement_nom}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Badge variante={varianteRole(p.role)}>{libelleRole(p.role)}</Badge>
        <Badge variante={varianteStatutCompte(p.statut_compte)}>
          {libelleStatutCompte(p.statut_compte)}
        </Badge>

        <CanDo action="utilisateur.activer">
          {p.statut_compte === "ACTIF" ? (
            <Button
              taille="sm"
              variante="ghost"
              iconeGauche={<UserX size={14} />}
              onClick={() => onAction(p.id, "desactiver")}
              disabled={enCours}
            >
              Désactiver
            </Button>
          ) : (
            <Button
              taille="sm"
              variante="outline"
              iconeGauche={<UserCheck size={14} />}
              onClick={() => onAction(p.id, "activer")}
              disabled={enCours}
            >
              Activer
            </Button>
          )}
        </CanDo>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export function PersonnelsPage() {
  const { personnels, total, chargement, erreur, recharger } = usePersonnels();
  const { afficher } = useToast();
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);
  const [recherche, setRecherche] = useState("");

  // --- Modale création ---
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [etablissements, setEtablissements] = useState<EtablissementSimple[]>([]);
  const [chargementEtabs, setChargementEtabs] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "+237 ",
    role: "PERSONNEL_BANQUE" as
      | "PERSONNEL_BANQUE"
      | "PERSONNEL_HOPITAL"
      | "ADMINISTRATEUR",
    fonction: "",
    etablissement_id: "",
  });

  // --- Modale affichage mot de passe temporaire ---
  const [identifiants, setIdentifiants] = useState<{
    email: string;
    motDePasse: string;
    nom: string;
  } | null>(null);
  const [copie, setCopie] = useState(false);

  // --------------------------------------------------------
  // Charge les établissements à l'ouverture de la modale
  // --------------------------------------------------------
  useEffect(() => {
    if (!modaleOuverte) return;
    (async () => {
      setChargementEtabs(true);
      try {
        const rep = await api.get("/etablissements");
        const data = rep.data?.data ?? rep.data;
        const liste: EtablissementSimple[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.etablissements)
          ? data.etablissements
          : [];
        setEtablissements(liste);
      } catch {
        setEtablissements([]);
      } finally {
        setChargementEtabs(false);
      }
    })();
  }, [modaleOuverte]);

  function ouvrirCreation() {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      telephone: "+237 ",
      role: "PERSONNEL_BANQUE",
      fonction: "",
      etablissement_id: "",
    });
    setFormErreur("");
    setModaleOuverte(true);
  }

  // --------------------------------------------------------
  // Création du personnel
  // --------------------------------------------------------
  async function validerCreation(e: FormEvent) {
    e.preventDefault();
    setFormErreur("");

    // Validations
    if (!form.nom.trim() || !form.prenom.trim()) {
      setFormErreur("Le nom et le prénom sont obligatoires.");
      return;
    }
    if (!form.email.trim()) {
      setFormErreur("L'email est obligatoire.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormErreur("Format d'email invalide (ex : nom@aidora.cm).");
      return;
    }
    if (form.telephone.trim().length < 8) {
      setFormErreur("Le téléphone est invalide.");
      return;
    }
    if (form.role !== "ADMINISTRATEUR" && !form.etablissement_id) {
      setFormErreur("Sélectionnez un établissement.");
      return;
    }

    setEnregistrement(true);
    try {
      // ⚠️ Le backend génère lui-même le mot de passe
      const reponse: any = await creerPersonnel({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        courriel: form.email.trim(),
        telephone: form.telephone.trim(),
        role: form.role,
        fonction: form.fonction.trim() || undefined,
        etablissement_id:
          form.role === "ADMINISTRATEUR"
            ? undefined
            : Number(form.etablissement_id),
      });

      // Le backend renvoie { utilisateur, motDePasseTemporaire }
      const motDePasse: string | undefined =
        reponse?.motDePasseTemporaire ??
        reponse?.data?.motDePasseTemporaire;

      if (motDePasse) {
        setIdentifiants({
          email: form.email.trim(),
          motDePasse,
          nom: `${form.prenom} ${form.nom}`,
        });
        setCopie(false);
      }

      afficher("Personnel créé", "success");
      setModaleOuverte(false);
      await recharger();
    } catch (err) {
      setFormErreur(extraireMessageErreur(err));
    } finally {
      setEnregistrement(false);
    }
  }

  // --------------------------------------------------------
  async function gererAction(id: number, action: "activer" | "desactiver") {
    setActionEnCours(id);
    try {
      if (action === "activer") {
        await activerPersonnel(id);
        afficher("Compte activé", "success");
      } else {
        await desactiverPersonnel(id);
        afficher("Compte désactivé", "warning");
      }
      await recharger();
    } catch (err) {
      afficher("Action échouée", "danger", extraireMessageErreur(err));
    } finally {
      setActionEnCours(null);
    }
  }

  // --------------------------------------------------------
  // Copier les identifiants
  // --------------------------------------------------------
  async function copierIdentifiants() {
    if (!identifiants) return;
    const texte = `Aidora — Vos identifiants\nEmail : ${identifiants.email}\nMot de passe temporaire : ${identifiants.motDePasse}\n\nConnectez-vous sur : http://localhost:5173/connexion`;
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      afficher("Identifiants copiés", "success");
      setTimeout(() => setCopie(false), 2500);
    } catch {
      afficher("Impossible de copier", "danger");
    }
  }

  const filtres = personnels.filter((p) => {
    if (!recherche) return true;
    const q = recherche.toLowerCase();
    return (
      p.nom?.toLowerCase().includes(q) ||
      p.prenom?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.etablissement_nom?.toLowerCase().includes(q)
    );
  });

  const actifs = personnels.filter((p) => p.statut_compte === "ACTIF").length;
  const inactifs = personnels.filter((p) => p.statut_compte === "INACTIF").length;
  const admins = personnels.filter((p) => p.role === "ADMINISTRATEUR").length;

  // --------------------------------------------------------
  // Établissements filtrés selon le rôle choisi
  // --------------------------------------------------------
  const etablissementsFiltres = etablissements.filter((e) => {
    if (form.role === "PERSONNEL_BANQUE") {
      if (e.type === "BANQUE_DE_SANG") return true;
      return estHopitalAvecBanque(e);
    }
    if (form.role === "PERSONNEL_HOPITAL") return e.type === "HOPITAL";
    return false;
  });

  const etabSelectionne = etablissementsFiltres.find(
    (e) => String(e.id) === form.etablissement_id
  );
  const selectionEstHopitalAvecBanque = estHopitalAvecBanque(etabSelectionne);

  return (
    <PageLayout
      titre="Utilisateurs"
      description={`${total} compte${total > 1 ? "s" : ""} personnel.`}
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
          <CanDo action="utilisateur.creer">
            <Button iconeGauche={<Plus size={16} />} onClick={ouvrirCreation}>
              Nouveau personnel
            </Button>
          </CanDo>
        </>
      }
    >
      {!chargement && !erreur && personnels.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{total}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Actifs</p>
            <p className="mt-1 text-2xl font-bold text-success-700">{actifs}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Inactifs</p>
            <p className="mt-1 text-2xl font-bold text-neutral-500">{inactifs}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Admins</p>
            <p className="mt-1 text-2xl font-bold text-warning-700">{admins}</p>
          </Card>
        </div>
      )}

      {!chargement && !erreur && personnels.length > 0 && (
        <div className="mb-4">
          <Input
            placeholder="Rechercher par nom, email ou établissement…"
            iconeGauche={<Search size={16} />}
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>
      )}

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les utilisateurs
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={recharger}>
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (
        <Card><Loader texte="Chargement des utilisateurs…" /></Card>
      )}

      {!chargement && !erreur && personnels.length === 0 && (
        <Card>
          <EmptyState
            icone={<Users size={22} />}
            titre="Aucun utilisateur"
            description="Créez le premier compte personnel."
            action={
              <CanDo action="utilisateur.creer">
                <Button iconeGauche={<Plus size={16} />} onClick={ouvrirCreation}>
                  Nouveau personnel
                </Button>
              </CanDo>
            }
          />
        </Card>
      )}

      {!chargement && !erreur && filtres.length > 0 && (
        <Card>
          <div>
            {filtres.map((p) => (
              <LignePersonnel
                key={p.id}
                p={p}
                onAction={gererAction}
                enCours={actionEnCours === p.id}
              />
            ))}
          </div>
        </Card>
      )}

      {/* ============ MODALE CRÉATION ============ */}
      <Modal
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
        titre="Nouveau personnel"
        description="Créez un compte pour un membre du personnel."
        taille="lg"
        footer={
          <>
            <Button variante="ghost" onClick={() => setModaleOuverte(false)}>
              Annuler
            </Button>
            <Button
              iconeGauche={<Save size={16} />}
              chargement={enregistrement}
              type="submit"
              form="form-personnel"
            >
              Créer le compte
            </Button>
          </>
        }
      >
        <form id="form-personnel" onSubmit={validerCreation} className="space-y-4">
          {/* Identité */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Prénom" obligatoire>
              <Input
                required
                placeholder="Ex : Marie"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
            </FormField>
            <FormField label="Nom" obligatoire>
              <Input
                required
                placeholder="Ex : Ngo"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </FormField>
          </div>

          {/* Contact */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Email" obligatoire>
              <Input
                required
                type="email"
                placeholder="exemple@aidora.cm"
                iconeGauche={<Mail size={16} />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField label="Téléphone" obligatoire>
              <Input
                required
                type="tel"
                placeholder="+237 6XX XX XX XX"
                iconeGauche={<Phone size={16} />}
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
            </FormField>
          </div>

          {/* Rôle + Fonction */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Rôle" obligatoire>
              <Select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as typeof form.role,
                    etablissement_id: "",
                  })
                }
                options={[
                  { value: "PERSONNEL_BANQUE",  label: "Personnel banque" },
                  { value: "PERSONNEL_HOPITAL", label: "Personnel hôpital" },
                  { value: "ADMINISTRATEUR",    label: "Administrateur" },
                ]}
              />
            </FormField>
            <FormField label="Fonction" aide="Ex : Responsable des stocks">
              <Input
                placeholder="Ex : Responsable des stocks"
                value={form.fonction}
                onChange={(e) => setForm({ ...form, fonction: e.target.value })}
              />
            </FormField>
          </div>

          {/* Établissement (sauf admin) */}
          {form.role !== "ADMINISTRATEUR" && (
            <FormField
              label="Établissement"
              obligatoire
              aide={
                form.role === "PERSONNEL_BANQUE"
                  ? "Banques de sang et hôpitaux avec banque de sang"
                  : "Hôpitaux uniquement"
              }
            >
              {chargementEtabs ? (
                <div className="flex items-center justify-center rounded-lg border border-neutral-200 py-3 dark:border-neutral-700">
                  <Loader taille="sm" />
                </div>
              ) : etablissementsFiltres.length === 0 ? (
                <div className="rounded-lg border border-neutral-200 py-3 text-center text-sm text-neutral-500 dark:border-neutral-700">
                  Aucun établissement disponible pour ce rôle
                </div>
              ) : (
                <Select
                  value={form.etablissement_id}
                  onChange={(e) =>
                    setForm({ ...form, etablissement_id: e.target.value })
                  }
                  placeholder="Choisir…"
                  options={etablissementsFiltres.map((e) => {
                    const hb = estHopitalAvecBanque(e);
                    return {
                      value: String(e.id),
                      label: hb
                        ? `${e.nom} 🩸 (a une banque de sang)`
                        : e.type === "HOPITAL"
                        ? `${e.nom} 🏥`
                        : `${e.nom} 🩸`,
                    };
                  })}
                />
              )}
            </FormField>
          )}

          {/* Info contextuelle */}
          {selectionEstHopitalAvecBanque && (
            <div className="rounded-lg border border-success-500/30 bg-success-50 p-3 text-xs text-success-700 dark:bg-success-500/5 dark:text-success-400">
              <p className="font-semibold">🩸 Hôpital avec banque de sang</p>
              <p className="mt-1">
                Ce personnel gérera la <strong>banque de sang</strong> de cet
                hôpital (dons, poches, stocks, RDV). Pour gérer les{" "}
                <strong>demandes de sang</strong>, créez un compte{" "}
                <strong>PERSONNEL_HOPITAL</strong> sur le même établissement.
              </p>
            </div>
          )}

          {/* Info mot de passe auto */}
          <div className="flex items-start gap-2 rounded-lg border border-info-500/30 bg-info-50 p-3 text-xs text-info-700 dark:bg-info-500/5 dark:text-info-400">
            <KeyRound size={14} className="mt-0.5 shrink-0" />
            <p>
              💡 Un <strong>mot de passe temporaire</strong> sera généré
              automatiquement par le système. Il vous sera affiché
              <strong> une seule fois</strong> après la création.
            </p>
          </div>

          <FormError message={formErreur} />
        </form>
      </Modal>

      {/* ============ MODALE MOT DE PASSE TEMPORAIRE ============ */}
      <Modal
        ouverte={!!identifiants}
        onFermer={() => setIdentifiants(null)}
        titre="Compte créé ✅"
        description="Transmettez ces identifiants au nouveau personnel."
      >
        {identifiants && (
          <div className="space-y-4">
            {/* Avertissement */}
            <div className="rounded-xl border-2 border-warning-500/40 bg-warning-50 p-4 dark:bg-warning-500/5">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className="mt-0.5 shrink-0 text-warning-700 dark:text-warning-400"
                  size={18}
                />
                <div>
                  <p className="text-sm font-semibold text-warning-700 dark:text-warning-400">
                    Ce mot de passe ne sera plus affiché
                  </p>
                  <p className="mt-1 text-xs text-warning-700/80 dark:text-warning-400/80">
                    Notez-le ou copiez-le maintenant. Communiquez-le par un
                    canal sécurisé (appel, SMS privé, en personne).
                  </p>
                </div>
              </div>
            </div>

            {/* Identifiants */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Identifiants de {identifiants.nom}
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Email
                  </p>
                  <p className="font-mono text-sm font-medium text-neutral-900 dark:text-white">
                    {identifiants.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Mot de passe temporaire
                  </p>
                  <p className="font-mono text-lg font-bold tracking-widest text-primary-600 dark:text-primary-400">
                    {identifiants.motDePasse}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variante="outline"
                className="flex-1 justify-center"
                iconeGauche={
                  copie ? <Check size={16} /> : <Copy size={16} />
                }
                onClick={copierIdentifiants}
              >
                {copie ? "Copié !" : "Copier les identifiants"}
              </Button>
              <Button
                className="flex-1 justify-center"
                onClick={() => setIdentifiants(null)}
              >
                J'ai transmis
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}