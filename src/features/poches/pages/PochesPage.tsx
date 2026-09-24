// ============================================================
// AIDORA — PAGE POCHES (numérisation + vue par lots)
// ============================================================

import { useState, useCallback, useEffect, type FormEvent } from "react";
import {
  Package, RefreshCw, AlertTriangle, Droplets, Calendar, Clock,
  Settings2, Trash2, Save, Layers, FileText, Boxes, ChevronDown, ChevronUp,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Modal } from "../../../components/ui/Modal";
import { Select } from "../../../components/ui/Select";
import { Input } from "../../../components/ui/Input";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import { usePoches } from "../hooks/usePoches";
import { changerStatutPoche, supprimerPoche, creerPoche, obtenirLots } from "../api";
import { useToast } from "../../../hooks/useToast";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import { CanDo } from "../../../components/auth/CanDo";
import {
  groupePoche, datePeremption, joursRestants, libelleStatutPoche,
  varianteStatutPoche, formatTypeProduit, STATUTS_POCHE,
  type Poche, type LotPoche,
} from "../../../types/poche";

const FILTRES = [
  { value: "", label: "Toutes" },
  { value: "EN_CONTROLE", label: "En contrôle" },
  { value: "DISPONIBLE", label: "Disponibles" },
  { value: "RESERVEE", label: "Réservées" },
  { value: "VENDUE", label: "Vendues" },
  { value: "PERIMEE", label: "Périmées" },
] as const;

