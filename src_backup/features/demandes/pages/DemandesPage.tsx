// ============================================================
// AIDORA — PAGE DEMANDES
// ============================================================

import { useState } from "react";
import {
  ClipboardList,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Truck,
  PackageCheck,
  MapPin,
  User,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useDemandes } from "../hooks/useDemandes";
import {
  accepterDemande,
  rejeterDemande,
  livrerDemande,
  confirmerReceptionDemande,
} from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import {
  groupeDemande,
  dateDemande,
  varianteStatutDemande,
  libelleStatutDemande,
  varianteUrgence,
  libelleUrgence,
  nomTraitant,
  type Demande,
} from "../../../types/demande";

type Action = "accepter" | "rejeter" | "livrer" | "confirmer-reception";

// ------------------------------------------------------------
// Ligne d'une demande
// ------------------------------------------------------------
function LigneDemande({
  demande,
  onAction,
  enCours,
}: {
  demande: Demande;
  onAction: (id: number, action: Action) => void;
  enCours: boolean;
}) {
  const groupe = groupeDemande(demande);
  const traitant = nomTraitant(demande);

  return (
    <div className="flex flex-col gap-4 border-b border-neutral-100 py-4 last:border-0 lg:flex-row lg:items-center lg:justify-between">
      {/* Gauche : groupe + détails */}
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-lg font-bold text-primary-700">
          {groupe}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {demande.quantite_demandee} unité
              {demande.quantite_demandee > 1 ? "s" : ""}
            </p>
            {demande.urgence > 0 && (
              <Badge variante={varianteUrgence(demande.urgence)}>
                {libelleUrgence(demande.urgence)}
              </Badge>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
            {demande.demandeur_nom && (
              <span className="truncate font-medium text-neutral-700 dark:text-neutral-300">
                {demande.demandeur_nom}
              </span>
            )}
            {demande.demandeur_ville && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={11} />
                  {demande.demandeur_ville}
                </span>
              </>
            )}
            <span>·</span>
            <span>{dateDemande(demande)}</span>
          </div>

          {demande.motif && (
            <p className="mt-1.5 line-clamp-2 text-xs italic text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
              « {demande.motif} »
            </p>
          )}

          {traitant && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
              <User size={11} />
              Traité par {traitant}
            </p>
          )}
        </div>
      </div>

      {/* Droite : statut + actions */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Badge variante={varianteStatutDemande(demande.statut)}>
          {libelleStatutDemande(demande.statut)}
        </Badge>

        {demande.statut === "EN_ATTENTE" && (
          <>
            <Button
              taille="sm"
              variante="outline"
              iconeGauche={<Check size={14} />}
              onClick={() => onAction(demande.id, "accepter")}
              disabled={enCours}
            >
              Accepter
            </Button>
            <Button
              taille="sm"
              variante="ghost"
              iconeGauche={<X size={14} />}
              onClick={() => onAction(demande.id, "rejeter")}
              disabled={enCours}
            >
              Rejeter
            </Button>
          </>
        )}

        {demande.statut === "ACCEPTEE" && (
          <Button
            taille="sm"
            variante="primary"
            iconeGauche={<Truck size={14} />}
            onClick={() => onAction(demande.id, "livrer")}
            disabled={enCours}
          >
            Livrer
          </Button>
        )}

        {demande.statut === "LIVREE" && (
          <Button
            taille="sm"
            variante="outline"
            iconeGauche={<PackageCheck size={14} />}
            onClick={() => onAction(demande.id, "confirmer-reception")}
            disabled={enCours}
          >
            Confirmer réception
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export function DemandesPage() {
  const { demandes, total, chargement, erreur, recharger } = useDemandes();
  const { afficher } = useToast();
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);

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
      afficher("Action échouée", "danger", extraireMessageErreur(err));
    } finally {
      setActionEnCours(null);
    }
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
      {/* Bandeau urgences critiques */}
      {!chargement && critiques > 0 && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-danger-500" size={20} />
            <div>
              <p className="font-medium text-danger-700">
                {critiques} demande{critiques > 1 ? "s" : ""} critique
                {critiques > 1 ? "s" : ""}
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">
                Priorité absolue — traitement immédiat requis.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      {!chargement && !erreur && demandes.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">En attente</p>
            <p className="mt-1 text-2xl font-bold text-warning-700">
              {enAttente}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">En cours</p>
            <p className="mt-1 text-2xl font-bold text-info-700">
              {enCoursCount}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Terminées</p>
            <p className="mt-1 text-2xl font-bold text-success-700">
              {terminees}
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
                Impossible de charger les demandes
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
          <Loader texte="Chargement des demandes…" />
        </Card>
      )}

      {/* Vide */}
      {!chargement && !erreur && demandes.length === 0 && (
        <Card>
          <EmptyState
            icone={<ClipboardList size={22} />}
            titre="Aucune demande"
            description="Les demandes de sang apparaîtront ici."
          />
        </Card>
      )}

      {/* Liste */}
      {!chargement && !erreur && demandes.length > 0 && (
        <Card>
          <CardTitle>Liste des demandes</CardTitle>
          <CardDescription className="mb-4">
            Traitez les demandes en attente, puis suivez les livraisons.
          </CardDescription>
          <div>
            {demandes.map((d) => (
              <LigneDemande
                key={d.id}
                demande={d}
                onAction={gererAction}
                enCours={actionEnCours === d.id}
              />
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}