// ============================================================
// AIDORA — PAGE NOTIFICATIONS
// ============================================================

import { useState } from "react";
import {
  Bell,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertOctagon,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useNotifications } from "../hooks/useNotifications";
import {
  marquerCommeLue,
  marquerToutesCommeLues,
  supprimerNotification,
} from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import {
  estLue,
  dateNotification,
  libelleType,
  varianteType,
  type Notification,
  type TypeNotification,
} from "../../../types/notification";

// ------------------------------------------------------------
// Icône selon le type
// ------------------------------------------------------------
function IconeNotification({ type }: { type?: TypeNotification }) {
  switch (type) {
    case "SUCCES":  return <CheckCircle2 size={18} className="text-success-500" />;
    case "ALERTE":  return <AlertTriangle size={18} className="text-warning-500" />;
    case "URGENT":  return <AlertOctagon size={18} className="text-danger-500" />;
    case "SYSTEME": return <Bell size={18} className="text-primary-500" />;
    default:        return <Info size={18} className="text-info-500" />;
  }
}

// ------------------------------------------------------------
// Ligne d'une notification
// ------------------------------------------------------------
function LigneNotification({
  n,
  onLue,
  onSupprimer,
  enCours,
}: {
  n: Notification;
  onLue: (id: number) => void;
  onSupprimer: (id: number) => void;
  enCours: boolean;
}) {
  const lue = estLue(n);

  return (
    <div
      className={`flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between ${
        lue ? "" : "bg-primary-50/30"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <IconeNotification type={n.type} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {n.titre && (
              <p
                className={`text-sm ${
                  lue ? "font-medium" : "font-semibold"
                } text-neutral-900 dark:text-white`}
              >
                {n.titre}
              </p>
            )}
            {n.type && n.type !== "INFO" && (
              <Badge variante={varianteType(n.type)}>
                {libelleType(n.type)}
              </Badge>
            )}
            {!lue && (
              <span className="h-2 w-2 rounded-full bg-primary-500" />
            )}
          </div>

          <p
            className={`mt-1 text-sm ${
              lue ? "text-neutral-600 dark:text-neutral-400 dark:text-neutral-500" : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {n.message}
          </p>

          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            {dateNotification(n)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5 sm:pl-3">
        {!lue && (
          <Button
            taille="sm"
            variante="ghost"
            iconeGauche={<Check size={14} />}
            onClick={() => onLue(n.id)}
            disabled={enCours}
          >
            Marquer lue
          </Button>
        )}
        <button
          aria-label="Supprimer"
          onClick={() => onSupprimer(n.id)}
          disabled={enCours}
          className="rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export function NotificationsPage() {
  const { notifications, total, chargement, erreur, recharger } =
    useNotifications();
  const { afficher } = useToast();
  const [enCours, setEnCours] = useState<number | null>(null);
  const [traitementGlobal, setTraitementGlobal] = useState(false);

  const nonLues = notifications.filter((n) => !estLue(n)).length;

  async function gererMarquerLue(id: number) {
    setEnCours(id);
    try {
      await marquerCommeLue(id);
      await recharger();
    } catch (err) {
      afficher("Action échouée", "danger", extraireMessageErreur(err));
    } finally {
      setEnCours(null);
    }
  }

  async function gererSupprimer(id: number) {
    setEnCours(id);
    try {
      await supprimerNotification(id);
      afficher("Notification supprimée", "success");
      await recharger();
    } catch (err) {
      afficher("Suppression échouée", "danger", extraireMessageErreur(err));
    } finally {
      setEnCours(null);
    }
  }

  async function gererToutesLues() {
    setTraitementGlobal(true);
    try {
      await marquerToutesCommeLues();
      afficher("Toutes marquées comme lues", "success");
      await recharger();
    } catch (err) {
      afficher("Action échouée", "danger", extraireMessageErreur(err));
    } finally {
      setTraitementGlobal(false);
    }
  }

  return (
    <PageLayout
      titre="Notifications"
      description={`${total} notification${total > 1 ? "s" : ""} — ${nonLues} non lue${nonLues > 1 ? "s" : ""}.`}
      actions={
        <>
          <Button
            variante="outline"
            iconeGauche={<RefreshCw size={16} />}
            onClick={recharger}
            disabled={chargement}
          >
            Actualiser
          </Button>
          {nonLues > 0 && (
            <Button
              iconeGauche={<CheckCheck size={16} />}
              onClick={gererToutesLues}
              chargement={traitementGlobal}
            >
              Tout marquer comme lu
            </Button>
          )}
        </>
      }
    >
      {/* Bandeau non lues */}
      {!chargement && nonLues > 0 && (
        <Card className="mb-4 border-primary-500/30 bg-primary-50">
          <div className="flex items-center gap-3">
            <Bell className="text-primary-600" size={20} />
            <div>
              <p className="font-medium text-primary-700">
                {nonLues} notification{nonLues > 1 ? "s" : ""} non lue
                {nonLues > 1 ? "s" : ""}
              </p>
              <p className="mt-0.5 text-sm text-primary-700/80">
                Prenez-en connaissance dès que possible.
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
                Impossible de charger les notifications
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
          <Loader texte="Chargement des notifications…" />
        </Card>
      )}

      {/* Vide */}
      {!chargement && !erreur && notifications.length === 0 && (
        <Card>
          <EmptyState
            icone={<Bell size={22} />}
            titre="Aucune notification"
            description="Vous êtes à jour — rien à signaler."
          />
        </Card>
      )}

      {/* Liste */}
      {!chargement && !erreur && notifications.length > 0 && (
        <Card>
          <CardTitle>Boîte de réception</CardTitle>
          <CardDescription className="mb-4">
            Consultez et gérez vos notifications.
          </CardDescription>
          <div>
            {notifications.map((n) => (
              <LigneNotification
                key={n.id}
                n={n}
                onLue={gererMarquerLue}
                onSupprimer={gererSupprimer}
                enCours={enCours === n.id}
              />
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}