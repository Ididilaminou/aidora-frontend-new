// ============================================================
// AIDORA — PAGE DEMANDES
// ============================================================

import { useState, useEffect, type FormEvent } from "react";
import {
  ClipboardList, RefreshCw, AlertTriangle, Check, X, Truck,
  PackageCheck, Plus, Save, MapPin, User,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { FormField } from "../../../components/forms/FormField";
import { FormError } from "../../../components/forms/FormError";
import { useDemandes } from "../hooks/useDemandes";
import { CanDo } from "../../../components/auth/CanDo";
import {
  accepterDemande, rejeterDemande, livrerDemande,
  confirmerReceptionDemande, creerDemande,
  obtenirBanquesDestinataires, type BanqueSimple,
} from "../api";
import { useToast } from "../../../hooks/useToast";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import {
  groupeDemande, dateDemande, varianteStatutDemande,
  libelleStatutDemande, varianteUrgence, libelleUrgence,
  nomTraitant, type Demande,
} from "../../../types/demande";

type Action = "accepter" | "rejeter" | "livrer" | "confirmer-reception";

function LigneDemande({
  demande, onAction, enCours,
}: {
  demande: Demande;
  onAction: (id: number, action: Action) => void;
  enCours: boolean;
}) {
  const groupe = groupeDemande(demande);
  const traitant = nomTraitant(demande);

  return (
    <div className="flex flex-col gap-4 border-b border-neutral-100 py-4 last:border-0 lg:flex-row lg:items-center lg:justify-between dark:border-neutral-800">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-lg font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
          {groupe}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {demande.quantite_demandee} unité{demande.quantite_demandee > 1 ? "s" : ""}
            </p>
            {demande.urgence > 0 && (
              <Badge variante={varianteUrgence(demande.urgence)}>
                {libelleUrgence(demande.urgence)}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            {demande.demandeur_nom && (
              <span className="truncate font-medium text-neutral-700 dark:text-neutral-300">
                {demande.demandeur_nom}
              </span>
            )}
            {demande.demandeur_ville && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={11} />{demande.demandeur_ville}
                </span>
              </>
            )}
            <span>·</span>
            <span>{dateDemande(demande)}</span>
          </div>
          {demande.motif && (
            <p className="mt-1.5 line-clamp-2 text-xs italic text-neutral-500 dark:text-neutral-400">
              « {demande.motif} »
            </p>
          )}
          {traitant && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
              <User size={11} />Traité par {traitant}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Badge variante={varianteStatutDemande(demande.statut)}>
          {libelleStatutDemande(demande.statut)}
        </Badge>

        {demande.statut === "EN_ATTENTE" && (
          <>
            <CanDo action="demande.accepter">
              <Button taille="sm" variante="outline" iconeGauche={<Check size={14} />}
                onClick={() => onAction(demande.id, "accepter")} disabled={enCours}>
                Accepter
              </Button>
            </CanDo>
            <CanDo action="demande.rejeter">
              <Button taille="sm" variante="ghost" iconeGauche={<X size={14} />}
                onClick={() => onAction(demande.id, "rejeter")} disabled={enCours}>
                Rejeter
              </Button>
            </CanDo>
          </>
        )}

        {demande.statut === "ACCEPTEE" && (
          <CanDo action="demande.livrer">
            <Button taille="sm" variante="primary" iconeGauche={<Truck size={14} />}
              onClick={() => onAction(demande.id, "livrer")} disabled={enCours}>
              Livrer
            </Button>
          </CanDo>
        )}

        {demande.statut === "LIVREE" && (
          <CanDo action="demande.confirmer_reception">
            <Button taille="sm" variante="outline" iconeGauche={<PackageCheck size={14} />}
              onClick={() => onAction(demande.id, "confirmer-reception")} disabled={enCours}>
              Confirmer réception
            </Button>
          </CanDo>
        )}
      </div>
    </div>
  );
}

export function DemandesPage() {
  const { demandes, total, chargement, erreur, recharger } = useDemandes();
  const { afficher } = useToast();
  const { utilisateur } = useAuth();
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);

  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [banques, setBanques] = useState<BanqueSimple[]>([]);
  const [chargementBanques, setChargementBanques] = useState(false);

  const [form, setForm] = useState({
    groupe_sanguin: "O", rhesus: "POSITIF", type_produit: "SANG_TOTAL",
    quantite_demandee: "1", urgence: "0", motif: "",
    etablissement_destinataire_id: "",
  });

  useEffect(() => {
    if (!modaleOuverte) return;
    if (utilisateur?.role !== "PERSONNEL_HOPITAL") return;
    (async () => {
      setChargementBanques(true);
      try { setBanques(await obtenirBanquesDestinataires()); }
      catch { setBanques([]); }
      finally { setChargementBanques(false); }
    })();
  }, [modaleOuverte, utilisateur?.role]);

  function resetForm() {
    setForm({
      groupe_sanguin: "O", rhesus: "POSITIF", type_produit: "SANG_TOTAL",
      quantite_demandee: "1", urgence: "0", motif: "",
      etablissement_destinataire_id: "",
    });
    setFormErreur("");
  }

  async function validerCreation(e: FormEvent) {
    e.preventDefault();
    setFormErreur("");
    if (Number(form.quantite_demandee) < 1) {
      setFormErreur("La quantité doit être au moins 1.");
      return;
    }
    setEnregistrement(true);
    try {
      await creerDemande({
        groupe_sanguin: form.groupe_sanguin,
        rhesus: form.rhesus,
        type_produit: form.type_produit,
        quantite_demandee: Number(form.quantite_demandee),
        urgence: Number(form.urgence),
        motif: form.motif || undefined,
        etablissement_destinataire_id: form.etablissement_destinataire_id
          ? Number(form.etablissement_destinataire_id)
          : undefined,
      });
      afficher("Demande créée", "success", "En attente de traitement.");
      setModaleOuverte(false);
      resetForm();
      await recharger();
    } catch (err) {
      setFormErreur(extraireMessageErreur(err));
    } finally { setEnregistrement(false); }
  }

  async function gererAction(id: number, action: Action) {
    setActionEnCours(id);
    try {
      switch (action) {
        case "accepter":
          await accepterDemande(id);
          afficher("Demande acceptée", "success");
          break;
        case "rejeter":
          await rejeterDemande(id);
          afficher("Demande rejetée", "warning");
          break;
        case "livrer":
          await livrerDemande(id);
          afficher("Demande livrée", "success");
          break;
        case "confirmer-reception":
          await confirmerReceptionDemande(id);
          afficher("Réception confirmée", "success");
          break;
      }
      await recharger();
    } catch (err) {
      const msg = extraireMessageErreur(err);
      if (msg.toLowerCase().includes("stock insuffisant")) {
        afficher("Stock insuffisant", "warning",
          `${msg}\n\n💡 Ajoutez du stock via la page Stocks ou validez des dons pour générer des poches.`);
      } else {
        afficher("Action échouée", "danger", msg);
      }
    } finally { setActionEnCours(null); }
  }

  const enAttente = demandes.filter((d) => d.statut === "EN_ATTENTE").length;
  const enCoursCount = demandes.filter(
    (d) => d.statut === "ACCEPTEE" || d.statut === "LIVREE"
  ).length;
  const terminees = demandes.filter((d) => d.statut === "RECUE").length;
  const critiques = demandes.filter((d) => d.urgence >= 2).length;

  return (
    <PageLayout
      titre="Demandes de sang"
      description={`${total} demande${total > 1 ? "s" : ""} au total.`}
      actions={
        <>
          <Button variante="outline" iconeGauche={<RefreshCw size={16} />}
            onClick={recharger} disabled={chargement}>
            Actualiser
          </Button>
          <CanDo action="demande.creer">
            <Button iconeGauche={<Plus size={16} />}
              onClick={() => setModaleOuverte(true)}>
              Nouvelle demande
            </Button>
          </CanDo>
        </>
      }
    >
      {!chargement && critiques > 0 && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-danger-500" size={20} />
            <div>
              <p className="font-medium text-danger-700">
                {critiques} demande{critiques > 1 ? "s" : ""} critique{critiques > 1 ? "s" : ""}
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">
                Priorité absolue — traitement immédiat requis.
              </p>
            </div>
          </div>
        </Card>
      )}

      {!chargement && !erreur && demandes.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">En attente</p>
            <p className="mt-1 text-2xl font-bold text-warning-700">{enAttente}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">En cours</p>
            <p className="mt-1 text-2xl font-bold text-info-700">{enCoursCount}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Terminées</p>
            <p className="mt-1 text-2xl font-bold text-success-700">{terminees}</p>
          </Card>
        </div>
      )}

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">Impossible de charger les demandes</p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={recharger}>Réessayer</Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (<Card><Loader texte="Chargement des demandes…" /></Card>)}

      {!chargement && !erreur && demandes.length === 0 && (
        <Card>
          <EmptyState icone={<ClipboardList size={22} />}
            titre="Aucune demande"
            description="Les demandes de sang apparaîtront ici."
            action={
              <CanDo action="demande.creer">
                <Button iconeGauche={<Plus size={16} />} onClick={() => setModaleOuverte(true)}>
                  Nouvelle demande
                </Button>
              </CanDo>
            } />
        </Card>
      )}

      {!chargement && !erreur && demandes.length > 0 && (
        <Card>
          <CardTitle>Liste des demandes</CardTitle>
          <CardDescription className="mb-4">
            Traitez les demandes en attente, puis suivez les livraisons.
          </CardDescription>
          <div>
            {demandes.map((d) => (
              <LigneDemande key={d.id} demande={d} onAction={gererAction}
                enCours={actionEnCours === d.id} />
            ))}
          </div>
        </Card>
      )}

      <Modal ouverte={modaleOuverte}
        onFermer={() => { setModaleOuverte(false); resetForm(); }}
        titre="Nouvelle demande de sang"
        description="Formulez une demande auprès d'une banque de sang."
        footer={
          <>
            <Button variante="ghost"
              onClick={() => { setModaleOuverte(false); resetForm(); }}>
              Annuler
            </Button>
            <Button iconeGauche={<Save size={16} />} chargement={enregistrement}
              type="submit" form="form-demande">
              Envoyer
            </Button>
          </>
        }>
        <form id="form-demande" onSubmit={validerCreation} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Groupe sanguin" obligatoire>
              <Select value={form.groupe_sanguin}
                onChange={(e) => setForm({ ...form, groupe_sanguin: e.target.value })}
                options={[
                  { value: "O", label: "O" }, { value: "A", label: "A" },
                  { value: "B", label: "B" }, { value: "AB", label: "AB" },
                ]} />
            </FormField>
            <FormField label="Rhésus" obligatoire>
              <Select value={form.rhesus}
                onChange={(e) => setForm({ ...form, rhesus: e.target.value })}
                options={[
                  { value: "POSITIF", label: "+ (Positif)" },
                  { value: "NEGATIF", label: "- (Négatif)" },
                ]} />
            </FormField>
          </div>
          <FormField label="Type de produit" obligatoire>
            <Select value={form.type_produit}
              onChange={(e) => setForm({ ...form, type_produit: e.target.value })}
              options={[
                { value: "SANG_TOTAL", label: "Sang total" },
                { value: "PLASMA", label: "Plasma" },
                { value: "PLAQUETTES", label: "Plaquettes" },
                { value: "GLOBULES_ROUGES", label: "Globules rouges" },
              ]} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Quantité (poches)" obligatoire>
              <Input type="number" min={1} required value={form.quantite_demandee}
                onChange={(e) => setForm({ ...form, quantite_demandee: e.target.value })} />
            </FormField>
            <FormField label="Niveau d'urgence">
              <Select value={form.urgence}
                onChange={(e) => setForm({ ...form, urgence: e.target.value })}
                options={[
                  { value: "0", label: "Normale" },
                  { value: "1", label: "Urgente" },
                  { value: "2", label: "Critique" },
                ]} />
            </FormField>
          </div>
          {banques.length > 0 && (
            <FormField label="Banque destinataire (optionnel)">
              {chargementBanques ? (
                <div className="flex items-center justify-center rounded-lg border border-neutral-200 py-3 dark:border-neutral-700">
                  <Loader taille="sm" />
                </div>
              ) : (
                <Select value={form.etablissement_destinataire_id}
                  onChange={(e) => setForm({ ...form, etablissement_destinataire_id: e.target.value })}
                  placeholder="Choisir une banque…"
                  options={banques.map((b) => ({
                    value: String(b.id),
                    label: `${b.nom}${b.ville ? ` (${b.ville})` : ""}`,
                  }))} />
              )}
            </FormField>
          )}
          <FormField label="Motif" aide="Décrivez brièvement la situation.">
            <textarea rows={3} value={form.motif}
              onChange={(e) => setForm({ ...form, motif: e.target.value })}
              placeholder="Ex : Intervention chirurgicale urgente"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500" />
          </FormField>
          <FormError message={formErreur} />
        </form>
      </Modal>
    </PageLayout>
  );
}