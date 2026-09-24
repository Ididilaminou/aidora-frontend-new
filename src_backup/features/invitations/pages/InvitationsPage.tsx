// ============================================================
// AIDORA — PAGE INVITATIONS
// ============================================================

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Mail,
  Phone,
  Trash2,
  Save,
  Droplets,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Modal } from "../../../components/ui/Modal";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import {
  obtenirInvitations,
  inviterDonneur,
  annulerInvitation,
  libelleStatutInvitation,
  varianteStatutInvitation,
  nomInvite,
  groupeInvitation,
  type Invitation,
} from "../api";
import { extraireMessageErreur } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

export function InvitationsPage() {
  const { afficher } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [action, setAction] = useState<number | null>(null);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
  });

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      setInvitations(await obtenirInvitations());
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setInvitations([]);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  async function envoyerInvitation(e: FormEvent) {
    e.preventDefault();
    setFormErreur("");

    if (!form.prenom || !form.nom) {
      setFormErreur("Le prénom et le nom sont obligatoires.");
      return;
    }
    if (!form.email && !form.telephone) {
      setFormErreur("Un email ou un téléphone est requis.");
      return;
    }

    setEnvoi(true);
    try {
      await inviterDonneur(form);
      afficher("Invitation envoyée", "success");
      setModaleOuverte(false);
      setForm({ prenom: "", nom: "", email: "", telephone: "" });
      await charger();
    } catch (err) {
      const msg = extraireMessageErreur(err);
      setFormErreur(msg);
      afficher("Échec de l'invitation", "danger", msg);
    } finally {
      setEnvoi(false);
    }
  }

  async function annuler(id: number) {
    if (!confirm("Annuler cette invitation ?")) return;
    setAction(id);
    try {
      await annulerInvitation(id);
      afficher("Invitation annulée", "success");
      await charger();
    } catch (err) {
      afficher("Échec", "danger", extraireMessageErreur(err));
    } finally {
      setAction(null);
    }
  }

  const enAttente = invitations.filter((i) => i.statut === "EN_ATTENTE").length;
  const acceptees = invitations.filter((i) => i.statut === "ACCEPTEE").length;

  return (
    <PageLayout
      titre="Invitations"
      description={`${invitations.length} invitation${invitations.length > 1 ? "s" : ""} au total.`}
      actions={
        <>
          <Button
            variante="outline"
            iconeGauche={<RefreshCw size={16} />}
            onClick={charger}
            disabled={chargement}
          >
            Actualiser
          </Button>
          <Button
            iconeGauche={<UserPlus size={16} />}
            onClick={() => setModaleOuverte(true)}
          >
            Inviter
          </Button>
        </>
      }
    >
      {/* Stats */}
      {!chargement && !erreur && invitations.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
              {invitations.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">En attente</p>
            <p className="mt-1 text-2xl font-bold text-warning-700">
              {enAttente}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Acceptées</p>
            <p className="mt-1 text-2xl font-bold text-success-700">
              {acceptees}
            </p>
          </Card>
        </div>
      )}

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les invitations
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
          <Loader texte="Chargement des invitations…" />
        </Card>
      )}

      {!chargement && !erreur && invitations.length === 0 && (
        <Card>
          <EmptyState
            icone={<UserPlus size={22} />}
            titre="Aucune invitation"
            description="Invitez des donneurs depuis le registre pour commencer."
            action={
              <Button
                iconeGauche={<UserPlus size={16} />}
                onClick={() => setModaleOuverte(true)}
              >
                Inviter un donneur
              </Button>
            }
          />
        </Card>
      )}

      {!chargement && !erreur && invitations.length > 0 && (
        <Card>
          <CardTitle>Invitations envoyées</CardTitle>
          <CardDescription className="mb-4">
            Suivez l'état des invitations envoyées aux donneurs.
          </CardDescription>
          <div>
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-700">
                    {groupeInvitation(inv)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                      {nomInvite(inv)}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
                      {inv.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail size={11} />
                          {inv.email}
                        </span>
                      )}
                      {inv.telephone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={11} />
                          {inv.telephone}
                        </span>
                      )}
                      {inv.etablissement_nom && (
                        <>
                          <span>·</span>
                          <span>{inv.etablissement_nom}</span>
                        </>
                      )}
                    </div>
                    {inv.code_activation && inv.statut === "EN_ATTENTE" && (
                      <p className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-primary-600">
                        <Droplets size={11} />
                        Code : {inv.code_activation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variante={varianteStatutInvitation(inv.statut)}>
                    {libelleStatutInvitation(inv.statut)}
                  </Badge>
                  {inv.statut === "EN_ATTENTE" && (
                    <button
                      aria-label="Annuler"
                      onClick={() => annuler(inv.id)}
                      disabled={action === inv.id}
                      className="rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modale */}
      <Modal
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
        titre="Inviter un donneur"
        description="Un code d'activation sera envoyé par email ou SMS."
        footer={
          <>
            <Button
              variante="ghost"
              onClick={() => setModaleOuverte(false)}
            >
              Annuler
            </Button>
            <Button
              iconeGauche={<Save size={16} />}
              chargement={envoi}
              type="submit"
              form="form-invitation"
            >
              Envoyer
            </Button>
          </>
        }
      >
        <form id="form-invitation" onSubmit={envoyerInvitation} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Prénom" obligatoire>
              <Input
                value={form.prenom}
                onChange={(e) =>
                  setForm({ ...form, prenom: e.target.value })
                }
                placeholder="Marie"
                required
              />
            </FormField>
            <FormField label="Nom" obligatoire>
              <Input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ngo"
                required
              />
            </FormField>
          </div>

          <FormField label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="donneur@email.com"
              iconeGauche={<Mail size={16} />}
            />
          </FormField>

          <FormField label="Téléphone" aide="Email ou téléphone au choix.">
            <Input
              value={form.telephone}
              onChange={(e) =>
                setForm({ ...form, telephone: e.target.value })
              }
              placeholder="+237 6XX XX XX XX"
              iconeGauche={<Phone size={16} />}
            />
          </FormField>

          <FormError message={formErreur} />
        </form>
      </Modal>
    </PageLayout>
  );
}