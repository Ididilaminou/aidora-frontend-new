// ============================================================
// AIDORA — PAGE ÉTABLISSEMENTS
// ============================================================

import { useState, useMemo, type FormEvent } from "react";
import {
  Building2, RefreshCw, AlertTriangle, Check, X, Ban, RotateCcw,
  MapPin, Mail, Phone, Plus, Save, Navigation, Droplets,
  Search, Pencil, Filter, XCircle,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import { CanDo } from "../../../components/auth/CanDo";
import { CartePicker } from "../../../components/carte/CartePicker";
import { useEtablissements } from "../hooks/useEtablissements";
import {
  validerEtablissement, rejeterEtablissement,
  suspendreEtablissement, reactiverEtablissement,
  creerEtablissement, modifierEtablissement,
} from "../api";
import { reverseGeocode } from "../../donneurs/api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import {
  libelleType, varianteType, libelleStatutEtab, varianteStatutEtab,
  localisation, estEnAttente, estActif, possedeBanque,
  type Etablissement,
} from "../../../types/etablissement";

type Action = "valider" | "rejeter" | "suspendre" | "reactiver";
type FiltreType = "TOUS" | "HOPITAL" | "BANQUE_DE_SANG" | "AVEC_BANQUE";

// ============================================================
// CARTE D'UN ÉTABLISSEMENT
// ============================================================

