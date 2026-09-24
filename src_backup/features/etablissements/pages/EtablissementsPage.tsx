// ============================================================
// AIDORA — PAGE ÉTABLISSEMENTS
// ============================================================

import { useState } from "react";
import {
  Building2,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Ban,
  RotateCcw,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useEtablissements } from "../hooks/useEtablissements";
import {
  validerEtablissement,
  rejeterEtablissement,
  suspendreEtablissement,
  reactiverEtablissement,
} from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import {
  libelleType,
  varianteType,
  libelleStatutEtab,
  varianteStatutEtab,
  localisation,
  estEnAttente,
  estActif,
  type Etablissement,
} from "../../../types/etablissement";

type Action = "valider" | "rejeter" | "suspendre" | "reactiver";

// ------------------------------------------------------------
// Carte
// ------------------------------------------------------------
function CarteEtablissement({
  etab,
  onAction,
  enCours,
}: {
  etab: Etablissement;
  onAction: (id: number, action: Action) => void;
  enCours: boolean;
}) {
  return (
    <Card hoverable>
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Building2 size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-neutral-900 dark:text-white">{etab.nom}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variante={varianteType(etab.type)}>
              {libelleType(etab.type)}
            </Badge>
            <Badge variante={varianteStatutEtab(etab.statut)}>
              {libelleStatutEtab(etab.statut)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2 text-neutral-600 dark:text-neutral-400 dark:text-neutral-500">
          <MapPin size={13} className="mt-0.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
          <span className="truncate">
            {etab.adresse && `${etab.adresse} · `}
            {localisation(etab)}
          </span>
        </div>
        {etab.email && (
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 dark:text-neutral-500">
            <Mail size={13} className="shrink-0 text-neutral-400 dark:text-neutral-500" />
            <span className="truncate">{etab.email}</span>
          </div>
        )}
        {etab.telephone && (
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 dark:text-neutral-500">
            <Phone size={13} className="shrink-0 text-neutral-400 dark:text-neutral-500" />
            <span>{etab.telephone}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
        {estEnAttente(etab) && (
          <>
            <Button
              taille="sm"
              variante="outline"
              iconeGauche={<Check size={14} />}
              onClick={() => onAction(etab.id, "valider")}
              disabled={enCours}
            >
              Valider
            </Button>
            <Button
              taille="sm"
              variante="ghost"
              iconeGauche={<X size={14} />}
              onClick={() => onAction(etab.id, "rejeter")}
              disabled={enCours}
            >
              Rejeter
            </Button>
          </>
        )}

        {estActif(etab) && (
          <Button
            taille="sm"
            variante="ghost"
            iconeGauche={<Ban size={14} />}
            onClick={() => onAction(etab.id, "suspendre")}
            disabled={enCours}
          >
            Suspendre
          </Button>
        )}

        {etab.statut === "SUSPENDU" && (
          <Button
            taille="sm"
            variante="outline"
            iconeGauche={<RotateCcw size={14} />}
            onClick={() => onAction(etab.id, "reactiver")}
            disabled={enCours}
          >
            Réactiver
          </Button>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// PAGE
// ============================================================

export function EtablissementsPage() {
  const { etablissements, chargement, erreur, recharger } =
    useEtablissements();
  const { afficher } = useToast();
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);

  async function gererAction(id: number, action: Action) {
    setActionEnCours(id);
    try {
      switch (action) {
        case "valider":
          await validerEtablissement(id);
          afficher("Établissement validé", "success");
          break;
        case "rejeter":
          await rejeterEtablissement(id);
          afficher("Établissement rejeté", "warning");
          break;
        case "suspendre":
          await suspendreEtablissement(id);
          afficher("Établissement suspendu", "warning");
          break;
        case "reactiver":
          await reactiverEtablissement(id);
          afficher("Établissement réactivé", "success");
          break;
      }
      await recharger();
    } catch (err) {
      afficher("Action échouée", "danger", extraireMessageErreur(err));
    } finally {
      setActionEnCours(null);
    }
  }

  const enAttente = etablissements.filter(estEnAttente).length;
  const actifs = etablissements.filter(estActif).length;
  const banques = etablissements.filter(
    (e) => e.type === "BANQUE_DE_SANG"
  ).length;
  const hopitaux = etablissements.filter((e) => e.type === "HOPITAL").length;

  return (
    <PageLayout
      titre="Établissements"
      description={`${etablissements.length} établissement${etablissements.length > 1 ? "s" : ""} enregistré${etablissements.length > 1 ? "s" : ""}.`}
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
      {!chargement && enAttente > 0 && (
        <Card className="mb-4 border-warning-500/30 bg-warning-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-warning-700" size={20} />
            <div>
              <p className="font-medium text-warning-700">
                {enAttente} établissement{enAttente > 1 ? "s" : ""} en attente
                de vérification
              </p>
              <p className="mt-0.5 text-sm text-warning-700/80">
                Validez-les pour permettre leur utilisation.
              </p>
            </div>
          </div>
        </Card>
      )}

      {!chargement && !erreur && etablissements.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
              {etablissements.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Actifs</p>
            <p className="mt-1 text-2xl font-bold text-success-700">
              {actifs}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Banques</p>
            <p className="mt-1 text-2xl font-bold text-primary-700">
              {banques}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Hôpitaux</p>
            <p className="mt-1 text-2xl font-bold text-info-700">{hopitaux}</p>
          </Card>
        </div>
      )}

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les établissements
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={recharger}>
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (
        <Card>
          <Loader texte="Chargement des établissements…" />
        </Card>
      )}

      {!chargement && !erreur && etablissements.length === 0 && (
        <Card>
          <EmptyState
            icone={<Building2 size={22} />}
            titre="Aucun établissement"
            description="Les établissements apparaîtront ici."
          />
        </Card>
      )}

      {!chargement && !erreur && etablissements.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {etablissements.map((e) => (
            <CarteEtablissement
              key={e.id}
              etab={e}
              onAction={gererAction}
              enCours={actionEnCours === e.id}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}