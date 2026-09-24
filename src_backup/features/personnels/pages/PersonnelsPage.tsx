// ============================================================
// AIDORA — PAGE PERSONNELS (UTILISATEURS)
// ============================================================

import { useState } from "react";
import {
  Users,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Avatar } from "../../../components/ui/Avatar";
import { usePersonnels } from "../hooks/usePersonnels";
import { activerPersonnel, desactiverPersonnel } from "../api";
import { useToast } from "../../../hooks/useToast";
import { extraireMessageErreur } from "../../../services/api";
import {
  nomCompletPersonnel,
  libelleRole,
  varianteRole,
  libelleStatutCompte,
  varianteStatutCompte,
  type Personnel,
} from "../../../types/personnel";

// ------------------------------------------------------------
// Ligne d'un personnel
// ------------------------------------------------------------
function LignePersonnel({
  p,
  onAction,
  enCours,
}: {
  p: Personnel;
  onAction: (id: number, action: "activer" | "desactiver") => void;
  enCours: boolean;
}) {
  const nom = nomCompletPersonnel(p);
  const [prenom, ...reste] = nom.split(" ");

  return (
    <div className="flex flex-col gap-4 border-b border-neutral-100 py-4 last:border-0 lg:flex-row lg:items-center lg:justify-between">
      {/* Gauche : avatar + infos */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar taille="md" prenom={prenom} nom={reste.join(" ")} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
            {nom}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Mail size={11} />
              {p.email}
            </span>
            {p.telephone && (
              <span className="inline-flex items-center gap-1">
                <Phone size={11} />
                {p.telephone}
              </span>
            )}
            {p.etablissement_nom && (
              <span className="inline-flex items-center gap-1">
                <Building2 size={11} />
                {p.etablissement_nom}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Droite : badges + action */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Badge variante={varianteRole(p.role)}>{libelleRole(p.role)}</Badge>
        <Badge variante={varianteStatutCompte(p.statut_compte)}>
          {libelleStatutCompte(p.statut_compte)}
        </Badge>

        {p.statut_compte === "ACTIF" ? (
          <Button
            taille="sm"
            variante="ghost"
            iconeGauche={<UserX size={14} />}
            onClick={() => onAction(p.id, "desactiver")}
            disabled={enCours}
          >
            Désactiver
          </Button>
        ) : (
          <Button
            taille="sm"
            variante="outline"
            iconeGauche={<UserCheck size={14} />}
            onClick={() => onAction(p.id, "activer")}
            disabled={enCours}
          >
            Activer
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export function PersonnelsPage() {
  const { personnels, total, chargement, erreur, recharger } =
    usePersonnels();
  const { afficher } = useToast();
  const [actionEnCours, setActionEnCours] = useState<number | null>(null);

  async function gererAction(id: number, action: "activer" | "desactiver") {
    setActionEnCours(id);
    try {
      if (action === "activer") {
        await activerPersonnel(id);
        afficher("Compte activé", "success");
      } else {
        await desactiverPersonnel(id);
        afficher("Compte désactivé", "warning");
      }
      await recharger();
    } catch (err) {
      afficher("Action échouée", "danger", extraireMessageErreur(err));
    } finally {
      setActionEnCours(null);
    }
  }

  const actifs = personnels.filter((p) => p.statut_compte === "ACTIF").length;
  const inactifs = personnels.filter(
    (p) => p.statut_compte === "INACTIF"
  ).length;
  const admins = personnels.filter(
    (p) => p.role === "ADMINISTRATEUR"
  ).length;

  return (
    <PageLayout
      titre="Utilisateurs"
      description={`${total} compte${total > 1 ? "s" : ""} personnel.`}
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
      {/* Stats */}
      {!chargement && !erreur && personnels.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{total}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Actifs</p>
            <p className="mt-1 text-2xl font-bold text-success-700">{actifs}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Inactifs</p>
            <p className="mt-1 text-2xl font-bold text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
              {inactifs}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">Administrateurs</p>
            <p className="mt-1 text-2xl font-bold text-warning-700">
              {admins}
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
                Impossible de charger les utilisateurs
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
          <Loader texte="Chargement des utilisateurs…" />
        </Card>
      )}

      {/* Vide */}
      {!chargement && !erreur && personnels.length === 0 && (
        <Card>
          <EmptyState
            icone={<Users size={22} />}
            titre="Aucun utilisateur"
            description="Les comptes du personnel apparaîtront ici."
          />
        </Card>
      )}

      {/* Liste */}
      {!chargement && !erreur && personnels.length > 0 && (
        <Card>
          <CardTitle>Comptes du personnel</CardTitle>
          <CardDescription className="mb-4">
            Gérez les accès et les statuts de chaque compte.
          </CardDescription>
          <div>
            {personnels.map((p) => (
              <LignePersonnel
                key={p.id}
                p={p}
                onAction={gererAction}
                enCours={actionEnCours === p.id}
              />
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}