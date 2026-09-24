// ============================================================
// AIDORA — PAGE STOCKS
// ============================================================

import { useState, type FormEvent } from "react";
import {
  Droplets, RefreshCw, AlertTriangle, Package, Plus, Save,
  Settings2, ArrowDownToLine, Layers,
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
import { useStocks } from "../hooks/useStocks";
import { creerStock, ajouterEntree, ajusterStock, modifierSeuil } from "../api";
import { useToast } from "../../../hooks/useToast";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import { CanDo } from "../../../components/auth/CanDo";
import { formatGroupe, formatTypeProduit, estEnAlerte, type Stock } from "../../../types/banque";

type ActionType = "creer" | "entree" | "ajuster" | "seuil" | null;

function varianteGroupe(groupe: string): "primary" | "success" | "warning" | "info" | "danger" {
  if (groupe.startsWith("O")) return "danger";
  if (groupe.startsWith("A")) return "primary";
  if (groupe.startsWith("B")) return "info";
  return "warning";
}

export function StocksPage() {
  const { stocks, chargement, erreur, recharger } = useStocks();
  const { afficher } = useToast();
  const { utilisateur } = useAuth();

  const [action, setAction] = useState<ActionType>(null);
  const [stockCible, setStockCible] = useState<Stock | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [formErreur, setFormErreur] = useState("");

  const [formCreation, setFormCreation] = useState({
    groupe_sanguin: "O", rhesus: "POSITIF", type_produit: "SANG_TOTAL",
    quantite: "1", seuil_alerte: "5",
  });
  const [formEntree, setFormEntree] = useState({ quantite: "1", motif: "" });
  const [formAjustement, setFormAjustement] = useState({ quantite: "0", motif: "" });
  const [formSeuil, setFormSeuil] = useState({ seuil_alerte: "5" });

  function ouvrirCreation() {
    setFormCreation({
      groupe_sanguin: "O", rhesus: "POSITIF", type_produit: "SANG_TOTAL",
      quantite: "1", seuil_alerte: "5",
    });
    setFormErreur(""); setAction("creer");
  }
  function ouvrirEntree(stock: Stock) {
    setStockCible(stock); setFormEntree({ quantite: "1", motif: "" });
    setFormErreur(""); setAction("entree");
  }
  function ouvrirAjustement(stock: Stock) {
    setStockCible(stock);
    setFormAjustement({ quantite: String(stock.quantite), motif: "" });
    setFormErreur(""); setAction("ajuster");
  }
  function ouvrirSeuil(stock: Stock) {
    setStockCible(stock);
    setFormSeuil({ seuil_alerte: String(stock.seuil_alerte) });
    setFormErreur(""); setAction("seuil");
  }
  function fermerModale() { setAction(null); setStockCible(null); setFormErreur(""); }

  async function valider(e: FormEvent) {
    e.preventDefault();
    setFormErreur("");
    setEnregistrement(true);
    try {
      if (action === "creer") {
        if (!utilisateur?.etablissement_id) {
          setFormErreur("Aucun établissement associé à votre compte."); return;
        }
        await creerStock({
          etablissement_id: utilisateur.etablissement_id,
          groupe_sanguin: formCreation.groupe_sanguin,
          rhesus: formCreation.rhesus,
          type_produit: formCreation.type_produit,
          quantite: Number(formCreation.quantite),
          seuil_alerte: Number(formCreation.seuil_alerte),
        });
        afficher("Stock créé", "success");
      } else if (action === "entree" && stockCible) {
        await ajouterEntree(stockCible.id, {
          quantite: Number(formEntree.quantite),
          motif: formEntree.motif || undefined,
        });
        afficher("Entrée enregistrée", "success");
      } else if (action === "ajuster" && stockCible) {
        await ajusterStock(stockCible.id, {
          quantite: Number(formAjustement.quantite),
          motif: formAjustement.motif || undefined,
        });
        afficher("Stock ajusté", "success");
      } else if (action === "seuil" && stockCible) {
        await modifierSeuil(stockCible.id, Number(formSeuil.seuil_alerte));
        afficher("Seuil modifié", "success");
      }
      fermerModale();
      await recharger();
    } catch (err) { setFormErreur(extraireMessageErreur(err)); }
    finally { setEnregistrement(false); }
  }

  const titreModale = action === "creer" ? "Nouveau stock"
    : action === "entree" ? "Entrée de stock"
    : action === "ajuster" ? "Ajuster le stock"
    : action === "seuil" ? "Seuil d'alerte" : "";
  const descModale = action === "creer" ? "Créez une nouvelle ligne de stock pour un groupe sanguin."
    : action === "entree" ? "Ajoutez des unités à ce stock existant."
    : action === "ajuster" ? "Corrigez la quantité après un inventaire physique."
    : action === "seuil" ? "Définissez le seuil sous lequel une alerte est déclenchée." : "";

  const nbAlertes = stocks.filter(estEnAlerte).length;

  return (
    <PageLayout
      titre="Stocks de sang"
      description={`${stocks.length} référence${stocks.length > 1 ? "s" : ""} dans votre établissement.`}
      actions={
        <>
          <Button variante="outline" iconeGauche={<RefreshCw size={16} />}
            onClick={recharger} disabled={chargement}>
            Actualiser
          </Button>
          <CanDo action="stock.creer">
            <Button iconeGauche={<Plus size={16} />} onClick={ouvrirCreation}>
              Nouveau stock
            </Button>
          </CanDo>
        </>
      }
    >
      {!chargement && nbAlertes > 0 && (
        <Card className="mb-4 border-warning-500/30 bg-warning-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-warning-700" size={20} />
            <div>
              <p className="font-medium text-warning-700">
                {nbAlertes} groupe{nbAlertes > 1 ? "s" : ""} sous le seuil d'alerte
              </p>
              <p className="mt-0.5 text-sm text-warning-700/80">
                Pensez à réapprovisionner ces groupes rapidement.
              </p>
            </div>
          </div>
        </Card>
      )}

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">Impossible de charger les stocks</p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={recharger}>Réessayer</Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (<Card><Loader texte="Chargement des stocks…" /></Card>)}

      {!chargement && !erreur && stocks.length === 0 && (
        <Card>
          <EmptyState icone={<Package size={22} />}
            titre="Aucun stock enregistré"
            description="Créez une première ligne de stock pour démarrer."
            action={
              <CanDo action="stock.creer">
                <Button iconeGauche={<Plus size={16} />} onClick={ouvrirCreation}>
                  Nouveau stock
                </Button>
              </CanDo>
            } />
        </Card>
      )}

      {!chargement && !erreur && stocks.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stocks.map((stock) => {
              const groupe = formatGroupe(stock.groupe_sanguin, stock.rhesus);
              const enAlerte = estEnAlerte(stock);
              const pourcentage = Math.min(100,
                (stock.quantite / Math.max(stock.seuil_alerte, 1)) * 100);

              return (
                <Card key={stock.id} hoverable
                  className={enAlerte ? "border-warning-500/40" : undefined}>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variante={varianteGroupe(stock.groupe_sanguin)}>{groupe}</Badge>
                      <p className="mt-3 text-3xl font-bold text-neutral-900 dark:text-white">
                        {stock.quantite}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        unité{stock.quantite > 1 ? "s" : ""} disponible{stock.quantite > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className={enAlerte
                      ? "flex h-11 w-11 items-center justify-center rounded-xl bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400"
                      : "flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"}>
                      <Droplets size={20} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div className={enAlerte
                        ? "h-full rounded-full bg-warning-500 transition-all"
                        : "h-full rounded-full bg-success-500 transition-all"}
                        style={{ width: `${pourcentage}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Seuil : <span className="font-medium">{stock.seuil_alerte}</span>
                      </span>
                      {enAlerte ? (
                        <Badge variante="warning"><AlertTriangle size={11} />Seuil bas</Badge>
                      ) : (<Badge variante="success">OK</Badge>)}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 dark:text-neutral-400">Type</span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {formatTypeProduit(stock.type_produit)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="shrink-0 text-neutral-500 dark:text-neutral-400">Établissement</span>
                      <span className="truncate text-right font-medium text-neutral-700 dark:text-neutral-300">
                        {stock.etablissement_nom}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 dark:text-neutral-400">Mise à jour</span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {new Date(stock.date_mise_a_jour).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <CanDo action="stock.entree">
                      <Button taille="sm" variante="outline"
                        iconeGauche={<ArrowDownToLine size={13} />}
                        onClick={() => ouvrirEntree(stock)}>
                        Entrée
                      </Button>
                    </CanDo>
                    <CanDo action="stock.ajuster">
                      <Button taille="sm" variante="ghost"
                        iconeGauche={<Layers size={13} />}
                        onClick={() => ouvrirAjustement(stock)}>
                        Ajuster
                      </Button>
                    </CanDo>
                    <CanDo action="stock.seuil">
                      <Button taille="sm" variante="ghost"
                        iconeGauche={<Settings2 size={13} />}
                        onClick={() => ouvrirSeuil(stock)}>
                        Seuil
                      </Button>
                    </CanDo>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="mt-6">
            <CardTitle>Résumé</CardTitle>
            <CardDescription className="mb-4">Synthèse de vos stocks actuels.</CardDescription>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Références</p>
                <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">{stocks.length}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Unités totales</p>
                <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                  {stocks.reduce((s, x) => s + x.quantite, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">En alerte</p>
                <p className="mt-1 text-xl font-bold text-warning-700">{nbAlertes}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Groupes</p>
                <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                  {new Set(stocks.map((s) => formatGroupe(s.groupe_sanguin, s.rhesus))).size}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      <Modal ouverte={action !== null} onFermer={fermerModale}
        titre={titreModale} description={descModale}
        footer={
          <>
            <Button variante="ghost" onClick={fermerModale}>Annuler</Button>
            <Button iconeGauche={<Save size={16} />} chargement={enregistrement}
              type="submit" form="form-stock">
              Valider
            </Button>
          </>
        }>
        <form id="form-stock" onSubmit={valider} className="space-y-4">
          {action === "creer" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Groupe sanguin" obligatoire>
                  <Select value={formCreation.groupe_sanguin}
                    onChange={(e) => setFormCreation({ ...formCreation, groupe_sanguin: e.target.value })}
                    options={[
                      { value: "O", label: "O" }, { value: "A", label: "A" },
                      { value: "B", label: "B" }, { value: "AB", label: "AB" },
                    ]} />
                </FormField>
                <FormField label="Rhésus" obligatoire>
                  <Select value={formCreation.rhesus}
                    onChange={(e) => setFormCreation({ ...formCreation, rhesus: e.target.value })}
                    options={[
                      { value: "POSITIF", label: "+ (Positif)" },
                      { value: "NEGATIF", label: "- (Négatif)" },
                    ]} />
                </FormField>
              </div>
              <FormField label="Type de produit" obligatoire>
                <Select value={formCreation.type_produit}
                  onChange={(e) => setFormCreation({ ...formCreation, type_produit: e.target.value })}
                  options={[
                    { value: "SANG_TOTAL", label: "Sang total" },
                    { value: "PLASMA", label: "Plasma" },
                    { value: "PLAQUETTES", label: "Plaquettes" },
                    { value: "GLOBULES_ROUGES", label: "Globules rouges" },
                  ]} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Quantité initiale" obligatoire>
                  <Input type="number" min={0} required value={formCreation.quantite}
                    onChange={(e) => setFormCreation({ ...formCreation, quantite: e.target.value })} />
                </FormField>
                <FormField label="Seuil d'alerte">
                  <Input type="number" min={1} value={formCreation.seuil_alerte}
                    onChange={(e) => setFormCreation({ ...formCreation, seuil_alerte: e.target.value })} />
                </FormField>
              </div>
            </>
          )}

          {action === "entree" && stockCible && (
            <>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {formatGroupe(stockCible.groupe_sanguin, stockCible.rhesus)} — {formatTypeProduit(stockCible.type_produit)}
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Stock actuel : <strong className="text-neutral-900 dark:text-white">
                    {stockCible.quantite} unité{stockCible.quantite > 1 ? "s" : ""}
                  </strong>
                </p>
              </div>
              <FormField label="Quantité à ajouter" obligatoire>
                <Input type="number" min={1} required value={formEntree.quantite}
                  onChange={(e) => setFormEntree({ ...formEntree, quantite: e.target.value })} />
              </FormField>
              <FormField label="Motif" aide="Ex : nouveau don, réception d'une autre banque…">
                <Input value={formEntree.motif}
                  onChange={(e) => setFormEntree({ ...formEntree, motif: e.target.value })}
                  placeholder="Optionnel" />
              </FormField>
            </>
          )}

          {action === "ajuster" && stockCible && (
            <>
              <div className="rounded-xl border border-warning-500/30 bg-warning-50 p-4">
                <p className="inline-flex items-center gap-2 font-medium text-warning-700">
                  <AlertTriangle size={16} />Cette action remplace la quantité actuelle
                </p>
                <p className="mt-1 text-xs text-warning-700/80">
                  Utilisez cette option après un inventaire physique.
                </p>
              </div>
              <FormField label="Nouvelle quantité" obligatoire>
                <Input type="number" min={0} required value={formAjustement.quantite}
                  onChange={(e) => setFormAjustement({ ...formAjustement, quantite: e.target.value })} />
              </FormField>
              <FormField label="Motif" aide="Ex : inventaire, casse, péremption…">
                <Input value={formAjustement.motif}
                  onChange={(e) => setFormAjustement({ ...formAjustement, motif: e.target.value })}
                  placeholder="Optionnel" />
              </FormField>
            </>
          )}

          {action === "seuil" && stockCible && (
            <>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {formatGroupe(stockCible.groupe_sanguin, stockCible.rhesus)} — {formatTypeProduit(stockCible.type_produit)}
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Seuil actuel : <strong className="text-neutral-900 dark:text-white">{stockCible.seuil_alerte}</strong>
                </p>
              </div>
              <FormField label="Nouveau seuil d'alerte" obligatoire
                aide="Une alerte est déclenchée quand la quantité passe sous ce seuil.">
                <Input type="number" min={1} required value={formSeuil.seuil_alerte}
                  onChange={(e) => setFormSeuil({ seuil_alerte: e.target.value })} />
              </FormField>
            </>
          )}

          <FormError message={formErreur} />
        </form>
      </Modal>
    </PageLayout>
  );
}