// ============================================================
// AIDORA — PAGE RDV (BANQUE)
// ============================================================

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  CalendarPlus, RefreshCw, AlertTriangle, Clock, Users, Trash2,
  Check, Ban, Save, CalendarDays, User, Power,
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
  obtenirCreneaux, creerCreneau, supprimerCreneau, desactiverCreneau,
  obtenirRdvs, confirmerRdv, honorerRdv, annulerRdv,
} from "../api";
import { extraireMessageErreur } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import { CanDo } from "../../../components/auth/CanDo";
import {
  formatHeure, estActif, placesDisponibles, tauxRemplissage,
  dateRdv, heureRdv, libelleStatutRdv, varianteStatutRdv,
  nomCompletDonneurRdv, type Creneau, type Rdv,
} from "../../../types/rdv";

type Onglet = "creneaux" | "rdvs";

export function RdvPage() {
  const [onglet, setOnglet] = useState<Onglet>("creneaux");

  return (
    <PageLayout titre="Rendez-vous"
      description="Gérez les créneaux et consultez les rendez-vous pris.">
      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
        <button onClick={() => setOnglet("creneaux")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            onglet === "creneaux" ? "bg-primary-500 text-white"
              : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}>
          <Clock size={15} />Créneaux
        </button>
        <button onClick={() => setOnglet("rdvs")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            onglet === "rdvs" ? "bg-primary-500 text-white"
              : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}>
          <CalendarDays size={15} />Rendez-vous
        </button>
      </div>

      {onglet === "creneaux" && <OngletCreneaux />}
      {onglet === "rdvs" && <OngletRdvs />}
    </PageLayout>
  );
}

