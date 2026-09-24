// ============================================================
// AIDORA — MES RENDEZ-VOUS (DONNEUR)
// ============================================================

import { useEffect, useState } from "react";
import {
  CalendarDays,
  RefreshCw,
  AlertTriangle,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import api from "../../../services/api";
import { extraireMessageErreur } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import {
  dateRdv,
  heureRdv,
  libelleStatutRdv,
  varianteStatutRdv,
  estAVenir,
  type Rdv,
} from "../../../types/rdv";

export function MesRdvPage() {
  const { afficher } = useToast();
  const [rdvs, setRdvs] = useState<Rdv[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [annulation, setAnnulation] = useState<number | null>(null);

  async function charger() {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await api.get("/rdv/moi");
      const data = reponse.data?.data ?? reponse.data;
      setRdvs(Array.isArray(data) ? data : []);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setRdvs([]);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function annuler(id: number) {
    if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;
    setAnnulation(id);
    try {
      await api.patch(`/rdv/${id}/annuler`);
      afficher("Rendez-vous annulé", "success");
      await charger();
    } catch (err) {
      afficher("Échec de l'annulation", "danger", extraireMessageErreur(err));
    } finally {
      setAnnulation(null);
    }
  }

  const aVenir = rdvs.filter(estAVenir);
  const passes = rdvs.filter((r) => !estAVenir(r));

  return (
    <PageLayout
      titre="Mes rendez-vous"
      description={`${rdvs.length} rendez-vous au total.`}
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
                Impossible de charger vos rendez-vous
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
          <Loader texte="Chargement…" />
        </Card>
      )}

      {!chargement && !erreur && rdvs.length === 0 && (
        <Card>
          <EmptyState
            icone={<CalendarDays size={22} />}
            titre="Aucun rendez-vous"
            description="Vous n'avez pas encore de rendez-vous programmé."
          />
        </Card>
      )}

      {!chargement && !erreur && rdvs.length > 0 && (
        <>
          {/* À venir */}
          {aVenir.length > 0 && (
            <Card className="mb-6">
              <CardTitle>À venir</CardTitle>
              <CardDescription className="mb-4">
                {aVenir.length} rendez-vous programmé
                {aVenir.length > 1 ? "s" : ""}.
              </CardDescription>
              <div>
                {aVenir.map((rdv) => (
                  <LigneRdv
                    key={rdv.id}
                    rdv={rdv}
                    onAnnuler={annuler}
                    enCours={annulation === rdv.id}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Passés */}
          {passes.length > 0 && (
            <Card>
              <CardTitle>Historique</CardTitle>
              <CardDescription className="mb-4">
                Vos rendez-vous passés.
              </CardDescription>
              <div>
                {passes.map((rdv) => (
                  <LigneRdv
                    key={rdv.id}
                    rdv={rdv}
                    onAnnuler={annuler}
                    enCours={annulation === rdv.id}
                  />
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </PageLayout>
  );
}

// ------------------------------------------------------------
function LigneRdv({
  rdv,
  onAnnuler,
  enCours,
}: {
  rdv: Rdv;
  onAnnuler: (id: number) => void;
  enCours: boolean;
}) {
  const aVenir = estAVenir(rdv);

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <span className="text-[10px] font-medium uppercase">
            {new Date(rdv.date_rendez_vous).toLocaleDateString("fr-FR", {
              month: "short",
            })}
          </span>
          <span className="text-lg font-bold leading-none">
            {new Date(rdv.date_rendez_vous).getDate()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            {dateRdv(rdv)}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              {heureRdv(rdv)}
            </span>
            {rdv.etablissement_nom && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} />
                {rdv.etablissement_nom}
              </span>
            )}
          </div>
          {rdv.commentaire && (
            <p className="mt-1 text-xs italic text-neutral-500 dark:text-neutral-400 dark:text-neutral-500">
              « {rdv.commentaire} »
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variante={varianteStatutRdv(rdv.statut)}>
          {libelleStatutRdv(rdv.statut)}
        </Badge>

        {aVenir && rdv.statut !== "ANNULE" && (
          <Button
            taille="sm"
            variante="ghost"
            iconeGauche={<X size={14} />}
            onClick={() => onAnnuler(rdv.id)}
            disabled={enCours}
          >
            Annuler
          </Button>
        )}
      </div>
    </div>
  );
}