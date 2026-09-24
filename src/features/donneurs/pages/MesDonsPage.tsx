// ============================================================
// AIDORA — MES DONS (DONNEUR)
// ============================================================

import { useEffect, useState } from "react";
import {
  HeartHandshake,
  RefreshCw,
  AlertTriangle,
  Droplets,
  Calendar,
  Building2,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { obtenirMesDons } from "../api";
import { obtenirMonProfil } from "../api";
import { extraireMessageErreur } from "../../../services/api";
import {
  formatDateDon,
  formatTypeDon,
  varianteStatut,
  libelleStatut,
  type Don,
} from "../../../types/don";

export function MesDonsPage() {
  const [dons, setDons] = useState<Don[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  async function charger() {
    setChargement(true);
    setErreur(null);
    try {
      const profil = await obtenirMonProfil();
      const liste = await obtenirMesDons(profil.id);
      setDons(liste);
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setDons([]);
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  return (
    <PageLayout
      titre="Mes dons"
      description={`${dons.length} don${dons.length > 1 ? "s" : ""} enregistré${dons.length > 1 ? "s" : ""}.`}
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
                Impossible de charger vos dons
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
          <Loader texte="Chargement de vos dons…" />
        </Card>
      )}

      {!chargement && !erreur && dons.length === 0 && (
        <Card>
          <EmptyState
            icone={<HeartHandshake size={22} />}
            titre="Aucun don enregistré"
            description="Votre historique de dons apparaîtra ici."
          />
        </Card>
      )}

      {!chargement && !erreur && dons.length > 0 && (
        <Card>
          <CardTitle>Historique</CardTitle>
          <CardDescription className="mb-4">
            Tous vos dons, du plus récent au plus ancien.
          </CardDescription>
          <div>
            {dons.map((don) => (
              <div
                key={don.id}
                className="flex items-center justify-between border-b border-neutral-100 py-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formatTypeDon(don.type_don)} · {don.quantite} ml
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDateDon(don)}
                      </span>
                      {don.etablissement_nom && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 size={11} />
                          {don.etablissement_nom}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variante={varianteStatut(don.statut)}>
                  {libelleStatut(don.statut)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}