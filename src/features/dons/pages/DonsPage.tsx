// ============================================================
// AIDORA — PAGE DONS
// ============================================================

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  HeartHandshake, RefreshCw, AlertTriangle, Check, X, Droplets,
  User, Plus, Save, Search, Package as PackageIcon, Eye,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
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
import { useDons } from "../hooks/useDons";
import {
  validerDon, rejeterDon, creerDon, rechercherDonneurs,
  obtenirPochesDuDon, type DonneurSimple,
} from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import { CanDo } from "../../../components/auth/CanDo";
import {
  nomCompletDonneur, nomCompletPersonnel, formatDateDon,
  formatDateHeure, formatTypeDon, varianteStatut, libelleStatut,
  type Don, type PocheSimple,
} from "../../../types/don";

const TYPES_DON = [
  { value: "SANG_TOTAL", label: "Sang total" },
  { value: "PLASMA", label: "Plasma" },
  { value: "PLAQUETTES", label: "Plaquettes" },
  { value: "GLOBULES_ROUGES", label: "Globules rouges" },
];

function LigneDon({
  don, onAction, onVoirDetail, enCours,
}: {
  don: Don;
  onAction: (id: number, action: "valider" | "rejeter") => void;
  onVoirDetail: (don: Don) => void;
  enCours: boolean;
}) {
  const nom = nomCompletDonneur(don);
  const [prenom, ...reste] = nom.split(" ");
  const personnel = nomCompletPersonnel(don);

  return (
    <div className="flex flex-col gap-4 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar taille="md" prenom={prenom} nom={reste.join(" ")} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{nom}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <Droplets size={12} />{formatTypeDon(don.type_don)}
            </span>
            <span>·</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{don.quantite} ml</span>
            <span>·</span>
            <span>{formatDateDon(don)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Badge variante={varianteStatut(don.statut)}>{libelleStatut(don.statut)}</Badge>

        {don.nombre_poches !== undefined && don.nombre_poches > 0 && (
          <Badge variante="success">
            <PackageIcon size={11} />
            {don.nombre_poches} poche{don.nombre_poches > 1 ? "s" : ""}
          </Badge>
        )}

        <Button taille="sm" variante="ghost" iconeGauche={<Eye size={14} />}
          onClick={() => onVoirDetail(don)}>
          Détails
        </Button>

        {don.statut === "EN_ATTENTE" && (
          <div className="flex gap-1.5">
            <CanDo action="don.valider">
              <Button taille="sm" variante="outline" iconeGauche={<Check size={14} />}
                onClick={() => onAction(don.id, "valider")} disabled={enCours} chargement={enCours}>
                Valider
              </Button>
            </CanDo>
            <CanDo action="don.rejeter">
              <Button taille="sm" variante="ghost" iconeGauche={<X size={14} />}
                onClick={() => onAction(don.id, "rejeter")} disabled={enCours}>
                Rejeter
              </Button>
            </CanDo>
          </div>
        )}
      </div>

      <div className="hidden text-xs text-neutral-400 lg:block lg:w-48 lg:text-right">
        {personnel && (
          <p className="inline-flex items-center gap-1"><User size={12} />{personnel}</p>
        )}
        {don.created_at && <p className="mt-0.5">{formatDateHeure(don.created_at)}</p>}
      </div>
    </div>
  );
}

export function DonsPage() {
  const { dons, total, chargement, erreur, recharger } = useDons();
  const { afficher } = useToast();
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);

  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [donneurs, setDonneurs] = useState<DonneurSimple[]>([]);
  const [chargementDonneurs, setChargementDonneurs] = useState(false);
  const [recherche, setRecherche] = useState("");

  const [form, setForm] = useState({
    donneur_id: "",
    date_don: new Date().toISOString().split("T")[0],
    type_don: "SANG_TOTAL",
    quantite: "450",
  });

  const [modaleDetail, setModaleDetail] = useState(false);
  const [donSelectionne, setDonSelectionne] = useState<Don | null>(null);
  const [pochesDon, setPochesDon] = useState<PocheSimple[]>([]);
  const [chargementPoches, setChargementPoches] = useState(false);

  async function ouvrirDetail(don: Don) {
    setDonSelectionne(don);
    setPochesDon([]);
    setModaleDetail(true);
    setChargementPoches(true);
    try { setPochesDon(await obtenirPochesDuDon(don.id)); }
    catch { setPochesDon([]); }
    finally { setChargementPoches(false); }
  }

  useEffect(() => {
    if (!modaleOuverte) return;
    (async () => {
      setChargementDonneurs(true);
      try { setDonneurs(await rechercherDonneurs()); }
      catch (err) {
        afficher("Impossible de charger les donneurs", "danger", extraireMessageErreur(err));
        setDonneurs([]);
      } finally { setChargementDonneurs(false); }
    })();
  }, [modaleOuverte, afficher]);

  async function gererAction(id: number, action: "valider" | "rejeter") {
    setActionEnCours(id);
    try {
      if (action === "valider") {
        await validerDon(id);
        afficher("Don validé", "success", "Les poches ont été générées.");
      } else {
        await rejeterDon(id);
        afficher("Don rejeté", "warning");
      }
      await recharger();
    } catch (err) {
      afficher("Action échouée", "danger", extraireMessageErreur(err));
    } finally { setActionEnCours(null); }
  }

  async function validerCreation(e: FormEvent) {
    e.preventDefault();
    setFormErreur("");
    if (!form.donneur_id) { setFormErreur("Sélectionnez un donneur."); return; }
    setEnregistrement(true);
    try {
      await creerDon({
        donneur_id: Number(form.donneur_id),
        date_don: form.date_don,
        type_don: form.type_don,
        quantite: Number(form.quantite),
      });
      afficher("Don enregistré", "success", "En attente de validation.");
      setModaleOuverte(false);
      resetForm();
      await recharger();
    } catch (err) {
      const msg = extraireMessageErreur(err);
      if (msg.toLowerCase().includes("disponible")) {
        setFormErreur(
          "Ce donneur n'est pas disponible pour un don actuellement.\n\n" +
          "💡 Le donneur doit activer son statut « Disponible » depuis son profil avant de pouvoir donner.");
      } else { setFormErreur(msg); }
    } finally { setEnregistrement(false); }
  }

  function resetForm() {
    setForm({
      donneur_id: "",
      date_don: new Date().toISOString().split("T")[0],
      type_don: "SANG_TOTAL",
      quantite: "450",
    });
    setRecherche("");
    setFormErreur("");
  }

  const donneursFiltres = donneurs.filter((d) => {
    if (!recherche) return true;
    const q = recherche.toLowerCase();
    return (
      d.nom?.toLowerCase().includes(q) ||
      d.prenom?.toLowerCase().includes(q) ||
      d.telephone?.includes(q)
    );
  });

  const enAttente = dons.filter((d) => d.statut === "EN_ATTENTE").length;
  const valides = dons.filter((d) => d.statut === "VALIDE").length;
  const volumeTotal = dons.reduce((s, d) => s + (d.quantite ?? 0), 0);

  return (
    <PageLayout
      titre="Dons"
      description={`${total} don${total > 1 ? "s" : ""} enregistré${total > 1 ? "s" : ""}.`}
      actions={
        <>
          <Button variante="outline" iconeGauche={<RefreshCw size={16} />}
            onClick={recharger} disabled={chargement}>
            Actualiser
          </Button>
          <CanDo action="don.creer">
            <Button iconeGauche={<Plus size={16} />} onClick={() => setModaleOuverte(true)}>
              Nouveau don
            </Button>
          </CanDo>
        </>
      }
    >
      {!chargement && !erreur && dons.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{total}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">En attente</p>
            <p className="mt-1 text-2xl font-bold text-warning-700">{enAttente}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Validés</p>
            <p className="mt-1 text-2xl font-bold text-success-700">{valides}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Volume total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
              {(volumeTotal / 1000).toFixed(2)} L
            </p>
          </Card>
        </div>
      )}

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">Impossible de charger les dons</p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={recharger}>Réessayer</Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (<Card><Loader texte="Chargement des dons…" /></Card>)}

      {!chargement && !erreur && dons.length === 0 && (
        <Card>
          <EmptyState icone={<HeartHandshake size={22} />}
            titre="Aucun don enregistré"
            description="Enregistrez votre premier don pour démarrer."
            action={
              <CanDo action="don.creer">
                <Button iconeGauche={<Plus size={16} />} onClick={() => setModaleOuverte(true)}>
                  Nouveau don
                </Button>
              </CanDo>
            } />
        </Card>
      )}

      {!chargement && !erreur && dons.length > 0 && (
        <Card>
          <CardTitle>Liste des dons</CardTitle>
          <CardDescription className="mb-4">
            Validez un don pour générer automatiquement les poches.
          </CardDescription>
          <div>
            {dons.map((don) => (
              <LigneDon key={don.id} don={don} onAction={gererAction}
                onVoirDetail={ouvrirDetail} enCours={actionEnCours === don.id} />
            ))}
          </div>
        </Card>
      )}

      <Modal ouverte={modaleOuverte}
        onFermer={() => { setModaleOuverte(false); resetForm(); }}
        titre="Nouveau don"
        description="Enregistrez un don effectué par un donneur."
        footer={
          <>
            <Button variante="ghost" onClick={() => { setModaleOuverte(false); resetForm(); }}>
              Annuler
            </Button>
            <Button iconeGauche={<Save size={16} />} chargement={enregistrement}
              type="submit" form="form-don">
              Enregistrer
            </Button>
          </>
        }>
        <form id="form-don" onSubmit={validerCreation} className="space-y-4">
          <FormField label="Rechercher un donneur">
            <Input placeholder="Nom, prénom ou téléphone…"
              iconeGauche={<Search size={16} />}
              value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </FormField>

          <FormField label="Donneur" obligatoire>
            {chargementDonneurs ? (
              <div className="flex items-center justify-center rounded-lg border border-neutral-200 py-6 dark:border-neutral-700">
                <Loader taille="sm" />
              </div>
            ) : donneursFiltres.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                Aucun donneur trouvé
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                {donneursFiltres.map((d) => {
                  const selectionne = String(d.id) === form.donneur_id;
                  const groupe = d.groupe_sanguin
                    ? `${d.groupe_sanguin}${d.rhesus === "POSITIF" ? "+" : d.rhesus === "NEGATIF" ? "-" : ""}`
                    : "—";
                  return (
                    <button key={d.id} type="button"
                      onClick={() => setForm({ ...form, donneur_id: String(d.id) })}
                      className={`flex w-full items-center justify-between gap-2 border-b border-neutral-100 px-3 py-2 text-left transition last:border-0 dark:border-neutral-800 ${
                        selectionne ? "bg-primary-50 dark:bg-primary-500/10" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                          {d.prenom} {d.nom}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {d.telephone}{d.email && ` · ${d.email}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variante="primary">{groupe}</Badge>
                        {selectionne && <Check size={16} className="text-primary-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Type de don" obligatoire>
              <Select value={form.type_don}
                onChange={(e) => setForm({ ...form, type_don: e.target.value })}
                options={TYPES_DON} />
            </FormField>
            <FormField label="Quantité (ml)" obligatoire>
              <Input type="number" min={100} max={600} step={50} required
                value={form.quantite}
                onChange={(e) => setForm({ ...form, quantite: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Date du don" obligatoire>
            <Input type="date" required value={form.date_don}
              onChange={(e) => setForm({ ...form, date_don: e.target.value })} />
          </FormField>

          <FormError message={formErreur} />
        </form>
      </Modal>

      <Modal ouverte={modaleDetail}
        onFermer={() => { setModaleDetail(false); setDonSelectionne(null); setPochesDon([]); }}
        titre={`Don #${donSelectionne?.id ?? ""}`}
        description={donSelectionne
          ? `Par ${donSelectionne.donneur_prenom} ${donSelectionne.donneur_nom} — ${donSelectionne.quantite} ml` : ""}
        taille="lg"
        footer={
          <Button variante="ghost"
            onClick={() => { setModaleDetail(false); setDonSelectionne(null); }}>
            Fermer
          </Button>
        }>
        {donSelectionne && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Type</p>
                <p className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-white">
                  {formatTypeDon(donSelectionne.type_don)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Date</p>
                <p className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-white">
                  {formatDateDon(donSelectionne)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Quantité</p>
                <p className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-white">
                  {donSelectionne.quantite} ml
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Statut</p>
                <Badge variante={varianteStatut(donSelectionne.statut)}>
                  {libelleStatut(donSelectionne.statut)}
                </Badge>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Poches générées
              </p>
              {chargementPoches ? (
                <div className="flex justify-center py-6"><Loader taille="sm" /></div>
              ) : pochesDon.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-300 py-6 text-center dark:border-neutral-700">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Aucune poche générée pour ce don.
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    Validez le don pour générer les poches automatiquement.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pochesDon.map((p) => {
                    const groupe = `${p.groupe_sanguin ?? "?"}${p.rhesus === "POSITIF" ? "+" : p.rhesus === "NEGATIF" ? "-" : ""}`;
                    return (
                      <div key={p.id}
                        className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
                            {groupe}
                          </div>
                          <div>
                            <p className="font-mono text-xs font-medium text-neutral-900 dark:text-white">
                              {p.code_poche}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                              {p.volume} ml
                            </p>
                          </div>
                        </div>
                        <Badge variante="info">{p.statut ?? "—"}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}