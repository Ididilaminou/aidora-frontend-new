// ============================================================
// AIDORA — PRENDRE UN RENDEZ-VOUS (DONNEUR)
// ------------------------------------------------------------
// Étape 1 : choisir un établissement (banque ou hôpital)
// Étape 2 : choisir un créneau
// Étape 3 : confirmer
// ============================================================

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Building2, AlertTriangle, Clock, Users, ChevronLeft, Check,
  MapPin, CalendarDays, RefreshCw, Save, Phone, Navigation,
  HeartPulse, Info,
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
  obtenirBanquesProches,
  obtenirToutesBanques,
  obtenirCreneauxBanque,
  prendreRdv,
  ouvrirItineraire,
} from "../api";

import { extraireMessageErreur } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import {
  formatHeure, placesDisponibles, tauxRemplissage, type Creneau,
} from "../../../types/rdv";
import type { Etablissement } from "../../../types/etablissement";
import { localisation } from "../../../types/etablissement";

// ------------------------------------------------------------
// Helper : est-ce un hôpital ?
// ------------------------------------------------------------
function estHopital(e: Etablissement): boolean {
  return e.type === "HOPITAL";
}

// ============================================================
// PAGE
// ============================================================

export function PrendreRdvPage() {
  const { afficher } = useToast();

  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [chargementEtablissements, setChargementEtablissements] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // Filtre
  const [filtre, setFiltre] = useState<"tous" | "banques" | "hopitaux">("tous");

  // Établissement choisi
  const [etabChoisi, setEtabChoisi] = useState<Etablissement | null>(null);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [chargementCreneaux, setChargementCreneaux] = useState(false);

  // Modale de confirmation
  const [modale, setModale] = useState(false);
  const [creneauChoisi, setCreneauChoisi] = useState<Creneau | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [formErreur, setFormErreur] = useState("");

  // --------------------------------------------------------
  // Charger les établissements
  // --------------------------------------------------------
  const chargerEtablissements = useCallback(async () => {
    setChargementEtablissements(true);
    setErreur(null);
    try {
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
              });
            }
          );
          const liste = await obtenirBanquesProches(
            position.coords.latitude,
            position.coords.longitude
          );
          setEtablissements(liste);
          return;
        } catch {
          // fallback
        }
      }
      setEtablissements(await obtenirToutesBanques());
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setEtablissements([]);
    } finally {
      setChargementEtablissements(false);
    }
  }, []);

  useEffect(() => {
    chargerEtablissements();
  }, [chargerEtablissements]);

  // --------------------------------------------------------
  const chargerCreneaux = useCallback(async (etabId: number) => {
    setChargementCreneaux(true);
    try {
      setCreneaux(await obtenirCreneauxBanque(etabId));
    } catch (err) {
      afficher("Impossible de charger les créneaux", "danger", extraireMessageErreur(err));
      setCreneaux([]);
    } finally {
      setChargementCreneaux(false);
    }
  }, [afficher]);

  async function choisirEtablissement(e: Etablissement) {
    setEtabChoisi(e);
    await chargerCreneaux(e.id);
  }

  function retourEtablissements() {
    setEtabChoisi(null);
    setCreneaux([]);
  }

  // --------------------------------------------------------
  function ouvrirConfirmation(c: Creneau) {
    setCreneauChoisi(c);
    setCommentaire("");
    setFormErreur("");
    setModale(true);
  }

  // --------------------------------------------------------
  async function confirmer(e: FormEvent) {
    e.preventDefault();
    if (!creneauChoisi || !etabChoisi) return;

    setEnvoi(true);
    setFormErreur("");

    try {
      await prendreRdv({
        creneau_id: creneauChoisi.id,
        etablissement_id: etabChoisi.id,
        commentaire: commentaire || undefined,
      });

      afficher(
        "Rendez-vous confirmé",
        "success",
        `${new Date(creneauChoisi.date_creneau).toLocaleDateString("fr-FR")} à ${formatHeure(creneauChoisi.heure_debut)}`
      );

      setModale(false);
      setCreneauChoisi(null);
      setCommentaire("");
      await chargerCreneaux(etabChoisi.id);
    } catch (err) {
      setFormErreur(extraireMessageErreur(err));
    } finally {
      setEnvoi(false);
    }
  }

  // --------------------------------------------------------
  // Filtrage
  // --------------------------------------------------------
  const etablissementsFiltres = etablissements.filter((e) => {
    if (filtre === "tous") return true;
    if (filtre === "banques") return e.type === "BANQUE_DE_SANG";
    if (filtre === "hopitaux") return e.type === "HOPITAL";
    return true;
  });

  const nbBanques = etablissements.filter((e) => e.type === "BANQUE_DE_SANG").length;
  const nbHopitaux = etablissements.filter((e) => e.type === "HOPITAL").length;

  // ========================================================
  // RENDU
  // ========================================================

  if (erreur) {
    return (
      <PageLayout titre="Prendre un rendez-vous">
        <Card className="border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les établissements
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={chargerEtablissements}>
              Réessayer
            </Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      titre={etabChoisi ? `Créneaux — ${etabChoisi.nom}` : "Prendre un rendez-vous"}
      description={
        etabChoisi
          ? "Choisissez un créneau qui vous convient."
          : "Sélectionnez une banque de sang ou un hôpital avec banque de sang."
      }
      actions={
        etabChoisi ? (
          <Button variante="outline" iconeGauche={<ChevronLeft size={16} />}
            onClick={retourEtablissements}>
            Retour
          </Button>
        ) : (
          <Button variante="outline" iconeGauche={<RefreshCw size={16} />}
            onClick={chargerEtablissements}
            disabled={chargementEtablissements}>
            Actualiser
          </Button>
        )
      }
    >
      {/* ============ ÉTAPE 1 : LISTE ============ */}
      {!etabChoisi && (
        <>
          {/* Filtres */}
          {!chargementEtablissements && etablissements.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setFiltre("tous")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filtre === "tous"
                    ? "bg-primary-500 text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                Tous ({etablissements.length})
              </button>
              <button
                onClick={() => setFiltre("banques")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filtre === "banques"
                    ? "bg-primary-500 text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                🩸 Banques ({nbBanques})
              </button>
              <button
                onClick={() => setFiltre("hopitaux")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filtre === "hopitaux"
                    ? "bg-primary-500 text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                🏥 Hôpitaux ({nbHopitaux})
              </button>
            </div>
          )}

          {/* Info */}
          {!chargementEtablissements && etablissements.length > 0 && (
            <Card className="mb-4 border-info-500/30 bg-info-50 dark:bg-info-500/5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 shrink-0 text-info-600 dark:text-info-400" size={18} />
                <p className="text-xs text-info-700 dark:text-info-400">
                  💡 Au Cameroun, la plupart des grands hôpitaux disposent d'une
                  banque de sang. Vous pouvez donner votre sang dans l'un de ces
                  établissements.
                </p>
              </div>
            </Card>
          )}

          {/* Chargement */}
          {chargementEtablissements && (
            <Card><Loader texte="Chargement des établissements…" /></Card>
          )}

          {/* Vide */}
          {!chargementEtablissements && etablissements.length === 0 && (
            <Card>
              <EmptyState
                icone={<Building2 size={22} />}
                titre="Aucun établissement disponible"
                description="Aucune banque ou hôpital n'est enregistré pour le moment."
              />
            </Card>
          )}

          {/* Grille */}
          {!chargementEtablissements && etablissementsFiltres.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {etablissementsFiltres.map((b) => {
                const hopital = estHopital(b);

                return (
                  <Card key={b.id} hoverable>
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        hopital
                          ? "bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400"
                          : "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                      }`}>
                        {hopital ? <HeartPulse size={20} /> : <Building2 size={20} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-neutral-900 dark:text-white">
                          {b.nom}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge variante={hopital ? "info" : "primary"}>
                            {hopital ? "Hôpital" : "Banque de sang"}
                          </Badge>
                          {b.distance_km !== undefined && (
                            <Badge variante="neutral">
                              {b.distance_km < 1
                                ? `${Math.round(b.distance_km * 1000)} m`
                                : `${b.distance_km.toFixed(1)} km`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {b.adresse && (
                        <p className="inline-flex items-center gap-1.5">
                          <MapPin size={11} />{b.adresse}
                        </p>
                      )}
                      {b.ville && (
                        <p className="inline-flex items-center gap-1.5">
                          <MapPin size={11} />{localisation(b)}
                        </p>
                      )}
                      {b.telephone && (
                        <p className="inline-flex items-center gap-1.5">
                          <Phone size={11} />{b.telephone}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <Button
                        taille="sm"
                        variante="outline"
                        iconeGauche={<Navigation size={14} />}
                        onClick={() => ouvrirItineraire(b)}
                        disabled={!b.adresse && !b.ville && !b.latitude}
                      >
                        Itinéraire
                      </Button>
                      <Button
                        taille="sm"
                        iconeGauche={<CalendarDays size={14} />}
                        onClick={() => choisirEtablissement(b)}
                      >
                        Créneaux
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ============ ÉTAPE 2 : CRÉNEAUX ============ */}
      {etabChoisi && (
        <>
          {chargementCreneaux && (
            <Card><Loader texte="Chargement des créneaux…" /></Card>
          )}

          {!chargementCreneaux && creneaux.length === 0 && (
            <Card>
              <EmptyState
                icone={<Clock size={22} />}
                titre="Aucun créneau disponible"
                description="Cet établissement n'a pas encore de créneau ouvert. Essayez-en un autre."
                action={
                  <Button variante="outline" iconeGauche={<ChevronLeft size={16} />}
                    onClick={retourEtablissements}>
                    Retour
                  </Button>
                }
              />
            </Card>
          )}

          {!chargementCreneaux && creneaux.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {creneaux.map((c) => {
                const places = placesDisponibles(c);
                const pct = tauxRemplissage(c);
                const complet = places <= 0;

                return (
                  <Card key={c.id} hoverable
                    className={complet ? "opacity-60" : undefined}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400">
                          {new Date(c.date_creneau).toLocaleDateString("fr-FR", {
                            weekday: "long",
                          })}
                        </p>
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          {new Date(c.date_creneau).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "long",
                          })}
                        </p>
                      </div>
                      <Badge variante={complet ? "danger" : "success"}>
                        {complet ? "Complet" : `${places} place${places > 1 ? "s" : ""}`}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <Clock size={14} />
                      {formatHeure(c.heure_debut)} → {formatHeure(c.heure_fin)}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                          <Users size={12} />{places}/{c.capacite_max}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div className="h-full rounded-full bg-primary-500 transition-all"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <Button
                        taille="sm"
                        className="w-full justify-center"
                        iconeGauche={<Check size={14} />}
                        disabled={complet}
                        onClick={() => ouvrirConfirmation(c)}
                      >
                        {complet ? "Complet" : "Choisir ce créneau"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ============ MODALE CONFIRMATION ============ */}
      <Modal
        ouverte={modale}
        onFermer={() => setModale(false)}
        titre="Confirmer le rendez-vous"
        description="Vérifiez les informations avant de valider."
        footer={
          <>
            <Button variante="ghost" onClick={() => setModale(false)}>
              Annuler
            </Button>
            <Button iconeGauche={<Save size={16} />} chargement={envoi}
              type="submit" form="form-rdv">
              Confirmer
            </Button>
          </>
        }
      >
        {creneauChoisi && etabChoisi && (
          <form id="form-rdv" onSubmit={confirmer} className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  estHopital(etabChoisi)
                    ? "bg-info-50 text-info-600"
                    : "bg-primary-50 text-primary-600"
                }`}>
                  {estHopital(etabChoisi)
                    ? <HeartPulse size={18} />
                    : <Building2 size={18} />}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {etabChoisi.nom}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {estHopital(etabChoisi) ? "Hôpital" : "Banque de sang"}
                  </p>
                </div>
              </div>
              <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {new Date(creneauChoisi.date_creneau).toLocaleDateString("fr-FR", {
                    weekday: "long", day: "2-digit", month: "long", year: "numeric",
                  })}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <Clock size={13} />
                  {formatHeure(creneauChoisi.heure_debut)} → {formatHeure(creneauChoisi.heure_fin)}
                </p>
              </div>
            </div>

            <FormField label="Commentaire (optionnel)">
              <Input
                placeholder="Ex : premier don, allergies…"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </FormField>

            <FormError message={formErreur} />
          </form>
        )}
      </Modal>
    </PageLayout>
  );
}