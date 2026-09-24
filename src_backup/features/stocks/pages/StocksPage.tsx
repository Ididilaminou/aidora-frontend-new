// ============================================================
// AIDORA — PAGE STOCKS
// ============================================================

import {
  Droplets,
  RefreshCw,
  AlertTriangle,
  Package,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useStocks } from "../hooks/useStocks";
import {
  formatGroupe,
  formatTypeProduit,
  estEnAlerte,
  type Stock,
} from "../../../types/banque";

// ------------------------------------------------------------
// Couleur du badge selon le groupe sanguin
// ------------------------------------------------------------
function varianteGroupe(groupe: string): "primary" | "success" | "warning" | "info" | "danger" {
  if (groupe.startsWith("O")) return "danger";
  if (groupe.startsWith("A")) return "primary";
  if (groupe.startsWith("B")) return "info";
  return "warning";
}

// ------------------------------------------------------------
// Carte d'un stock
// ------------------------------------------------------------
function CarteStock({ stock }: { stock: Stock }) {
  const groupe = formatGroupe(stock.groupe_sanguin, stock.rhesus);
  const enAlerte = estEnAlerte(stock);
  const pourcentage = Math.min(100, (stock.quantite / Math.max(stock.seuil_alerte, 1)) * 100);

  return (
    <Card hoverable className={enAlerte ? "border-warning-500/40" : undefined}>
      <div className="flex items-start justify-between">
        <div>
          <Badge variante={varianteGroupe(stock.groupe_sanguin)}>{groupe}</Badge>
          <p className="mt-3 text-3xl font-bold text-neutral-900 dark:text-white">
            {stock.quantite}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
            unité{stock.quantite > 1 ? "s" : ""} disponible{stock.quantite > 1 ? "s" : ""}
          </p>
        </div>
        <div
          className={
            enAlerte
              ? "flex h-11 w-11 items-center justify-center rounded-xl bg-warning-50 text-warning-700"
              : "flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600"
          }
        >
          <Droplets size={20} />
        </div>
      </div>

      {/* Barre de progression quantite / seuil */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className={
              enAlerte
                ? "h-full rounded-full bg-warning-500 transition-all"
                : "h-full rounded-full bg-success-500 transition-all"
            }
            style={{ width: `${pourcentage}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
            Seuil : <span className="font-medium">{stock.seuil_alerte}</span>
          </span>
          {enAlerte ? (
            <Badge variante="warning">
              <AlertTriangle size={11} />
              Seuil bas
            </Badge>
          ) : (
            <Badge variante="success">OK</Badge>
          )}
        </div>
      </div>

      {/* Méta */}
      <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3 text-xs">
        <div className="flex justify-between">
          <span className="text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Type</span>
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {formatTypeProduit(stock.type_produit)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="shrink-0 text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Établissement</span>
          <span className="truncate text-right font-medium text-neutral-700 dark:text-neutral-300">
            {stock.etablissement_nom}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Mise à jour</span>
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {new Date(stock.date_mise_a_jour).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// PAGE
// ============================================================

export function StocksPage() {
  const { stocks, total, chargement, erreur, recharger } = useStocks();

  const nbAlertes = stocks.filter(estEnAlerte).length;

  return (
    <PageLayout
      titre="Stocks de sang"
      description={`${total} référence${total > 1 ? "s" : ""} dans votre établissement.`}
      actions={
        <Button
          variante="outline"
          iconeGauche={<RefreshCw size={16} />}
          onClick={recharger}
          disabled={chargement}
        >
          Actualiser
        </Button>
      }
    >
      {/* Bandeau alerte */}
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

      {/* Erreur */}
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les stocks
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
          <Loader texte="Chargement des stocks…" />
        </Card>
      )}

      {/* Vide */}
      {!chargement && !erreur && stocks.length === 0 && (
        <Card>
          <EmptyState
            icone={<Package size={22} />}
            titre="Aucun stock enregistré"
            description="Les stocks de votre établissement apparaîtront ici."
          />
        </Card>
      )}

      {/* Grille */}
      {!chargement && !erreur && stocks.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stocks.map((stock) => (
              <CarteStock key={stock.id} stock={stock} />
            ))}
          </div>

          {/* Résumé */}
          <Card className="mt-6">
            <CardTitle>Résumé</CardTitle>
            <CardDescription className="mb-4">
              Synthèse de vos stocks actuels.
            </CardDescription>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Références</p>
                <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                  {stocks.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Unités totales</p>
                <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                  {stocks.reduce((s, x) => s + x.quantite, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">En alerte</p>
                <p className="mt-1 text-xl font-bold text-warning-700">
                  {nbAlertes}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Groupes</p>
                <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                  {new Set(stocks.map((s) => formatGroupe(s.groupe_sanguin, s.rhesus))).size}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </PageLayout>
  );
}