export function PochesPage() {
  const { utilisateur } = useAuth();
  const { afficher } = useToast();

  const [onglet, setOnglet] = useState<"poches" | "lots">("poches");
  const [statut, setStatut] = useState("");
  const { poches, total, chargement, erreur, recharger } = usePoches(
    statut ? { statut } : {}
  );
  const [action, setAction] = useState<number | null>(null);

  const [lots, setLots] = useState<LotPoche[]>([]);
  const [chargementLots, setChargementLots] = useState(false);
  const [lotOuvert, setLotOuvert] = useState<string | null>(null);

  const [modaleStatut, setModaleStatut] = useState(false);
  const [pocheCible, setPocheCible] = useState<Poche | null>(null);
  const [nouveauStatut, setNouveauStatut] = useState("DISPONIBLE");
  const [commentaire, setCommentaire] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [formErreur, setFormErreur] = useState("");

  const [modaleLot, setModaleLot] = useState(false);
  const [enregistrementLot, setEnregistrementLot] = useState(false);
  const [formErreurLot, setFormErreurLot] = useState("");
  const [progressionLot, setProgressionLot] = useState({ fait: 0, total: 0 });

  const [formLot, setFormLot] = useState({
    nombre: "10", groupe_sanguin: "O", rhesus: "POSITIF",
    type_produit: "SANG_TOTAL", volume: "450",
    date_collecte: new Date().toISOString().split("T")[0],
    date_peremption: "", statut_initial: "EN_CONTROLE",
  });

  const perimees = poches.filter((p) => p.statut === "PERIMEE").length;
  const controle = poches.filter((p) => p.statut === "EN_CONTROLE").length;

  const chargerLots = useCallback(async () => {
    setChargementLots(true);
    try { setLots(await obtenirLots()); }
    catch { setLots([]); }
    finally { setChargementLots(false); }
  }, []);

  useEffect(() => {
    if (onglet === "lots") chargerLots();
  }, [onglet, chargerLots]);

  function ouvrirChangementStatut(poche: Poche) {
    setPocheCible(poche);
    setNouveauStatut(poche.statut || "DISPONIBLE");
    setCommentaire(""); setFormErreur("");
    setModaleStatut(true);
  }

  async function validerStatut() {
    if (!pocheCible) return;
    setEnregistrement(true); setFormErreur("");
    try {
      await changerStatutPoche(pocheCible.id, nouveauStatut, commentaire || undefined);
      afficher("Statut modifié", "success");
      setModaleStatut(false); setPocheCible(null);
      await recharger();
      if (onglet === "lots") await chargerLots();
    } catch (err) { setFormErreur(extraireMessageErreur(err)); }
    finally { setEnregistrement(false); }
  }

  async function supprimer(poche: Poche) {
    if (!confirm(`Supprimer la poche ${poche.code_poche} ?`)) return;
    setAction(poche.id);
    try {
      await supprimerPoche(poche.id);
      afficher("Poche supprimée", "success");
      await recharger();
      if (onglet === "lots") await chargerLots();
    } catch (err) {
      afficher("Suppression échouée", "danger", extraireMessageErreur(err));
    } finally { setAction(null); }
  }

  function ouvrirLot() {
    const dateCollecte = new Date().toISOString().split("T")[0];
    const datePeremption = new Date();
    datePeremption.setDate(datePeremption.getDate() + 42);
    setFormLot({
      nombre: "10", groupe_sanguin: "O", rhesus: "POSITIF",
      type_produit: "SANG_TOTAL", volume: "450",
      date_collecte: dateCollecte,
      date_peremption: datePeremption.toISOString().split("T")[0],
      statut_initial: "EN_CONTROLE",
    });
    setFormErreurLot(""); setProgressionLot({ fait: 0, total: 0 });
    setModaleLot(true);
  }

  async function validerLot(e: FormEvent) {
    e.preventDefault();
    setFormErreurLot("");
    const nombre = Number(formLot.nombre);
    if (!nombre || nombre < 1 || nombre > 500) {
      setFormErreurLot("Le nombre doit être entre 1 et 500."); return;
    }
    if (!formLot.date_peremption) {
      setFormErreurLot("La date de péremption est obligatoire."); return;
    }
    if (new Date(formLot.date_peremption) <= new Date(formLot.date_collecte)) {
      setFormErreurLot("La date de péremption doit être après la date de collecte."); return;
    }
    if (!utilisateur?.etablissement_id) {
      setFormErreurLot("Aucun établissement associé à votre compte."); return;
    }
    setEnregistrementLot(true);
    setProgressionLot({ fait: 0, total: nombre });
    const prefixe = `PCH-${utilisateur.etablissement_id}-${Date.now().toString().slice(-6)}`;
    let succes = 0;
    let echecs = 0;
    for (let i = 0; i < nombre; i++) {
      const code = `${prefixe}-${String(i + 1).padStart(3, "0")}`;
      try {
        await creerPoche({
          code_poche: code,
          groupe_sanguin: formLot.groupe_sanguin,
          rhesus: formLot.rhesus,
          type_produit: formLot.type_produit,
          volume: Number(formLot.volume),
          date_collecte: formLot.date_collecte,
          date_peremption: formLot.date_peremption,
          etablissement_id: utilisateur.etablissement_id,
          statut: formLot.statut_initial,
        });
        succes++;
      } catch (err) {
        echecs++;
        console.warn(`Échec poche ${code}:`, extraireMessageErreur(err));
      }
      setProgressionLot({ fait: i + 1, total: nombre });
    }
    if (succes > 0) {
      afficher(`${succes} poche${succes > 1 ? "s" : ""} créée${succes > 1 ? "s" : ""}`,
        "success", echecs > 0 ? `${echecs} échec${echecs > 1 ? "s" : ""}` : undefined);
      setModaleLot(false);
      await recharger();
      if (onglet === "lots") await chargerLots();
    } else {
      setFormErreurLot("Aucune poche n'a pu être créée. Vérifiez les données.");
    }
    setEnregistrementLot(false);
    setProgressionLot({ fait: 0, total: 0 });
  }

  return (
    <PageLayout
      titre="Poches de sang"
      description={`${total} poche${total > 1 ? "s" : ""} tracée${total > 1 ? "s" : ""}.`}
      actions={
        <>
          <Button variante="outline" iconeGauche={<RefreshCw size={16} />}
            onClick={() => { recharger(); if (onglet === "lots") chargerLots(); }}
            disabled={chargement || chargementLots}>
            Actualiser
          </Button>
          <CanDo action="poche.creer">
            <Button iconeGauche={<Layers size={16} />} onClick={ouvrirLot}>
              Lot de poches
            </Button>
          </CanDo>
        </>
      }
    >
      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
        <button onClick={() => setOnglet("poches")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            onglet === "poches" ? "bg-primary-500 text-white"
              : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}>
          <Package size={15} />Poches
        </button>
        <button onClick={() => setOnglet("lots")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            onglet === "lots" ? "bg-primary-500 text-white"
              : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}>
          <Boxes size={15} />Lots
        </button>
      </div>

      {onglet === "poches" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTRES.map((f) => (
              <button key={f.value} onClick={() => setStatut(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  statut === f.value ? "bg-primary-500 text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {!chargement && !erreur && poches.length > 0 && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <Card>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total</p>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{total}</p>
              </Card>
              <Card>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">En contrôle</p>
                <p className="mt-1 text-2xl font-bold text-info-700">{controle}</p>
              </Card>
              <Card>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Périmées</p>
                <p className="mt-1 text-2xl font-bold text-danger-700">{perimees}</p>
              </Card>
            </div>
          )}

          {erreur && (
            <Card className="mb-4 border-danger-500/30 bg-danger-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-danger-700">Impossible de charger les poches</p>
                  <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
                </div>
                <Button variante="outline" taille="sm" onClick={recharger}>Réessayer</Button>
              </div>
            </Card>
          )}

          {chargement && !erreur && (<Card><Loader texte="Chargement des poches…" /></Card>)}

          {!chargement && !erreur && poches.length === 0 && (
            <Card>
              <EmptyState icone={<Package size={22} />}
                titre="Aucune poche"
                description="Numérisez vos premières poches pour démarrer."
                action={
                  <CanDo action="poche.creer">
                    <Button iconeGauche={<Layers size={16} />} onClick={ouvrirLot}>
                      Lot de poches
                    </Button>
                  </CanDo>
                } />
            </Card>
          )}

          {!chargement && !erreur && poches.length > 0 && (
            <Card>
              <CardTitle>Liste des poches</CardTitle>
              <CardDescription className="mb-4">
                Chaque poche est tracée de son prélèvement à son utilisation.
              </CardDescription>
              <div>
                {poches.map((p) => {
                  const jours = joursRestants(p);
                  const bientot = jours !== null && jours <= 7 && jours > 0 && p.statut === "DISPONIBLE";
                  return (
                    <div key={p.id}
                      className="flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 lg:flex-row lg:items-center lg:justify-between dark:border-neutral-800">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-lg font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
                          {groupePoche(p)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                            {p.code_poche}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="inline-flex items-center gap-1">
                              <Droplets size={11} />{formatTypeProduit(p.type_produit)}
                            </span>
                            <span>·</span>
                            <span className="font-medium text-neutral-700 dark:text-neutral-300">
                              {p.volume ?? 0} ml
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={11} />Exp. {datePeremption(p)}
                            </span>
                            {p.don_id ? (
                              <Badge variante="info"><FileText size={11} />Don #{p.don_id}</Badge>
                            ) : (
                              <Badge variante="neutral"><Layers size={11} />Manuel</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {bientot && (
                          <Badge variante="warning"><Clock size={11} />Expire dans {jours}j</Badge>
                        )}
                        <Badge variante={varianteStatutPoche(p.statut)}>
                          {libelleStatutPoche(p.statut)}
                        </Badge>
                        <CanDo action="poche.changer_statut">
                          <Button taille="sm" variante="outline"
                            iconeGauche={<Settings2 size={13} />}
                            onClick={() => ouvrirChangementStatut(p)}
                            disabled={action === p.id}>
                            Statut
                          </Button>
                        </CanDo>
                        <CanDo action="poche.supprimer">
                          <button aria-label="Supprimer" onClick={() => supprimer(p)}
                            disabled={action === p.id}
                            className="rounded-lg p-2 text-neutral-400 transition hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50 dark:hover:bg-danger-500/10">
                            <Trash2 size={15} />
                          </button>
                        </CanDo>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}

      {onglet === "lots" && (
        <VueLots lots={lots} chargement={chargementLots} lotOuvert={lotOuvert}
          onToggleLot={(prefixe) => setLotOuvert((p) => (p === prefixe ? null : prefixe))} />
      )}

      {/* MODALE STATUT */}
      <Modal ouverte={modaleStatut}
        onFermer={() => { setModaleStatut(false); setPocheCible(null); }}
        titre="Changer le statut"
        description="Modifiez l'état de cette poche dans son cycle de vie."
        footer={
          <>
            <Button variante="ghost"
              onClick={() => { setModaleStatut(false); setPocheCible(null); }}>
              Annuler
            </Button>
            <Button iconeGauche={<Save size={16} />} chargement={enregistrement}
              onClick={validerStatut}>
              Valider
            </Button>
          </>
        }>
        {pocheCible && (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="font-mono font-semibold text-neutral-900 dark:text-white">
                {pocheCible.code_poche}
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {groupePoche(pocheCible)} — {formatTypeProduit(pocheCible.type_produit)} — {pocheCible.volume} ml
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Statut actuel : <strong>{libelleStatutPoche(pocheCible.statut)}</strong>
              </p>
            </div>
            <FormField label="Nouveau statut" obligatoire>
              <Select value={nouveauStatut}
                onChange={(e) => setNouveauStatut(e.target.value)}
                options={STATUTS_POCHE.map((s) => ({ value: s.value, label: s.label }))} />
            </FormField>
            <FormField label="Commentaire" aide="Traçabilité interne.">
              <Input value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Ex : contrôle qualité terminé" />
            </FormField>
            <FormError message={formErreur} />
          </div>
        )}
      </Modal>

      {/* MODALE LOT */}
      <Modal ouverte={modaleLot}
        onFermer={() => { if (!enregistrementLot) setModaleLot(false); }}
        titre="Numériser un lot de poches"
        description="Créez plusieurs poches identiques en une seule fois."
        footer={
          <>
            <Button variante="ghost" onClick={() => setModaleLot(false)}
              disabled={enregistrementLot}>
              Annuler
            </Button>
            <Button iconeGauche={<Save size={16} />} chargement={enregistrementLot}
              type="submit" form="form-lot">
              Créer le lot
            </Button>
          </>
        }>
        <form id="form-lot" onSubmit={validerLot} className="space-y-4">
          {enregistrementLot && progressionLot.total > 0 && (
            <div className="rounded-xl border border-primary-500/30 bg-primary-50 p-4">
              <p className="text-sm font-medium text-primary-700">
                Création en cours… {progressionLot.fait}/{progressionLot.total}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${(progressionLot.fait / progressionLot.total) * 100}%` }} />
              </div>
            </div>
          )}
          <FormField label="Nombre de poches" obligatoire>
            <Input type="number" min={1} max={500} required value={formLot.nombre}
              onChange={(e) => setFormLot({ ...formLot, nombre: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Groupe sanguin" obligatoire>
              <Select value={formLot.groupe_sanguin}
                onChange={(e) => setFormLot({ ...formLot, groupe_sanguin: e.target.value })}
                options={[
                  { value: "O", label: "O" }, { value: "A", label: "A" },
                  { value: "B", label: "B" }, { value: "AB", label: "AB" },
                ]} />
            </FormField>
            <FormField label="Rhésus" obligatoire>
              <Select value={formLot.rhesus}
                onChange={(e) => setFormLot({ ...formLot, rhesus: e.target.value })}
                options={[
                  { value: "POSITIF", label: "+ (Positif)" },
                  { value: "NEGATIF", label: "- (Négatif)" },
                ]} />
            </FormField>
          </div>
          <FormField label="Type de produit" obligatoire>
            <Select value={formLot.type_produit}
              onChange={(e) => setFormLot({ ...formLot, type_produit: e.target.value })}
              options={[
                { value: "SANG_TOTAL", label: "Sang total" },
                { value: "PLASMA", label: "Plasma" },
                { value: "PLAQUETTES", label: "Plaquettes" },
                { value: "GLOBULES_ROUGES", label: "Globules rouges" },
              ]} />
          </FormField>
          <FormField label="Volume unitaire (ml)" obligatoire>
            <Input type="number" min={100} max={600} step={10} required value={formLot.volume}
              onChange={(e) => setFormLot({ ...formLot, volume: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date de collecte" obligatoire>
              <Input type="date" required value={formLot.date_collecte}
                onChange={(e) => setFormLot({ ...formLot, date_collecte: e.target.value })} />
            </FormField>
            <FormField label="Date de péremption" obligatoire>
              <Input type="date" required value={formLot.date_peremption}
                onChange={(e) => setFormLot({ ...formLot, date_peremption: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Statut initial" obligatoire>
            <Select value={formLot.statut_initial}
              onChange={(e) => setFormLot({ ...formLot, statut_initial: e.target.value })}
              options={[
                { value: "EN_CONTROLE", label: "En contrôle" },
                { value: "DISPONIBLE", label: "Disponible (compté dans le stock)" },
              ]} />
          </FormField>
          <div className="rounded-xl border border-info-500/30 bg-info-50 p-3 text-xs text-info-700">
            <p className="font-medium">💡 Info</p>
            <p className="mt-1">Les codes de poches seront générés automatiquement (préfixe unique + numéro séquentiel).</p>
          </div>
          <FormError message={formErreurLot} />
        </form>
      </Modal>
    </PageLayout>
  );
}

function VueLots({
  lots, chargement, lotOuvert, onToggleLot,
}: {
  lots: LotPoche[];
  chargement: boolean;
  lotOuvert: string | null;
  onToggleLot: (prefixe: string) => void;
}) {
  if (chargement) return <Card><Loader texte="Chargement des lots…" /></Card>;
  if (lots.length === 0) return (
    <Card>
      <EmptyState icone={<Boxes size={22} />} titre="Aucun lot enregistré"
        description="Les lots apparaîtront après vos premières numérisations." />
    </Card>
  );

  const totalLots = lots.length;
  const lotsAvecDisponibles = lots.filter((l) => l.disponibles > 0).length;
  const lotsEnControle = lots.filter((l) => l.en_controle > 0).length;
  const totalDisponibles = lots.reduce((s, l) => s + l.disponibles, 0);

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><p className="text-xs text-neutral-500 dark:text-neutral-400">Total lots</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{totalLots}</p></Card>
        <Card><p className="text-xs text-neutral-500 dark:text-neutral-400">Avec disponibilité</p>
          <p className="mt-1 text-2xl font-bold text-success-700">{lotsAvecDisponibles}</p></Card>
        <Card><p className="text-xs text-neutral-500 dark:text-neutral-400">En contrôle</p>
          <p className="mt-1 text-2xl font-bold text-info-700">{lotsEnControle}</p></Card>
        <Card><p className="text-xs text-neutral-500 dark:text-neutral-400">Poches disponibles</p>
          <p className="mt-1 text-2xl font-bold text-primary-700">{totalDisponibles}</p></Card>
      </div>

      <div className="space-y-3">
        {lots.map((lot) => {
          const ouvert = lotOuvert === lot.prefixe;
          const groupe = `${lot.groupe_sanguin}${lot.rhesus === "POSITIF" ? "+" : lot.rhesus === "NEGATIF" ? "-" : ""}`;
          const aDesDisponibles = lot.disponibles > 0;

          return (
            <Card key={lot.prefixe} className={aDesDisponibles ? "border-success-500/30" : undefined}>
              <button onClick={() => onToggleLot(lot.prefixe)}
                className="flex w-full items-center justify-between gap-3 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
                    {groupe}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                      {lot.prefixe}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {formatTypeProduit(lot.type_produit)} · {lot.volume_unitaire} ml · Collecté le{" "}
                      {new Date(lot.date_collecte_min).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {aDesDisponibles && (
                    <Badge variante="success"><Package size={11} />{lot.disponibles} dispo</Badge>
                  )}
                  {lot.en_controle > 0 && (<Badge variante="info">{lot.en_controle} contrôle</Badge>)}
                  <Badge variante="neutral">{lot.total} total</Badge>
                  {ouvert ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {ouvert && (
                <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    <StatLot label="Dispo" valeur={lot.disponibles} couleur="text-success-700" />
                    <StatLot label="Contrôle" valeur={lot.en_controle} couleur="text-info-700" />
                    <StatLot label="Réservé" valeur={lot.reservees} couleur="text-warning-700" />
                    <StatLot label="Vendu" valeur={lot.vendues} couleur="text-neutral-700" />
                    <StatLot label="Périmé" valeur={lot.perimees} couleur="text-danger-700" />
                    <StatLot label="Rejeté" valeur={lot.rejetees} couleur="text-danger-700" />
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Expiration la plus tardive :{" "}
                      <strong className="text-neutral-700 dark:text-neutral-300">
                        {new Date(lot.date_peremption_max).toLocaleDateString("fr-FR")}
                      </strong>
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400">
                      Poches de ce lot ({lot.poches.length})
                    </p>
                    <div className="max-h-60 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                      {lot.poches.map((p) => (
                        <div key={p.id}
                          className="flex items-center justify-between border-b border-neutral-100 px-3 py-2 last:border-0 dark:border-neutral-800">
                          <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
                            {p.code_poche}
                          </span>
                          <div className="flex items-center gap-2">
                            {p.don_id && (<Badge variante="info"><FileText size={10} />Don #{p.don_id}</Badge>)}
                            <Badge variante="neutral">{p.statut}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}

function StatLot({ label, valeur, couleur }: { label: string; valeur: number; couleur: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${valeur > 0 ? couleur : "text-neutral-300 dark:text-neutral-700"}`}>
        {valeur}
      </p>
    </div>
  );
}