function OngletCreneaux() {
  const { afficher } = useToast();
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [modale, setModale] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [action, setAction] = useState<number | null>(null);

  const [form, setForm] = useState({
    date_creneau: "", heure_debut: "08:00", heure_fin: "12:00", capacite_max: "5",
  });

  const charger = useCallback(async () => {
    setChargement(true); setErreur(null);
    try { setCreneaux(await obtenirCreneaux()); }
    catch (err) { setErreur(extraireMessageErreur(err)); setCreneaux([]); }
    finally { setChargement(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function valider(e: FormEvent) {
    e.preventDefault();
    setFormErreur("");
    if (!form.date_creneau) { setFormErreur("La date est obligatoire."); return; }
    if (form.heure_debut >= form.heure_fin) {
      setFormErreur("L'heure de fin doit être après l'heure de début."); return;
    }
    setEnregistrement(true);
    try {
      await creerCreneau({
        date_creneau: form.date_creneau,
        heure_debut: form.heure_debut + ":00",
        heure_fin: form.heure_fin + ":00",
        capacite_max: Number(form.capacite_max),
      });
      afficher("Créneau créé", "success");
      setModale(false);
      setForm({ date_creneau: "", heure_debut: "08:00", heure_fin: "12:00", capacite_max: "5" });
      await charger();
    } catch (err) {
      const msg = extraireMessageErreur(err);
      setFormErreur(msg);
      afficher("Échec de la création", "danger", msg);
    } finally { setEnregistrement(false); }
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer ce créneau ? Cette action est irréversible.")) return;
    setAction(id);
    try {
      await supprimerCreneau(id);
      afficher("Créneau supprimé", "success");
      await charger();
    } catch (err) {
      const msg = extraireMessageErreur(err);
      if (msg.toLowerCase().includes("rendez-vous") || msg.includes("RDV_LIES")) {
        const confirme = confirm(
          "Ce créneau a des rendez-vous liés et ne peut pas être supprimé.\n\n" +
          "Voulez-vous le désactiver à la place ?\n" +
          "(Il ne sera plus proposé aux donneurs, mais les RDV existants restent valides)");
        if (confirme) {
          try {
            await desactiverCreneau(id);
            afficher("Créneau désactivé", "success");
            await charger();
          } catch (err2) {
            afficher("Échec de la désactivation", "danger", extraireMessageErreur(err2));
          }
        }
      } else { afficher("Échec", "danger", msg); }
    } finally { setAction(null); }
  }

  async function basculerActivation(c: Creneau) {
    setAction(c.id);
    try {
      await desactiverCreneau(c.id);
      afficher(estActif(c) ? "Créneau désactivé" : "Créneau réactivé", "success");
      await charger();
    } catch (err) {
      afficher("Échec", "danger", extraireMessageErreur(err));
    } finally { setAction(null); }
  }

  return (
    <>
      <div className="mb-4 flex justify-end gap-2">
        <Button variante="outline" iconeGauche={<RefreshCw size={16} />}
          onClick={charger} disabled={chargement}>
          Actualiser
        </Button>
        <CanDo action="rdv.creer_creneau">
          <Button iconeGauche={<CalendarPlus size={16} />} onClick={() => setModale(true)}>
            Nouveau créneau
          </Button>
        </CanDo>
      </div>

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">Impossible de charger les créneaux</p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={charger}>Réessayer</Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (<Card><Loader texte="Chargement des créneaux…" /></Card>)}

      {!chargement && !erreur && creneaux.length === 0 && (
        <Card>
          <EmptyState icone={<Clock size={22} />}
            titre="Aucun créneau"
            description="Créez un créneau pour permettre aux donneurs de prendre rendez-vous."
            action={
              <CanDo action="rdv.creer_creneau">
                <Button iconeGauche={<CalendarPlus size={16} />} onClick={() => setModale(true)}>
                  Nouveau créneau
                </Button>
              </CanDo>
            } />
        </Card>
      )}

      {!chargement && !erreur && creneaux.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creneaux.map((c) => {
            const actif = estActif(c);
            const places = placesDisponibles(c);
            const pct = tauxRemplissage(c);
            const rdvLies = c.capacite_max - places;

            return (
              <Card key={c.id} hoverable>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400">
                      {new Date(c.date_creneau).toLocaleDateString("fr-FR", { weekday: "long" })}
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {new Date(c.date_creneau).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "long",
                      })}
                    </p>
                  </div>
                  <Badge variante={actif ? "success" : "neutral"}>
                    {actif ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <Clock size={14} />
                  {formatHeure(c.heure_debut)} → {formatHeure(c.heure_fin)}
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                      <Users size={12} />{places}/{c.capacite_max} place{places > 1 ? "s" : ""}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className="h-full rounded-full bg-primary-500 transition-all"
                      style={{ width: `${pct}%` }} />
                  </div>
                  {rdvLies > 0 && (
                    <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {rdvLies} RDV lié{rdvLies > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <CanDo action="rdv.creer_creneau">
                  <div className="mt-4 flex justify-end gap-1 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <button aria-label={actif ? "Désactiver" : "Réactiver"}
                      title={actif ? "Désactiver" : "Réactiver"}
                      onClick={() => basculerActivation(c)} disabled={action === c.id}
                      className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-200">
                      <Power size={15} />
                    </button>
                    <button aria-label="Supprimer" title="Supprimer"
                      onClick={() => supprimer(c.id)} disabled={action === c.id}
                      className="rounded-lg p-2 text-neutral-400 transition hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50 dark:hover:bg-danger-500/10">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </CanDo>
              </Card>
            );
          })}
        </div>
      )}

      <Modal ouverte={modale} onFermer={() => setModale(false)}
        titre="Nouveau créneau"
        description="Créez un créneau horaire pour les rendez-vous."
        footer={
          <>
            <Button variante="ghost" onClick={() => setModale(false)}>Annuler</Button>
            <Button iconeGauche={<Save size={16} />} chargement={enregistrement}
              type="submit" form="form-creneau">
              Créer
            </Button>
          </>
        }>
        <form id="form-creneau" onSubmit={valider} className="space-y-4">
          <FormField label="Date" obligatoire>
            <Input type="date" required value={form.date_creneau}
              onChange={(e) => setForm({ ...form, date_creneau: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Heure de début" obligatoire>
              <Input type="time" required value={form.heure_debut}
                onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} />
            </FormField>
            <FormField label="Heure de fin" obligatoire>
              <Input type="time" required value={form.heure_fin}
                onChange={(e) => setForm({ ...form, heure_fin: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Capacité maximale" obligatoire>
            <Input type="number" min={1} required value={form.capacite_max}
              onChange={(e) => setForm({ ...form, capacite_max: e.target.value })} />
          </FormField>
          <FormError message={formErreur} />
        </form>
      </Modal>
    </>
  );
}

function OngletRdvs() {
  const { afficher } = useToast();
  const [rdvs, setRdvs] = useState<Rdv[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [action, setAction] = useState<number | null>(null);

  const charger = useCallback(async () => {
    setChargement(true); setErreur(null);
    try { setRdvs(await obtenirRdvs()); }
    catch (err) { setErreur(extraireMessageErreur(err)); setRdvs([]); }
    finally { setChargement(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function gererAction(id: number, a: "confirmer" | "honorer" | "annuler") {
    setAction(id);
    try {
      if (a === "confirmer") await confirmerRdv(id);
      else if (a === "honorer") await honorerRdv(id);
      else await annulerRdv(id);
      afficher("Rendez-vous mis à jour", "success");
      await charger();
    } catch (err) {
      afficher("Échec", "danger", extraireMessageErreur(err));
    } finally { setAction(null); }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variante="outline" iconeGauche={<RefreshCw size={16} />}
          onClick={charger} disabled={chargement}>
          Actualiser
        </Button>
      </div>

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">Impossible de charger les rendez-vous</p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={charger}>Réessayer</Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (<Card><Loader texte="Chargement des rendez-vous…" /></Card>)}

      {!chargement && !erreur && rdvs.length === 0 && (
        <Card>
          <EmptyState icone={<CalendarDays size={22} />}
            titre="Aucun rendez-vous"
            description="Les rendez-vous pris par les donneurs apparaîtront ici." />
        </Card>
      )}

      {!chargement && !erreur && rdvs.length > 0 && (
        <Card>
          <CardTitle>Rendez-vous</CardTitle>
          <CardDescription className="mb-4">
            Confirmez ou marquez comme honorés les rendez-vous.
          </CardDescription>
          <div>
            {rdvs.map((r) => (
              <div key={r.id}
                className="flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {nomCompletDonneurRdv(r)}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={11} />{dateRdv(r)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />{heureRdv(r)}
                      </span>
                    </div>
                    {r.commentaire && (
                      <p className="mt-1 text-xs italic text-neutral-500">« {r.commentaire} »</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variante={varianteStatutRdv(r.statut)}>
                    {libelleStatutRdv(r.statut)}
                  </Badge>

                  {r.statut === "PLANIFIE" && (
                    <CanDo action="rdv.confirmer">
                      <Button taille="sm" variante="outline" iconeGauche={<Check size={14} />}
                        onClick={() => gererAction(r.id, "confirmer")} disabled={action === r.id}>
                        Confirmer
                      </Button>
                    </CanDo>
                  )}

                  {r.statut === "CONFIRME" && (
                    <CanDo action="rdv.honorer">
                      <Button taille="sm" variante="primary" iconeGauche={<Check size={14} />}
                        onClick={() => gererAction(r.id, "honorer")} disabled={action === r.id}>
                        Marquer honoré
                      </Button>
                    </CanDo>
                  )}

                  {(r.statut === "PLANIFIE" || r.statut === "CONFIRME") && (
                    <CanDo action="rdv.annuler">
                      <Button taille="sm" variante="ghost" iconeGauche={<Ban size={14} />}
                        onClick={() => gererAction(r.id, "annuler")} disabled={action === r.id}>
                        Annuler
                      </Button>
                    </CanDo>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}