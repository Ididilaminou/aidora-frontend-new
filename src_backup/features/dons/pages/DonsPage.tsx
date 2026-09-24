// ============================================================
// AIDORA — PAGE DONS
// ============================================================

import { useState } from "react";
import {
  HeartHandshake,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Droplets,
  User,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Avatar } from "../../../components/ui/Avatar";
import { useDons } from "../hooks/useDons";
import { validerDon, rejeterDon } from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import {
  nomCompletDonneur,
  nomCompletPersonnel,
  formatDateDon,
  formatDateHeure,
  formatTypeDon,
  varianteStatut,
  libelleStatut,
  type Don,
} from "../../../types/don";

// ------------------------------------------------------------
// Ligne d'un don
// ------------------------------------------------------------
function LigneDon({
  don,
  onAction,
  enCours,
}: {
  don: Don;
  onAction: (id: number, action: "valider" | "rejeter") => void;
  enCours: boolean;
}) {
  const nom = nomCompletDonneur(don);
  const [prenom, ...reste] = nom.split(" ");
  const personnel = nomCompletPersonnel(don);

  return (
    <div className="flex flex-col gap-4 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      {/* Gauche : donneur */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar taille="md" prenom={prenom} nom={reste.join(" ")} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{nom}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Droplets size={12} />
              {formatTypeDon(don.type_don)}
            </span>
            <span>·</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {don.quantite} ml
            </span>
            <span>·</span>
            <span>{formatDateDon(don)}</span>
          </div>
        </div>
      </div>

      {/* Droite : statut + actions */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Badge variante={varianteStatut(don.statut)}>
          {libelleStatut(don.statut)}
        </Badge>

        {don.statut === "EN_ATTENTE" && (
          <div className="flex gap-1.5">
            <Button
              taille="sm"
              variante="outline"
              iconeGauche={<Check size={14} />}
              onClick={() => onAction(don.id, "valider")}
              disabled={enCours}
              chargement={enCours}
            >
              Valider
            </Button>
            <Button
              taille="sm"
              variante="ghost"
              iconeGauche={<X size={14} />}
              onClick={() => onAction(don.id, "rejeter")}
              disabled={enCours}
            >
              Rejeter
            </Button>
          </div>
        )}
      </div>

      {/* Méta discrète sous la ligne (personnel + créé le) */}
      <div className="hidden text-xs text-neutral-400 dark:text-neutral-500 lg:block lg:w-48 lg:text-right">
        {personnel && (
          <p className="inline-flex items-center gap-1">
            <User size={12} />
            {personnel}
          </p>
        )}
        {don.created_at && (
          <p className="mt-0.5">{formatDateHeure(don.created_at)}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export function DonsPage() {
  const { dons, total, chargement, erreur, recharger } = useDons();
  const { afficher } = useToast();
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);

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
    } finally {
      setActionEnCours(null);
    }
  }

  const enAttente = dons.filter((d) => d.statut === "EN_ATTENTE").length;
  const valides = dons.filter((d) => d.statut === "VALIDE").length;
  const volumeTotal = dons.reduce((s, d) => s + (d.quantite ?? 0), 0);

  return (
    <PageLayout
      titre="Dons"
      description={`${total} don${total > 1 ? "s" : ""} enregistré${total > 1 ? "s" : ""}.`}
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
      {/* Stats rapides */}
      {!chargement && !erreur && dons.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{total}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">En attente</p>
            <p className="mt-1 text-2xl font-bold text-warning-700">
              {enAttente}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Validés</p>
            <p className="mt-1 text-2xl font-bold text-success-700">{valides}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Volume total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
              {(volumeTotal / 1000).toFixed(2)} L
            </p>
          </Card>
        </div>
      )}

      {/* Erreur */}
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les dons
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
          <Loader texte="Chargement des dons…" />
        </Card>
      )}

      {/* Vide */}
      {!chargement && !erreur && dons.length === 0 && (
        <Card>
          <EmptyState
            icone={<HeartHandshake size={22} />}
            titre="Aucun don enregistré"
            description="Les dons de votre établissement apparaîtront ici."
          />
        </Card>
      )}

      {/* Liste */}
      {!chargement && !erreur && dons.length > 0 && (
        <Card>
          <CardTitle>Liste des dons</CardTitle>
          <CardDescription className="mb-4">
            Cliquez sur Valider ou Rejeter pour traiter un don en attente.
          </CardDescription>
          <div>
            {dons.map((don) => (
              <LigneDon
                key={don.id}
                don={don}
                onAction={gererAction}
                enCours={actionEnCours === don.id}
              />
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}