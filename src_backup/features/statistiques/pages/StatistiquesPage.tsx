// ============================================================
// AIDORA — PAGE STATISTIQUES
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  AlertTriangle,
  Users,
  HeartHandshake,
  ClipboardList,
  Package,
  Building2,
  UserCog,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import {
  obtenirStatsGlobales,
  libelleStatutDemande,
  libelleTypeProduit,
  libelleTypeEtab,
  libelleRole,
  type StatsGlobales,
} from "../api";
import { extraireMessageErreur } from "../../../services/api";

export function StatistiquesPage() {
  const [stats, setStats] = useState<StatsGlobales | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      setStats(await obtenirStatsGlobales());
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setStats(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // --------------------------------------------------------
  // Rendu
  // --------------------------------------------------------
  return (
    <PageLayout
      titre="Statistiques"
      description="Vue d'ensemble des indicateurs clés d'Aidora."
      actions={
        <Button
          variante="outline"
          iconeGauche={<RefreshCw size={16} />}
          onClick={charger}
          disabled={chargement}
        >
          Actualiser
        </Button>
      }
    >
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les statistiques
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={charger}>
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {chargement && !erreur && (
        <Card>
          <Loader texte="Chargement des statistiques…" />
        </Card>
      )}

      {!chargement && !erreur && stats && (
        <>
          {/* Alertes */}
          {(stats.demandesUrgentes > 0 || stats.stocksFaibles > 0) && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {stats.demandesUrgentes > 0 && (
                <Card className="border-danger-500/30 bg-danger-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-danger-500" size={20} />
                    <div>
                      <p className="font-medium text-danger-700">
                        {stats.demandesUrgentes} demande
                        {stats.demandesUrgentes > 1 ? "s" : ""} urgente
                        {stats.demandesUrgentes > 1 ? "s" : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-danger-700/80">
                        Traitement prioritaire requis.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
              {stats.stocksFaibles > 0 && (
                <Card className="border-warning-500/30 bg-warning-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-warning-700" size={20} />
                    <div>
                      <p className="font-medium text-warning-700">
                        {stats.stocksFaibles} stock
                        {stats.stocksFaibles > 1 ? "s" : ""} sous le seuil
                      </p>
                      <p className="mt-0.5 text-xs text-warning-700/80">
                        Réapprovisionnement conseillé.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Cartes principales */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CarteStat
              label="Donneurs"
              valeur={stats.donneurs}
              icone={<Users size={18} />}
              variante="primary"
            />
            <CarteStat
              label="Dons"
              valeur={stats.dons}
              icone={<HeartHandshake size={18} />}
              variante="success"
            />
            <CarteStat
              label="Demandes"
              valeur={stats.demandes}
              icone={<ClipboardList size={18} />}
              variante="warning"
            />
            <CarteStat
              label="Poches"
              valeur={stats.poches}
              icone={<Package size={18} />}
              variante="info"
            />
          </div>

          {/* 2e ligne */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CarteStat
              label="Établissements"
              valeur={stats.etablissements}
              icone={<Building2 size={18} />}
              variante="primary"
            />
            <CarteStat
              label="Personnels"
              valeur={stats.personnels}
              icone={<UserCog size={18} />}
              variante="info"
            />
            <CarteStat
              label="Stocks"
              valeur={stats.stocks}
              icone={<Package size={18} />}
              variante="success"
            />
            <CarteStat
              label="Demandes urgentes"
              valeur={stats.demandesUrgentes}
              icone={<AlertTriangle size={18} />}
              variante="warning"
            />
          </div>

          {/* Graphiques textuels */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <RepartitionCard
              titre="Demandes par statut"
              description="Répartition de toutes les demandes."
              items={stats.demandesParStatut.map((d) => ({
                label: libelleStatutDemande(d.statut),
                total: d.total,
              }))}
              couleur="primary"
            />

            <RepartitionCard
              titre="Stocks par type de produit"
              description="Répartition du stock actuel."
              items={stats.stocksParType.map((s) => ({
                label: libelleTypeProduit(s.type_produit),
                total: s.total,
              }))}
              couleur="success"
            />

            <RepartitionCard
              titre="Établissements par type"
              description="Banques et hôpitaux enregistrés."
              items={stats.etablissementsParType.map((e) => ({
                label: libelleTypeEtab(e.type),
                total: e.total,
              }))}
              couleur="info"
            />

            <RepartitionCard
              titre="Personnels par rôle"
              description="Comptes utilisateurs par rôle."
              items={stats.personnelsParRole.map((p) => ({
                label: libelleRole(p.role),
                total: p.total,
              }))}
              couleur="primary"
            />
          </div>
        </>
      )}
    </PageLayout>
  );
}

// ------------------------------------------------------------
// Carte statistique simple
// ------------------------------------------------------------
function CarteStat({
  label,
  valeur,
  icone,
  variante,
}: {
  label: string;
  valeur: number;
  icone: React.ReactNode;
  variante: "primary" | "success" | "warning" | "info";
}) {
  return (
    <Card hoverable>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            {valeur}
          </p>
        </div>
        <Badge variante={variante}>{icone}</Badge>
      </div>
    </Card>
  );
}

// ------------------------------------------------------------
// Carte de répartition avec barres
// ------------------------------------------------------------
function RepartitionCard({
  titre,
  description,
  items,
  couleur,
}: {
  titre: string;
  description: string;
  items: Array<{ label: string; total: number }>;
  couleur: "primary" | "success" | "info";
}) {
  const total = items.reduce((s, i) => s + (i.total ?? 0), 0);
  const bgClass = {
    primary: "bg-primary-500",
    success: "bg-success-500",
    info: "bg-info-500",
  }[couleur];

  return (
    <Card>
      <CardTitle>{titre}</CardTitle>
      <CardDescription className="mb-4">{description}</CardDescription>

      {items.length === 0 ? (
        <EmptyState
          icone={<ClipboardList size={20} />}
          titre="Aucune donnée"
          description="Rien à afficher pour l'instant."
        />
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const pct = total > 0 ? (it.total / total) * 100 : 0;
            return (
              <div key={it.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {it.label}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
                    {it.total} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all ${bgClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}