function CarteEtablissement({
  etab,
  onAction,
  onModifier,
  enCours,
}: {
  etab: Etablissement;
  onAction: (id: number, action: Action) => void;
  onModifier: (etab: Etablissement) => void;
  enCours: boolean;
}) {
  const hopital = etab.type === "HOPITAL";
  const avecBanque = possedeBanque(etab);

  return (
    <Card hoverable>
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            hopital
              ? "bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400"
              : "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
          }`}
        >
          <Building2 size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-neutral-900 dark:text-white">
            {etab.nom}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variante={varianteType(etab.type)}>
              {libelleType(etab.type)}
            </Badge>
            {avecBanque && (
              <Badge variante="success">
                <Droplets size={11} />
                Banque de sang
              </Badge>
            )}
            {hopital && !avecBanque && (
              <Badge variante="warning">Demandeur</Badge>
            )}
            <Badge variante={varianteStatutEtab(etab.statut)}>
              {libelleStatutEtab(etab.statut)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2 text-neutral-600 dark:text-neutral-400">
          <MapPin size={13} className="mt-0.5 shrink-0 text-neutral-400" />
          <span className="truncate">
            {etab.adresse && `${etab.adresse} · `}
            {localisation(etab)}
          </span>
        </div>
        {etab.email && (
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Mail size={13} className="shrink-0 text-neutral-400" />
            <span className="truncate">{etab.email}</span>
          </div>
        )}
        {etab.telephone && (
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Phone size={13} className="shrink-0 text-neutral-400" />
            <span>{etab.telephone}</span>
          </div>
        )}
        {etab.latitude != null && etab.longitude != null && (
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Navigation size={13} className="shrink-0 text-neutral-400" />
            <span className="truncate">
              {etab.latitude.toFixed(4)}, {etab.longitude.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      <CanDo action="etablissement.valider">
        <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <Button
            taille="sm"
            variante="outline"
            iconeGauche={<Pencil size={14} />}
            onClick={() => onModifier(etab)}
          >
            Modifier
          </Button>

          {estEnAttente(etab) && (
            <>
              <Button
                taille="sm"
                variante="outline"
                iconeGauche={<Check size={14} />}
                onClick={() => onAction(etab.id, "valider")}
                disabled={enCours}
              >
                Valider
              </Button>
              <Button
                taille="sm"
                variante="ghost"
                iconeGauche={<X size={14} />}
                onClick={() => onAction(etab.id, "rejeter")}
                disabled={enCours}
              >
                Rejeter
              </Button>
            </>
          )}

          {estActif(etab) && (
            <Button
              taille="sm"
              variante="ghost"
              iconeGauche={<Ban size={14} />}
              onClick={() => onAction(etab.id, "suspendre")}
              disabled={enCours}
            >
              Suspendre
            </Button>
          )}

          {etab.statut === "SUSPENDU" && (
            <Button
              taille="sm"
              variante="outline"
              iconeGauche={<RotateCcw size={14} />}
              onClick={() => onAction(etab.id, "reactiver")}
              disabled={enCours}
            >
              Réactiver
            </Button>
          )}
        </div>
      </CanDo>
    </Card>
  );
}

// ============================================================
// PAGE
// ============================================================

export function EtablissementsPage() {
  const { etablissements, chargement, erreur, recharger } = useEtablissements();
  const { afficher } = useToast();
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);

  const [recherche, setRecherche] = useState("");
  const [filtreType, setFiltreType] = useState<FiltreType>("TOUS");

  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [etabEnEdition, setEtabEnEdition] = useState<Etablissement | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [geoChargement, setGeoChargement] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    type: "BANQUE_DE_SANG" as "BANQUE_DE_SANG" | "HOPITAL",
    possede_banque_de_sang: true,
    adresse: "",
    ville: "",
    region: "",
    telephone: "",
    email: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // ------------------------------------------------------------
  // FILTRES
  // ------------------------------------------------------------
  const etablissementsFiltres = useMemo(() => {
    let liste = etablissements;

    switch (filtreType) {
      case "HOPITAL":
        liste = liste.filter((e) => e.type === "HOPITAL");
        break;
      case "BANQUE_DE_SANG":
        liste = liste.filter((e) => e.type === "BANQUE_DE_SANG");
        break;
      case "AVEC_BANQUE":
        liste = liste.filter((e) => e.type === "HOPITAL" && possedeBanque(e));
        break;
    }

    const q = recherche.trim().toLowerCase();
    if (q) {
      liste = liste.filter(
        (e) =>
          e.nom.toLowerCase().includes(q) ||
          (e.ville ?? "").toLowerCase().includes(q) ||
          (e.region ?? "").toLowerCase().includes(q) ||
          (e.email ?? "").toLowerCase().includes(q)
      );
    }

    return liste;
  }, [etablissements, filtreType, recherche]);

  // ------------------------------------------------------------
  // CRÉATION / ÉDITION
  // ------------------------------------------------------------
  function ouvrirCreation() {
    setEtabEnEdition(null);
    setForm({
      nom: "",
      type: "BANQUE_DE_SANG",
      possede_banque_de_sang: true,
      adresse: "",
      ville: "",
      region: "",
      telephone: "",
      email: "",
      latitude: null,
      longitude: null,
    });
    setFormErreur("");
    setModaleOuverte(true);
  }

  function ouvrirEdition(etab: Etablissement) {
    setEtabEnEdition(etab);
    setForm({
      nom: etab.nom,
      type: etab.type,
      possede_banque_de_sang: possedeBanque(etab),
      adresse: etab.adresse ?? "",
      ville: etab.ville ?? "",
      region: etab.region ?? "",
      telephone: etab.telephone ?? "",
      email: etab.email ?? "",
      latitude: etab.latitude ?? null,
      longitude: etab.longitude ?? null,
    });
    setFormErreur("");
    setModaleOuverte(true);
  }

  async function positionChoisie(pos: [number, number]) {
    const [lat, lng] = pos;
    setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
    setGeoChargement(true);
    try {
      const adresse = await reverseGeocode(lat, lng);
      setForm((f) => ({
        ...f,
        ville: adresse.ville ?? f.ville,
        region: adresse.region ?? f.region,
        adresse: adresse.adresse ?? f.adresse,
      }));
    } finally {
      setGeoChargement(false);
    }
  }

  async function validerFormulaire(e: FormEvent) {
    e.preventDefault();
    setFormErreur("");

    if (!form.nom.trim()) {
      setFormErreur("Le nom est obligatoire.");
      return;
    }
    if (form.latitude == null || form.longitude == null) {
      setFormErreur(
        "Cliquez sur la carte (ou cherchez un lieu) pour choisir la position."
      );
      return;
    }

    setEnregistrement(true);
    try {
      const payload = {
        nom: form.nom.trim(),
        type: form.type,
        possede_banque_de_sang:
          form.type === "BANQUE_DE_SANG" ? true : form.possede_banque_de_sang,
        adresse: form.adresse.trim() || undefined,
        ville: form.ville.trim() || undefined,
        region: form.region.trim() || undefined,
        telephone: form.telephone.trim() || undefined,
        email: form.email.trim() || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
      };

      if (etabEnEdition) {
        await modifierEtablissement(etabEnEdition.id, payload);
        afficher("Établissement modifié", "success");
      } else {
        await creerEtablissement(payload);
        afficher("Établissement créé", "success", "En attente de validation.");
      }
      setModaleOuverte(false);
      await recharger();
    } catch (err) {
      setFormErreur(extraireMessageErreur(err));
    } finally {
      setEnregistrement(false);
    }
  }

  async function gererAction(id: number, action: Action) {
    setActionEnCours(id);
    try {
      switch (action) {
        case "valider":
          await validerEtablissement(id);
          afficher("Établissement validé", "success");
          break;
        case "rejeter":
          await rejeterEtablissement(id);
          afficher("Établissement rejeté", "warning");
          break;
        case "suspendre":
          await suspendreEtablissement(id);
          afficher("Établissement suspendu", "warning");
          break;
        case "reactiver":
          await reactiverEtablissement(id);
          afficher("Établissement réactivé", "success");
          break;
      }
      await recharger();
    } catch (err) {
      afficher("Action échouée", "danger", extraireMessageErreur(err));
    } finally {
      setActionEnCours(null);
    }
  }

  // ------------------------------------------------------------
  // STATS
  // ------------------------------------------------------------
  const enAttente = etablissements.filter(estEnAttente).length;
  const actifs = etablissements.filter(estActif).length;
  const banques = etablissements.filter((e) => e.type === "BANQUE_DE_SANG").length;
  const hopitauxAvecBanque = etablissements.filter(
    (e) => e.type === "HOPITAL" && possedeBanque(e)
  ).length;

  const filtresActifs = filtreType !== "TOUS" || recherche.trim().length > 0;

  return (
    <PageLayout
      titre="Établissements"
      description={`${etablissements.length} établissement${etablissements.length > 1 ? "s" : ""} enregistré${etablissements.length > 1 ? "s" : ""}.`}
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
          <CanDo action="etablissement.valider">
            <Button iconeGauche={<Plus size={16} />} onClick={ouvrirCreation}>
              Nouvel établissement
            </Button>
          </CanDo>
        </>
      }
    >
      {/* Alerte en attente */}
      {!chargement && enAttente > 0 && (
        <Card className="mb-4 border-warning-500/30 bg-warning-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-warning-700" size={20} />
            <div>
              <p className="font-medium text-warning-700">
                {enAttente} établissement{enAttente > 1 ? "s" : ""} en attente de
                vérification
              </p>
              <p className="mt-0.5 text-sm text-warning-700/80">
                Validez-les pour permettre leur utilisation.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      {!chargement && !erreur && etablissements.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
              {etablissements.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Actifs</p>
            <p className="mt-1 text-2xl font-bold text-success-700">{actifs}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Banques de sang
            </p>
            <p className="mt-1 text-2xl font-bold text-primary-700">{banques}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Hôpitaux avec banque
            </p>
            <p className="mt-1 text-2xl font-bold text-info-700">
              {hopitauxAvecBanque}
            </p>
          </Card>
        </div>
      )}

      {/* Barre de recherche + filtres */}
      {!chargement && !erreur && etablissements.length > 0 && (
        <Card className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Rechercher par nom, ville, région, email…"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-9 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              {recherche && (
                <button
                  onClick={() => setRecherche("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  aria-label="Effacer"
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "TOUS", label: "Tous", icone: Filter },
                  { key: "HOPITAL", label: "Hôpitaux", icone: Building2 },
                  { key: "BANQUE_DE_SANG", label: "Banques", icone: Droplets },
                  { key: "AVEC_BANQUE", label: "Avec banque", icone: Droplets },
                ] as const
              ).map((f) => {
                const Icone = f.icone;
                const actif = filtreType === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFiltreType(f.key as FiltreType)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      actif
                        ? "bg-primary-500 text-white shadow-sm"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <Icone size={12} />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {filtresActifs && (
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              {etablissementsFiltres.length} résultat
              {etablissementsFiltres.length > 1 ? "s" : ""}
              {recherche && ` pour « ${recherche} »`}
            </p>
          )}
        </Card>
      )}

      {/* Erreur */}
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les établissements
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={recharger}>
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {/* Chargement */}
      {chargement && !erreur && (
        <Card>
          <Loader texte="Chargement des établissements…" />
        </Card>
      )}

      {/* Vide */}
      {!chargement && !erreur && etablissements.length === 0 && (
        <Card>
          <EmptyState
            icone={<Building2 size={22} />}
            titre="Aucun établissement"
            description="Créez le premier établissement."
            action={
              <CanDo action="etablissement.valider">
                <Button iconeGauche={<Plus size={16} />} onClick={ouvrirCreation}>
                  Nouvel établissement
                </Button>
              </CanDo>
            }
          />
        </Card>
      )}

      {/* Vide (filtres) */}
      {!chargement &&
        !erreur &&
        etablissements.length > 0 &&
        etablissementsFiltres.length === 0 && (
          <Card>
            <EmptyState
              icone={<Search size={22} />}
              titre="Aucun résultat"
              description="Essayez de modifier votre recherche ou vos filtres."
              action={
                <Button
                  variante="outline"
                  onClick={() => {
                    setRecherche("");
                    setFiltreType("TOUS");
                  }}
                >
                  Réinitialiser
                </Button>
              }
            />
          </Card>
        )}

      {/* Grille */}
      {!chargement && !erreur && etablissementsFiltres.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {etablissementsFiltres.map((e) => (
            <CarteEtablissement
              key={e.id}
              etab={e}
              onAction={gererAction}
              onModifier={ouvrirEdition}
              enCours={actionEnCours === e.id}
            />
          ))}
        </div>
      )}

      {/* ============ MODALE CRÉATION / ÉDITION ============ */}
      <Modal
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
        titre={etabEnEdition ? "Modifier l'établissement" : "Nouvel établissement"}
        description="Recherchez ou cliquez sur la carte pour placer l'établissement."
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
              form="form-etab"
            >
              {etabEnEdition ? "Enregistrer" : "Créer"}
            </Button>
          </>
        }
      >
        <form id="form-etab" onSubmit={validerFormulaire} className="space-y-4">
          {/* Nom + Type sur une ligne */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Nom" obligatoire>
              <Input
                required
                placeholder="Ex : Hôpital Central Yaoundé"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </FormField>
            <FormField label="Type" obligatoire>
              <Select
                value={form.type}
                onChange={(e) => {
                  const t = e.target.value as "BANQUE_DE_SANG" | "HOPITAL";
                  setForm({
                    ...form,
                    type: t,
                    possede_banque_de_sang:
                      t === "BANQUE_DE_SANG" ? true : form.possede_banque_de_sang,
                  });
                }}
                options={[
                  { value: "BANQUE_DE_SANG", label: "Banque de sang" },
                  { value: "HOPITAL", label: "Hôpital" },
                ]}
              />
            </FormField>
          </div>

          {/* Toggle banque de sang */}
          {form.type === "HOPITAL" && (
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  possede_banque_de_sang: !form.possede_banque_de_sang,
                })
              }
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition ${
                form.possede_banque_de_sang
                  ? "border-success-500 bg-success-50 dark:bg-success-500/10"
                  : "border-neutral-200 bg-white hover:border-primary-500 dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                  form.possede_banque_de_sang
                    ? "border-success-500 bg-success-500 text-white"
                    : "border-neutral-300 dark:border-neutral-600"
                }`}
              >
                {form.possede_banque_de_sang && <Check size={14} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Cet hôpital possède une banque de sang
                </p>
                <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                  Cochez si l'hôpital accepte les dons.
                </p>
              </div>
            </button>
          )}

          {/* Téléphone + Email */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Téléphone">
              <Input
                placeholder="+237 2XX XX XX XX"
                iconeGauche={<Phone size={16} />}
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
            </FormField>
            <FormField label="Email">
              <Input
                type="email"
                placeholder="contact@exemple.cm"
                iconeGauche={<Mail size={16} />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
          </div>

          {/* Localisation + carte compacte */}
          <div className="rounded-xl border-2 border-primary-500/20 bg-primary-50/50 p-3 dark:border-primary-500/20 dark:bg-primary-500/5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white">
                <MapPin size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Localisation
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Recherchez ou cliquez sur la carte.
                </p>
              </div>
            </div>

            <CartePicker
              position={
                form.latitude != null && form.longitude != null
                  ? [form.latitude, form.longitude]
                  : null
              }
              onChange={positionChoisie}
              hauteur="180px"
            />

            {form.latitude != null && form.longitude != null && (
              <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <Navigation size={12} />
                <span>
                  {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                </span>
                {geoChargement && (
                  <span className="text-primary-600">· Détection…</span>
                )}
              </div>
            )}
          </div>

          {/* Ville + Région + Adresse */}
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Ville" aide="Auto">
              <Input
                placeholder="Yaoundé"
                iconeGauche={<MapPin size={16} />}
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
              />
            </FormField>
            <FormField label="Région">
              <Input
                placeholder="Centre"
                iconeGauche={<MapPin size={16} />}
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
            </FormField>
            <FormField label="Adresse">
              <Input
                placeholder="Avenue Kennedy"
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              />
            </FormField>
          </div>

          <FormError message={formErreur} />
        </form>
      </Modal>
    </PageLayout>
  );
}