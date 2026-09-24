// ============================================================
// AIDORA — MON PROFIL (DONNEUR) — avec géolocalisation
// ============================================================

import { useState, type FormEvent } from "react";
import {
  Mail, Phone, MapPin, Save, Calendar, Droplets, AlertTriangle,
  ToggleLeft, ToggleRight, User, Shield, X, Edit3, Info,
  Navigation, Loader2, CheckCircle2,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Loader } from "../../../components/ui/Loader";
import { Avatar } from "../../../components/ui/Avatar";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import { useMonProfil } from "../hooks/useMonProfil";
import {
  mettreAJourMonProfil,
  basculerDisponibilite,
  reverseGeocode,
} from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import {
  groupeAfficheDonneur,
  ageDepuis,
  estDisponible,
  libelleSexe,
} from "../../../types/donneur";

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

const SEXES = [
  { value: "M", label: "Homme" },
  { value: "F", label: "Femme" },
];

export function MonProfilPage() {
  const { profil, chargement, erreur, recharger } = useMonProfil();
  const { afficher } = useToast();

  const [edition, setEdition] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [bascule, setBascule] = useState(false);
  const [formErreur, setFormErreur] = useState("");

  // État de la géoloc
  const [geoChargement, setGeoChargement] = useState(false);
  const [geoSucces, setGeoSucces] = useState(false);

  const [form, setForm] = useState({
    telephone: "",
    adresse: "",
    ville: "",
    quartier: "",
    date_naissance: "",
    sexe: "",
    groupe_sanguin: "",
    rhesus: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  function demarrerEdition() {
    if (!profil) return;
    setForm({
      telephone: profil.telephone ?? "",
      adresse: profil.adresse ?? "",
      ville: profil.ville ?? "",
      quartier: profil.quartier ?? "",
      date_naissance: profil.date_naissance
        ? profil.date_naissance.split("T")[0]
        : "",
      sexe: profil.sexe ?? "",
      groupe_sanguin: profil.groupe_sanguin ?? "",
      rhesus: profil.rhesus ?? "",
      latitude: profil.latitude ?? null,
      longitude: profil.longitude ?? null,
    });
    setGeoSucces(false);
    setFormErreur("");
    setEdition(true);
  }

  // --------------------------------------------------------
  // GÉOLOCALISATION → remplit ville + quartier + adresse
  // --------------------------------------------------------
  async function utiliserMaPosition() {
    if (!navigator.geolocation) {
      afficher("Géolocalisation non supportée", "danger");
      return;
    }

    setGeoChargement(true);
    setGeoSucces(false);
    setFormErreur("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // 1. Enregistre les coordonnées
        setForm((f) => ({ ...f, latitude, longitude }));

        // 2. Reverse geocoding → ville + quartier
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
          afficher("Position enregistrée", "success", "Vérifiez la ville et le quartier.");
        }
      },
      (err) => {
        setGeoChargement(false);
        let msg = "Impossible de vous localiser.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Vous avez refusé la géolocalisation. Autorisez-la dans votre navigateur.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Délai dépassé. Réessayez.";
        }
        afficher("Géolocalisation", "danger", msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // --------------------------------------------------------
  async function sauvegarder(e: FormEvent) {
    e.preventDefault();
    setFormErreur("");
    setEnregistrement(true);

    try {
      const payload: Record<string, unknown> = {};

      if (form.telephone)      payload.telephone = form.telephone;
      if (form.adresse)        payload.adresse = form.adresse;
      if (form.ville)          payload.ville = form.ville;
      if (form.quartier)       payload.quartier = form.quartier;
      if (form.date_naissance) payload.date_naissance = form.date_naissance;
      if (form.sexe)           payload.sexe = form.sexe;
      if (form.groupe_sanguin) payload.groupe_sanguin = form.groupe_sanguin;
      if (form.rhesus)         payload.rhesus = form.rhesus;
      if (form.latitude != null)  payload.latitude = form.latitude;
      if (form.longitude != null) payload.longitude = form.longitude;

      await mettreAJourMonProfil(payload);
      afficher("Profil mis à jour", "success");
      setEdition(false);
      await recharger();
    } catch (err) {
      setFormErreur(extraireMessageErreur(err));
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
      afficher(actuel ? "Marqué indisponible" : "Marqué disponible", "success");
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
        <Card><Loader texte="Chargement…" /></Card>
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
  const profilIncomplet = !profil.date_naissance || !profil.sexe || !profil.groupe_sanguin;
  const aPosition = profil.latitude != null && profil.longitude != null;

  return (
    <PageLayout
      titre="Mon profil"
      description="Gérez vos informations et votre disponibilité."
      actions={
        !edition && (
          <Button iconeGauche={<Edit3 size={16} />} onClick={demarrerEdition}>
            Modifier
          </Button>
        )
      }
    >
      {profilIncomplet && !edition && (
        <Card className="mb-4 border-warning-500/30 bg-warning-50">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 text-warning-700" size={20} />
            <div className="flex-1">
              <p className="font-medium text-warning-700">Complétez votre profil</p>
              <p className="mt-0.5 text-sm text-warning-700/80">
                Certaines informations (date de naissance, sexe, groupe sanguin)
                sont manquantes.
              </p>
            </div>
            <Button variante="outline" taille="sm" onClick={demarrerEdition}>
              Compléter
            </Button>
          </div>
        </Card>
      )}

      {/* ============ CARTE IDENTITÉ ============ */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar taille="xl" prenom={profil.prenom} nom={profil.nom} />
            <div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {profil.prenom} {profil.nom}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {profil.groupe_sanguin && (
                  <Badge variante="primary">
                    <Droplets size={11} />{groupe}
                  </Badge>
                )}
                {age !== null && <Badge variante="neutral">{age} ans</Badge>}
                {profil.sexe && (
                  <Badge variante="info">{libelleSexe(profil.sexe)}</Badge>
                )}
                {profil.statut_compte === "ACTIF" && (
                  <Badge variante="success">
                    <Shield size={11} />Compte actif
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={toggleDisponibilite}
            disabled={bascule}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            {dispo ? (
              <ToggleRight className="text-success-500" size={28} />
            ) : (
              <ToggleLeft className="text-neutral-400" size={28} />
            )}
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {dispo ? "Disponible" : "Indisponible"}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {dispo ? "Vous pouvez être contacté" : "Vous ne recevrez pas d'alertes"}
              </p>
            </div>
          </button>
        </div>
      </Card>

      {/* ============ FORMULAIRE ============ */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Informations personnelles</CardTitle>
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
          /* ============ MODE LECTURE ============ */
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoLigne icone={<Mail size={14} />} label="Email" valeur={profil.email} />
            <InfoLigne icone={<Phone size={14} />} label="Téléphone"
              valeur={profil.telephone ?? "—"} />
            <InfoLigne icone={<User size={14} />} label="Sexe"
              valeur={libelleSexe(profil.sexe)} />
            <InfoLigne icone={<Droplets size={14} />} label="Groupe sanguin"
              valeur={profil.groupe_sanguin ? groupe : "—"} />
            <InfoLigne icone={<Calendar size={14} />} label="Date de naissance"
              valeur={profil.date_naissance
                ? new Date(profil.date_naissance).toLocaleDateString("fr-FR")
                : "—"} />
            <InfoLigne icone={<MapPin size={14} />} label="Ville"
              valeur={profil.ville ?? "—"} />
            <InfoLigne icone={<MapPin size={14} />} label="Quartier"
              valeur={profil.quartier ?? "—"} />
            <InfoLigne icone={<MapPin size={14} />} label="Adresse"
              valeur={profil.adresse ?? "—"} />
            {aPosition && (
              <InfoLigne icone={<Navigation size={14} />} label="Position GPS"
                valeur={`${profil.latitude?.toFixed(4)}, ${profil.longitude?.toFixed(4)}`} />
            )}
          </div>
        ) : (
          /* ============ MODE ÉDITION ============ */
          <form onSubmit={sauvegarder} className="mt-6 space-y-6">
            {/* Section : Localisation avec bouton GPS */}
            <div className="rounded-xl border-2 border-primary-500/20 bg-primary-50/50 p-4 dark:border-primary-500/20 dark:bg-primary-500/5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white">
                    <Navigation size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Détecter ma position automatiquement
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                      Remplit automatiquement votre ville et quartier.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variante={geoSucces ? "outline" : "primary"}
                  iconeGauche={
                    geoChargement ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : geoSucces ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Navigation size={16} />
                    )
                  }
                  onClick={utiliserMaPosition}
                  disabled={geoChargement}
                >
                  {geoChargement
                    ? "Localisation…"
                    : geoSucces
                    ? "Position détectée"
                    : "Me localiser"}
                </Button>
              </div>

              {form.latitude != null && form.longitude != null && (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  📍 {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Section : Identité */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Identité
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Date de naissance">
                  <Input type="date" value={form.date_naissance}
                    onChange={(e) =>
                      setForm({ ...form, date_naissance: e.target.value })
                    }
                    iconeGauche={<Calendar size={16} />} />
                </FormField>
                <FormField label="Sexe">
                  <Select value={form.sexe}
                    onChange={(e) => setForm({ ...form, sexe: e.target.value })}
                    placeholder="Choisir…" options={SEXES} />
                </FormField>
              </div>
            </div>

            {/* Section : Groupe sanguin */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Groupe sanguin
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Groupe">
                  <Select value={form.groupe_sanguin}
                    onChange={(e) =>
                      setForm({ ...form, groupe_sanguin: e.target.value })
                    }
                    placeholder="Choisir…" options={GROUPES} />
                </FormField>
                <FormField label="Rhésus">
                  <Select value={form.rhesus}
                    onChange={(e) => setForm({ ...form, rhesus: e.target.value })}
                    placeholder="Choisir…" options={RHESUS} />
                </FormField>
              </div>
            </div>

            {/* Section : Contact */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Contact
              </p>
              <FormField label="Téléphone">
                <Input value={form.telephone}
                  onChange={(e) =>
                    setForm({ ...form, telephone: e.target.value })
                  }
                  placeholder="+237 6XX XX XX XX"
                  iconeGauche={<Phone size={16} />} />
              </FormField>
            </div>

            {/* Section : Localisation */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Localisation
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Ville"
                  aide={geoSucces ? "Rempli automatiquement" : undefined}>
                  <Input value={form.ville}
                    onChange={(e) =>
                      setForm({ ...form, ville: e.target.value })
                    }
                    placeholder="Ex : Yaoundé"
                    iconeGauche={<MapPin size={16} />} />
                </FormField>
                <FormField label="Quartier"
                  aide={geoSucces ? "Rempli automatiquement" : undefined}>
                  <Input value={form.quartier}
                    onChange={(e) =>
                      setForm({ ...form, quartier: e.target.value })
                    }
                    placeholder="Ex : Bastos"
                    iconeGauche={<MapPin size={16} />} />
                </FormField>
              </div>
              <div className="mt-4">
                <FormField label="Adresse complète">
                  <Input value={form.adresse}
                    onChange={(e) =>
                      setForm({ ...form, adresse: e.target.value })
                    }
                    placeholder="Ex : Rue 1.234, Immeuble ABC"
                    iconeGauche={<MapPin size={16} />} />
                </FormField>
              </div>
            </div>

            <FormError message={formErreur} />

            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <Button type="button" variante="ghost"
                iconeGauche={<X size={16} />}
                onClick={() => setEdition(false)}>
                Annuler
              </Button>
              <Button type="submit" iconeGauche={<Save size={16} />}
                chargement={enregistrement}>
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
  icone, label, valeur,
}: {
  icone: React.ReactNode;
  label: string;
  valeur: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        {icone}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
          {valeur}
        </p>
      </div>
    </div>
  );
}