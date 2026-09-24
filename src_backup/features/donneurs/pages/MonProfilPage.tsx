// ============================================================
// AIDORA — MON PROFIL (DONNEUR)
// ============================================================

import { useState, type FormEvent } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Save,
  Calendar,
  Droplets,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  User,
  Shield,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Loader } from "../../../components/ui/Loader";
import { Avatar } from "../../../components/ui/Avatar";
import { FormField } from "../../../components/forms/FormField";
import { useMonProfil } from "../hooks/useMonProfil";
import { mettreAJourMonProfil, basculerDisponibilite } from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import {
  groupeAfficheDonneur,
  ageDepuis,
  estDisponible,
  libelleSexe,
} from "../../../types/donneur";

export function MonProfilPage() {
  const { profil, chargement, erreur, recharger } = useMonProfil();
  const { afficher } = useToast();

  const [edition, setEdition] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [bascule, setBascule] = useState(false);

  const [form, setForm] = useState({
    telephone: "",
    adresse: "",
  });

  function demarrerEdition() {
    if (!profil) return;
    setForm({
      telephone: profil.telephone ?? "",
      adresse: profil.adresse ?? "",
    });
    setEdition(true);
  }

  async function sauvegarder(e: FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    try {
      await mettreAJourMonProfil(form);
      afficher("Profil mis à jour", "success");
      setEdition(false);
      await recharger();
    } catch (err) {
      afficher("Échec", "danger", extraireMessageErreur(err));
    } finally {
      setEnregistrement(false);
    }
  }

  async function toggleDisponibilite() {
    if (!profil) return;
    setBascule(true);
    try {
      const actuel = estDisponible(profil);
      await basculerDisponibilite(!actuel);
      afficher(
        actuel ? "Marqué indisponible" : "Marqué disponible",
        "success"
      );
      await recharger();
    } catch (err) {
      afficher("Échec", "danger", extraireMessageErreur(err));
    } finally {
      setBascule(false);
    }
  }

  if (chargement) {
    return (
      <PageLayout titre="Mon profil">
        <Card>
          <Loader texte="Chargement…" />
        </Card>
      </PageLayout>
    );
  }

  if (erreur || !profil) {
    return (
      <PageLayout titre="Mon profil">
        <Card className="border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger votre profil
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">
                {erreur ?? "Profil introuvable"}
              </p>
            </div>
            <Button variante="outline" taille="sm" onClick={recharger}>
              Réessayer
            </Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

  const groupe = groupeAfficheDonneur(profil);
  const age = ageDepuis(profil.date_naissance);
  const dispo = estDisponible(profil);

  return (
    <PageLayout
      titre="Mon profil"
      description="Gérez vos informations et votre disponibilité."
    >
      {/* -------- Carte identité -------- */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar taille="xl" prenom={profil.prenom} nom={profil.nom} />
            <div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {profil.prenom} {profil.nom}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variante="primary">
                  <Droplets size={11} />
                  {groupe}
                </Badge>
                {age !== null && <Badge variante="neutral">{age} ans</Badge>}
                {profil.sexe && (
                  <Badge variante="info">{libelleSexe(profil.sexe)}</Badge>
                )}
                {profil.statut_compte === "ACTIF" && (
                  <Badge variante="success">
                    <Shield size={11} />
                    Compte actif
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Disponibilité */}
          <button
            onClick={toggleDisponibilite}
            disabled={bascule}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            {dispo ? (
              <ToggleRight className="text-success-500" size={28} />
            ) : (
              <ToggleLeft className="text-neutral-400 dark:text-neutral-500" size={28} />
            )}
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {dispo ? "Disponible" : "Indisponible"}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
                {dispo
                  ? "Vous pouvez être contacté"
                  : "Vous ne recevrez pas d'alertes"}
              </p>
            </div>
          </button>
        </div>
      </Card>

      {/* -------- Coordonnées -------- */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Coordonnées</CardTitle>
            <CardDescription>
              Ces informations permettent aux banques de vous contacter.
            </CardDescription>
          </div>
          {!edition && (
            <Button variante="outline" taille="sm" onClick={demarrerEdition}>
              Modifier
            </Button>
          )}
        </div>

        {!edition ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoLigne
              icone={<Mail size={14} />}
              label="Email"
              valeur={profil.email}
            />
            <InfoLigne
              icone={<Phone size={14} />}
              label="Téléphone"
              valeur={profil.telephone ?? "—"}
            />
            <InfoLigne
              icone={<MapPin size={14} />}
              label="Adresse"
              valeur={profil.adresse ?? "—"}
            />
            <InfoLigne
              icone={<User size={14} />}
              label="Sexe"
              valeur={libelleSexe(profil.sexe)}
            />
            {profil.date_naissance && (
              <InfoLigne
                icone={<Calendar size={14} />}
                label="Date de naissance"
                valeur={new Date(profil.date_naissance).toLocaleDateString(
                  "fr-FR"
                )}
              />
            )}
            {profil.latitude != null && profil.longitude != null && (
              <InfoLigne
                icone={<MapPin size={14} />}
                label="Position"
                valeur={`${profil.latitude.toFixed(3)}, ${profil.longitude.toFixed(3)}`}
              />
            )}
          </div>
        ) : (
          <form onSubmit={sauvegarder} className="mt-6 space-y-4">
            <FormField label="Téléphone">
              <Input
                value={form.telephone}
                onChange={(e) =>
                  setForm({ ...form, telephone: e.target.value })
                }
                iconeGauche={<Phone size={16} />}
              />
            </FormField>

            <FormField label="Adresse">
              <Input
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                iconeGauche={<MapPin size={16} />}
                placeholder="Quartier, ville…"
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variante="ghost"
                onClick={() => setEdition(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                iconeGauche={<Save size={16} />}
                chargement={enregistrement}
              >
                Enregistrer
              </Button>
            </div>
          </form>
        )}
      </Card>
    </PageLayout>
  );
}

// ------------------------------------------------------------
function InfoLigne({
  icone,
  label,
  valeur,
}: {
  icone: React.ReactNode;
  label: string;
  valeur: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
        {icone}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">{label}</p>
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
          {valeur}
        </p>
      </div>
    </div>
  );
}