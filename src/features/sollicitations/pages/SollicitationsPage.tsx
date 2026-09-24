import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  RefreshCw, AlertTriangle, Plus, Save, Send, Check, X,
  User, Droplets, MapPin, MessageSquare,
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
import {
  obtenirSollicitations, obtenirDonneursCompatibles,
  creerSollicitation, repondreSollicitation,
} from "../api";
import { useToast } from "../../../hooks/useToast";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import {
  libelleStatutSollicitation, varianteStatutSollicitation,
  groupeSollicitation, type Sollicitation, type DonneurCompatible,
} from "../../../types/sollicitation";

export function SollicitationsPage() {
  const { utilisateur } = useAuth();
  const { afficher } = useToast();
  const estBanque = utilisateur?.role === "PERSONNEL_BANQUE" || utilisateur?.role === "ADMINISTRATEUR";

  const [sollicitations, setSollicitations] = useState<Sollicitation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [action, setAction] = useState<number | null>(null);

  // Modale création
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [donneurs, setDonneurs] = useState<DonneurCompatible[]>([]);
  const [chargementDonneurs, setChargementDonneurs] = useState(false);
  const [form, setForm] = useState({ groupe: "O", rhesus: "POSITIF", donneur_id: "", message: "", motif: "" });
  const [envoi, setEnvoi] = useState(false);
  const [formErreur, setFormErreur] = useState("");

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try { setSollicitations(await obtenirSollicitations()); }
    catch (err) { setErreur(extraireMessageErreur(err)); }
    finally { setChargement(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function chercherDonneurs() {
    setChargementDonneurs(true);
    setForm({ ...form, donneur_id: "" });
    try { setDonneurs(await obtenirDonneursCompatibles(form.groupe, form.rhesus)); }
    catch (err) { afficher("Erreur", "danger", extraireMessageErreur(err)); }
    finally { setChargementDonneurs(false); }
  }

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setFormErreur("");
    if (!form.donneur_id) { setFormErreur("Sélectionnez un donneur."); return; }
    setEnvoi(true);
    try {
      await creerSollicitation({
        donneur_id: Number(form.donneur_id),
        message: form.message || undefined,
        motif: form.motif || undefined,
      });
      afficher("Sollicitation envoyée", "success");
      setModaleOuverte(false);
      setForm({ groupe: "O", rhesus: "POSITIF", donneur_id: "", message: "", motif: "" });
      setDonneurs([]);
      await charger();
    } catch (err) { setFormErreur(extraireMessageErreur(err)); }
    finally { setEnvoi(false); }
  }

  async function repondre(id: number, statut: "ACCEPTEE" | "REFUSEE") {
    setAction(id);
    try {
      await repondreSollicitation(id, statut);
      afficher(`Sollicitation ${statut === "ACCEPTEE" ? "acceptée" : "refusée"}`, "success");
      await charger();
    } catch (err) { afficher("Échec", "danger", extraireMessageErreur(err)); }
    finally { setAction(null); }
  }

  return (
    <PageLayout
      titre="Sollicitations"
      description="Recherchez des donneurs compatibles et invitez-les à donner."
      actions={
        <>
          <Button variante="outline" iconeGauche={<RefreshCw size={16} />} onClick={charger} disabled={chargement}>
            Actualiser
          </Button>
          {estBanque && (
            <Button iconeGauche={<Plus size={16} />} onClick={() => setModaleOuverte(true)}>
              Nouvelle sollicitation
            </Button>
          )}
        </>
      }
    >
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <p className="flex-1 text-sm text-danger-700">{erreur}</p>
          </div>
        </Card>
      )}

      {chargement && !erreur && <Card><Loader texte="Chargement…" /></Card>}

      {!chargement && !erreur && sollicitations.length === 0 && (
        <Card>
          <EmptyState
            icone={<Send size={22} />}
            titre="Aucune sollicitation"
            description={estBanque ? "Envoyez votre première sollicitation." : "Vous n'avez pas encore de sollicitation."}
          />
        </Card>
      )}

      {!chargement && !erreur && sollicitations.length > 0 && (
        <Card>
          <CardTitle>Mes sollicitations</CardTitle>
          <CardDescription className="mb-4">{sollicitations.length} au total.</CardDescription>
          <div>
            {sollicitations.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {estBanque ? `${s.donneur_prenom} ${s.donneur_nom}` : s.etablissement_nom}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <Badge variante="primary">{groupeSollicitation(s)}</Badge>
                      {s.donneur_telephone && <span>{s.donneur_telephone}</span>}
                      <span>·</span>
                      <span>{new Date(s.date_sollicitation).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {s.message && (
                      <p className="mt-1 text-xs italic text-neutral-600 dark:text-neutral-400">« {s.message} »</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variante={varianteStatutSollicitation(s.statut)}>
                    {libelleStatutSollicitation(s.statut)}
                  </Badge>
                  {s.statut === "ENVOYEE" && utilisateur?.role === "DONNEUR" && (
                    <>
                      <Button taille="sm" variante="outline" iconeGauche={<Check size={14} />}
                        onClick={() => repondre(s.id, "ACCEPTEE")} disabled={action === s.id}>
                        Accepter
                      </Button>
                      <Button taille="sm" variante="ghost" iconeGauche={<X size={14} />}
                        onClick={() => repondre(s.id, "REFUSEE")} disabled={action === s.id}>
                        Refuser
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modale création */}
      <Modal
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
        titre="Nouvelle sollicitation"
        description="Recherchez un donneur compatible et invitez-le."
        footer={
          <>
            <Button variante="ghost" onClick={() => setModaleOuverte(false)}>Annuler</Button>
            <Button iconeGauche={<Save size={16} />} chargement={envoi} type="submit" form="form-sollicitation">
              Envoyer
            </Button>
          </>
        }
      >
        <form id="form-sollicitation" onSubmit={soumettre} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Groupe sanguin" obligatoire>
              <Select value={form.groupe}
                onChange={(e) => setForm({ ...form, groupe: e.target.value, donneur_id: "" })}
                options={[{ value: "O", label: "O" }, { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "AB", label: "AB" }]} />
            </FormField>
            <FormField label="Rhésus" obligatoire>
              <Select value={form.rhesus}
                onChange={(e) => setForm({ ...form, rhesus: e.target.value, donneur_id: "" })}
                options={[{ value: "POSITIF", label: "+" }, { value: "NEGATIF", label: "-" }]} />
            </FormField>
          </div>

          <Button type="button" variante="outline" onClick={chercherDonneurs} chargement={chargementDonneurs} className="w-full">
            Chercher les donneurs compatibles
          </Button>

          {donneurs.length > 0 && (
            <FormField label="Donneur" obligatoire>
              <div className="max-h-52 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                {donneurs.map((d) => {
                  const groupe = `${d.groupe_sanguin}${d.rhesus === "POSITIF" ? "+" : "-"}`;
                  const selectionne = String(d.donneur_id) === form.donneur_id;
                  return (
                    <button key={d.donneur_id} type="button"
                      onClick={() => setForm({ ...form, donneur_id: String(d.donneur_id) })}
                      className={`flex w-full items-center justify-between gap-2 border-b border-neutral-100 px-3 py-2 text-left transition last:border-0 dark:border-neutral-800 ${
                        selectionne ? "bg-primary-50 dark:bg-primary-500/10" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      }`}>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{d.prenom} {d.nom}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{d.telephone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variante="primary">{groupe}</Badge>
                        {selectionne && <Check size={16} className="text-primary-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </FormField>
          )}

          {!chargementDonneurs && donneurs.length === 0 && form.donneur_id === "" && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              💡 Cliquez sur "Chercher" pour afficher les donneurs disponibles correspondants.
            </p>
          )}

          <FormField label="Message au donneur">
            <textarea rows={3} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Ex : Nous avons besoin de votre groupe en urgence..."
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </FormField>

          <FormField label="Motif">
            <Input value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })}
              placeholder="Ex : Stock critique O+" iconeGauche={<MessageSquare size={16} />} />
          </FormField>

          <FormError message={formErreur} />
        </form>
      </Modal>
    </PageLayout>
  );
}