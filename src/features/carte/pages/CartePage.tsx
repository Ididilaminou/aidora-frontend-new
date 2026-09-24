// ============================================================
// AIDORA — PAGE CARTE INTERACTIVE
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  MapPin,
  RefreshCw,
  Building2,
  Users,
  Navigation,
  AlertTriangle,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { CarteInteractive, type Marqueur } from "../../../components/carte/CarteInteractive";
import api from "../../../services/api";
import { extraireMessageErreur } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import {
  libelleType,
  libelleStatutEtab,
  type Etablissement,possedeBanque,
} from "../../../types/etablissement";

// ------------------------------------------------------------
// Type local donneur géolocalisé
// ------------------------------------------------------------
interface DonneurGeo {
  id: number;
  nom: string;
  prenom: string;
  groupe_sanguin?: string;
  rhesus?: string;
  latitude?: number | null;
  longitude?: number | null;
  ville?: string | null;
  quartier?: string | null;
  disponible?: number | boolean;
  telephone?: string;
}

// ------------------------------------------------------------
// Filtres
// ------------------------------------------------------------
type FiltreType = "tous" | "banques" | "hopitaux" | "donneurs";

export function CartePage() {
  const { afficher } = useToast();
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [donneurs, setDonneurs] = useState<DonneurGeo[]>([]);
  const [filtre, setFiltre] = useState<FiltreType>("tous");
  const [positionUtilisateur, setPositionUtilisateur] = useState<[number, number] | null>(null);
  const [chargementGeo, setChargementGeo] = useState(false);

  // --------------------------------------------------------
  // Charger les données
  // --------------------------------------------------------
  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [reponseEtabs, reponseDonneurs] = await Promise.all([
        api.get("/etablissements"),
        api.get("/rattachements", { params: { disponible: 1 } }),
      ]);

      // -------- Établissements --------
      const etabs = reponseEtabs.data?.data ?? reponseEtabs.data;
      setEtablissements(Array.isArray(etabs) ? etabs : []);

      // -------- Donneurs (depuis rattachements) --------
      const data = reponseDonneurs.data?.data ?? reponseDonneurs.data;
      const liste = Array.isArray(data?.rattachements) ? data.rattachements : [];

      const uniques = new Map<number, DonneurGeo>();
      for (const r of liste) {
        if (!r.donneur_id || uniques.has(r.donneur_id)) continue;
        uniques.set(r.donneur_id, {
          id: r.donneur_id,
          nom: r.donneur_nom ?? "",
          prenom: r.donneur_prenom ?? "",
          groupe_sanguin: r.groupe_sanguin,
          rhesus: r.rhesus,
          telephone: r.donneur_telephone,
          ville: r.donneur_ville ?? null,
          quartier: r.donneur_quartier ?? null,
          latitude: r.donneur_latitude != null ? Number(r.donneur_latitude) : null,
          longitude: r.donneur_longitude != null ? Number(r.donneur_longitude) : null,
          disponible: r.donneur_disponible,
        });
      }
      setDonneurs(Array.from(uniques.values()));
    } catch (err) {
      setErreur(extraireMessageErreur(err));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // --------------------------------------------------------
  // Géolocalisation
  // --------------------------------------------------------
  function meGeolocaliser() {
    if (!navigator.geolocation) {
      afficher("Géolocalisation non supportée", "danger");
      return;
    }
    setChargementGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPositionUtilisateur([pos.coords.latitude, pos.coords.longitude]);
        afficher("Position trouvée", "success");
        setChargementGeo(false);
      },
      (err) => {
        afficher("Impossible de vous localiser", "danger", err.message);
        setChargementGeo(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // --------------------------------------------------------
  // Marqueurs
  // --------------------------------------------------------
  const marqueurs: Marqueur[] = [];

  // Établissements
  etablissements.forEach((e) => {
    if (!e.latitude || !e.longitude) return;
    if (filtre === "banques" && e.type !== "BANQUE_DE_SANG") return;
    if (filtre === "hopitaux" && e.type !== "HOPITAL") return;
    if (filtre === "donneurs") return;

    const hopital = e.type === "HOPITAL";
    const avecBanque = hopital && possedeBanque(e);

    marqueurs.push({
      id: e.id,
      position: [e.latitude, e.longitude],
      titre: e.nom,
      sousTitre: hopital
        ? `Hôpital ${avecBanque ? "· 🩸 Banque de sang" : "· Demandeur"}`
        : `Banque de sang · ${libelleStatutEtab(e.statut)}`,
      type: e.type === "BANQUE_DE_SANG" ? "banque" : "hopital",
      details: (
        <div className="text-xs space-y-1">
          {e.adresse && <p>📍 {e.adresse}</p>}
          {e.ville && <p>🏙️ {e.ville}</p>}
          {e.telephone && <p>📞 {e.telephone}</p>}
          {hopital && avecBanque && (
            <p className="font-semibold text-success-600">
              🩸 Dispose d'une banque de sang
            </p>
          )}
        </div>
      ),
    });
  });

  // Donneurs
  donneurs.forEach((d) => {
    if (d.latitude == null || d.longitude == null) return;
    if (filtre === "banques" || filtre === "hopitaux") return;

    marqueurs.push({
      id: d.id + 100000, // évite collision d'id
      position: [d.latitude, d.longitude],
      titre: `${d.prenom} ${d.nom}`,
      sousTitre: d.groupe_sanguin
        ? `${d.groupe_sanguin}${d.rhesus === "POSITIF" ? "+" : "-"}`
        : "Groupe inconnu",
      type: "donneur",
      details: (
        <div className="text-xs space-y-1">
          {d.quartier && <p>🏘️ {d.quartier}</p>}
          {d.ville && <p>📍 {d.ville}</p>}
          {d.telephone && <p>📞 {d.telephone}</p>}
        </div>
      ),
    });
  });

  // Position utilisateur
  if (positionUtilisateur) {
    marqueurs.push({
      id: 999999,
      position: positionUtilisateur,
      titre: "Votre position",
      sousTitre: "Position actuelle",
      type: "vous",
    });
  }

  // --------------------------------------------------------
  // Centre
  // --------------------------------------------------------
  const centre: [number, number] =
    positionUtilisateur ??
    (etablissements.length > 0 && etablissements[0].latitude
      ? [etablissements[0].latitude, etablissements[0].longitude]
      : [3.848, 11.502]);

  // --------------------------------------------------------
  // Rendu
  // --------------------------------------------------------
  return (
    <PageLayout
      titre="Carte interactive"
      description="Visualisez les banques, hôpitaux et donneurs autour de vous."
      actions={
        <>
          <Button
            variante="outline"
            iconeGauche={<Navigation size={16} />}
            onClick={meGeolocaliser}
            chargement={chargementGeo}
          >
            Ma position
          </Button>
          <Button
            variante="outline"
            iconeGauche={<RefreshCw size={16} />}
            onClick={charger}
            disabled={chargement}
          >
            Actualiser
          </Button>
        </>
      }
    >
      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { value: "tous",     label: "Tout afficher",  icone: MapPin },
            { value: "banques",  label: "Banques de sang", icone: Building2 },
            { value: "hopitaux", label: "Hôpitaux",        icone: Building2 },
            { value: "donneurs", label: "Donneurs",        icone: Users },
          ] as const
        ).map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltre(f.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filtre === f.value
                ? "bg-primary-500 text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            <f.icone size={14} />
            {f.label}
          </button>
        ))}
      </div>

      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les données de la carte
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
          <Loader texte="Chargement de la carte…" />
        </Card>
      )}

      {!chargement && !erreur && marqueurs.length === 0 && (
        <Card>
          <EmptyState
            icone={<MapPin size={22} />}
            titre="Aucun point à afficher"
            description="Aucun établissement ou donneur géolocalisé trouvé."
          />
        </Card>
      )}

      {!chargement && !erreur && marqueurs.length > 0 && (
        <>
          <Card padding="none">
            <CarteInteractive
              marqueurs={marqueurs}
              centre={centre}
              zoom={13}
              hauteur="600px"
            />
          </Card>

          <Card className="mt-4">
            <CardTitle>Légende</CardTitle>
            <CardDescription className="mb-3">
              Types de points affichés sur la carte.
            </CardDescription>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <LegendeLigne couleur="bg-red-500" label="Banque de sang" />
              <LegendeLigne couleur="bg-blue-500" label="Hôpital" />
              <LegendeLigne couleur="bg-green-500" label="Donneur" />
              <LegendeLigne couleur="bg-violet-500" label="Votre position" />
            </div>
          </Card>
        </>
      )}
    </PageLayout>
  );
}

// ------------------------------------------------------------
function LegendeLigne({ couleur, label }: { couleur: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${couleur}`} />
      <span className="text-sm text-neutral-600 dark:text-neutral-400">
        {label}
      </span>
    </div>
  );
}