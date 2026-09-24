// ============================================================
// AIDORA — PAGE RAPPORTS
// ============================================================
import { telechargerRapport } from "../api";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  RefreshCw,
  AlertTriangle,
  Plus,
  Download,
  Trash2,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import {
  obtenirRapports,
  genererRapport,
  supprimerRapport,
  libelleTypeRapport,
  varianteStatutRapport,
  type Rapport,
  type TypeRapport,
  type FormatRapport,
} from "../api";
import { extraireMessageErreur } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

export function RapportsPage() {
  const { afficher } = useToast();
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [generation, setGeneration] = useState(false);
  const [action, setAction] = useState<number | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      setRapports(await obtenirRapports());
    } catch (err) {
      setErreur(extraireMessageErreur(err));
      setRapports([]);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  async function generer(type: TypeRapport, format: FormatRapport) {
    setGeneration(true);
    try {
        await genererRapport({ type, format_export: format });
        afficher("Rapport généré", "success", "Il est prêt à être téléchargé.");
        await charger();
    } catch (err) {
        afficher("Échec de la génération", "danger", extraireMessageErreur(err));
    } finally {
        setGeneration(false);
    }
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer ce rapport ?")) return;
    setAction(id);
    try {
      await supprimerRapport(id);
      afficher("Rapport supprimé", "success");
      await charger();
    } catch (err) {
      afficher("Échec", "danger", extraireMessageErreur(err));
    } finally {
      setAction(null);
    }
  }

  return (
    <PageLayout
      titre="Rapports"
      description="Générez et téléchargez vos rapports d'activité."
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
      {/* Génération rapide */}
      <Card className="mb-6">
        <CardTitle>Générer un rapport</CardTitle>
        <CardDescription className="mb-4">
          Sélectionnez le type et le format du rapport à produire.
        </CardDescription>
        <div className="flex flex-wrap gap-2">
            <Button
                variante="outline"
                taille="sm"
                iconeGauche={<Plus size={14} />}
                onClick={() => generer("DONS", "PDF")}
                disabled={generation}
            >
                Dons (PDF)
            </Button>
            <Button
                variante="outline"
                taille="sm"
                iconeGauche={<Plus size={14} />}
                onClick={() => generer("DEMANDES", "PDF")}
                disabled={generation}
            >
                Demandes (PDF)
            </Button>
            <Button
                variante="outline"
                taille="sm"
                iconeGauche={<Plus size={14} />}
                onClick={() => generer("STOCKS", "EXCEL")}
                disabled={generation}
            >
                Stocks (Excel)
            </Button>
            <Button
                variante="outline"
                taille="sm"
                iconeGauche={<Plus size={14} />}
                onClick={() => generer("PERSONNELS", "CSV")}
                disabled={generation}
            >
                Personnels (CSV)
            </Button>
            <Button
                variante="outline"
                taille="sm"
                iconeGauche={<Plus size={14} />}
                onClick={() => generer("ETABLISSEMENTS", "CSV")}
                disabled={generation}
            >
                Établissements (CSV)
            </Button>
            <Button
                variante="outline"
                taille="sm"
                iconeGauche={<Plus size={14} />}
                onClick={() => generer("AUDIT", "CSV")}
                disabled={generation}
            >
                Audit (CSV)
            </Button>
        </div>
      </Card>

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les rapports
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
          <Loader texte="Chargement des rapports…" />
        </Card>
      )}

      {!chargement && !erreur && rapports.length === 0 && (
        <Card>
          <EmptyState
            icone={<FileText size={22} />}
            titre="Aucun rapport"
            description="Générez votre premier rapport ci-dessus."
          />
        </Card>
      )}

      {!chargement && !erreur && rapports.length > 0 && (
        <Card>
          <CardTitle>Rapports générés</CardTitle>
          <CardDescription className="mb-4">
            Cliquez sur télécharger pour récupérer un rapport prêt.
          </CardDescription>
          <div>
            {rapports.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {r.titre ?? r.nom ?? `Rapport #${r.id}`}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{libelleTypeRapport(r.type)}</span>
                      {r.format && (
                        <>
                          <span>·</span>
                          <span>{r.format}</span>
                        </>
                      )}
                      {r.created_at && (
                        <>
                          <span>·</span>
                          <span>
                            {new Date(r.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variante={varianteStatutRapport(r.statut)}>
                    {r.statut ?? "—"}
                  </Badge>
                  {r.statut === "PRET" && (
                    <Button
                        taille="sm"
                        variante="outline"
                        iconeGauche={<Download size={14} />}
                        onClick={async () => {
                            try {
                            await telechargerRapport(r.id);
                            afficher("Rapport téléchargé", "success");
                            } catch (err) {
                            afficher("Téléchargement échoué", "danger", extraireMessageErreur(err));
                            }
                        }}
                        >
                        Télécharger
                    </Button>
                  )}
                  <button
                    aria-label="Supprimer"
                    onClick={() => supprimer(r.id)}
                    disabled={action === r.id}
                    className="rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageLayout>
  );
}