// ============================================================
// AIDORA — MA CARTE LOCALE
// ------------------------------------------------------------
// Vue géographique personnalisée selon le rôle :
//   • PERSONNEL_BANQUE  → sa banque + ses donneurs + hôpitaux proches
//   • PERSONNEL_HOPITAL → son hôpital + banques proches
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  MapPin, RefreshCw, AlertTriangle, Building2, Users,
  HeartPulse, Navigation, Info,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import {
  CarteInteractive,
  type Marqueur,
} from "../../../components/carte/CarteInteractive";
import { useAuth } from "../../../hooks/useAuth";
import { extraireMessageErreur } from "../../../services/api";
import api from "../../../services/api";
import {
  libelleType, possedeBanque,
  type Etablissement,
} from "../../../types/etablissement";

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

type FiltreType = "tous" | "mon_etab" | "donneurs" | "etablissements";

// ============================================================
export function MaCarteLocalePage() {
  const { utilisateur } = useAuth();
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const [monEtab, setMonEtab] = useState<Etablissement | null>(null);
  const [etablissementsProches, setEtablissementsProches] = useState<Etablissement[]>([]);
  const [donneurs, setDonneurs] = useState<DonneurGeo[]>([]);
  const [filtre, setFiltre] = useState<FiltreType>("tous");
  const [positionUtilisateur, setPositionUtilisateur] = useState<[number, number] | null>(null);
  const [chargementGeo, setChargementGeo] = useState(false);

  // ✅ Extraction des valeurs utilisées dans le useCallback
  //    (évite le warning React Compiler sur les dépendances)
  const etablissementId = utilisateur?.etablissement_id;
  const estBanque = utilisateur?.role === "PERSONNEL_BANQUE";

  const charger = useCallback(async () => {
    if (!etablissementId) {
      setErreur("Aucun établissement associé à votre compte.");
      setChargement(false);
      return;
    }
    setChargement(true);
    setErreur(null);
    try {
      // 1. Mon établissement
      const repEtab = await api.get(`/etablissements/${etablissementId}`);
      const etab: Etablissement = repEtab.data?.data ?? repEtab.data;
      setMonEtab(etab);

      // 2. Établissements proches
      if (etab.latitude != null && etab.longitude != null) {
        try {
          const repProches = await api.get(
            "/etablissements/recherche-proximite",
            {
              params: {
                latitude: etab.latitude,
                longitude: etab.longitude,
                rayon: 200,
              },
            }
          );
          const data = repProches.data?.data ?? repProches.data;
          const liste: Etablissement[] = Array.isArray(data?.etablissements)
            ? data.etablissements
            : Array.isArray(data)
            ? data
            : [];
          setEtablissementsProches(liste.filter((e) => e.id !== etab.id));
        } catch {
          setEtablissementsProches([]);
        }
      }

      // 3. Donneurs — UNIQUEMENT pour personnel banque
      if (estBanque) {
        try {
          const repD = await api.get("/rattachements", {
            params: { disponible: 1 },
          });
          const data = repD.data?.data ?? repD.data;
          const liste = Array.isArray(data?.rattachements)
            ? data.rattachements
            : [];
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
              ville: r.donneur_ville,
              quartier: r.donneur_quartier,
              latitude:
                r.donneur_latitude != null
                  ? Number(r.donneur_latitude)
                  : null,
              longitude:
                r.donneur_longitude != null
                  ? Number(r.donneur_longitude)
                  : null,
              disponible: r.donneur_disponible,
            });
          }
          setDonneurs(Array.from(uniques.values()));
        } catch {
          setDonneurs([]);
        }
      }
    } catch (err) {
      setErreur(extraireMessageErreur(err));
    } finally {
      setChargement(false);
    }
  }, [etablissementId, estBanque]); // 

  useEffect(() => {
    charger();
  }, [charger]);

  function meGeolocaliser() {
    if (!navigator.geolocation) return;
    setChargementGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPositionUtilisateur([pos.coords.latitude, pos.coords.longitude]);
        setChargementGeo(false);
      },
      () => setChargementGeo(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // --------------------------------------------------------
  // Marqueurs
  // --------------------------------------------------------
  const marqueurs: Marqueur[] = [];

  // Mon établissement
  if (monEtab?.latitude != null && monEtab.longitude != null) {
    if (filtre === "tous" || filtre === "mon_etab") {
      const hopital = monEtab.type === "HOPITAL";
      const avecBanque = hopital && possedeBanque(monEtab);
      marqueurs.push({
        id: 999999,
        position: [monEtab.latitude, monEtab.longitude],
        titre: `📍 ${monEtab.nom}`,
        sousTitre: `${libelleType(monEtab.type)} · Mon établissement`,
        type: hopital ? "hopital" : "banque",
        details: (
          <div className="text-xs space-y-1">
            {monEtab.adresse && <p>📍 {monEtab.adresse}</p>}
            {monEtab.telephone && <p>📞 {monEtab.telephone}</p>}
            {avecBanque && (
              <p className="font-semibold text-success-600">
                🩸 Banque de sang
              </p>
            )}
          </div>
        ),
      });
    }
  }

  // Établissements proches
  if (filtre === "tous" || filtre === "etablissements") {
    etablissementsProches.forEach((e) => {
      if (e.latitude == null || e.longitude == null) return;
      const hopital = e.type === "HOPITAL";
      const avecBanque = hopital && possedeBanque(e);
      marqueurs.push({
        id: e.id,
        position: [e.latitude, e.longitude],
        titre: e.nom,
        sousTitre: hopital
          ? `Hôpital${avecBanque ? " · 🩸 Banque de sang" : " · Demandeur"}`
          : "Banque de sang",
        type: hopital ? "hopital" : "banque",
        details: (
          <div className="text-xs space-y-1">
            {e.adresse && <p>📍 {e.adresse}</p>}
            {e.telephone && <p>📞 {e.telephone}</p>}
            {e.distance_km !== undefined && (
              <p>📏 {e.distance_km.toFixed(1)} km</p>
            )}
          </div>
        ),
      });
    });
  }

  // Donneurs (uniquement pour banque)
  if (estBanque && (filtre === "tous" || filtre === "donneurs")) {
    donneurs.forEach((d) => {
      if (d.latitude == null || d.longitude == null) return;
      const groupe = d.groupe_sanguin
        ? `${d.groupe_sanguin}${
            d.rhesus === "POSITIF" ? "+" : d.rhesus === "NEGATIF" ? "-" : ""
          }`
        : "—";
      marqueurs.push({
        id: d.id + 100000,
        position: [d.latitude, d.longitude],
        titre: `${d.prenom} ${d.nom}`,
        sousTitre: `Donneur · ${groupe}`,
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
  }

  // Position utilisateur
  if (positionUtilisateur) {
    marqueurs.push({
      id: 1,
      position: positionUtilisateur,
      titre: "Votre position",
      sousTitre: "Position actuelle",
      type: "vous",
    });
  }

  const centre: [number, number] =
    positionUtilisateur ??
    (monEtab?.latitude != null && monEtab.longitude != null
      ? [monEtab.latitude, monEtab.longitude]
      : [3.848, 11.502]);

  const nbDonneurs = donneurs.filter((d) => d.latitude != null).length;

  return (
    <PageLayout
      titre="Ma carte locale"
      description={
        estBanque
          ? "Votre banque, vos donneurs et les établissements proches."
          : "Votre hôpital et les banques de sang proches."
      }
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
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger la carte
              </p>
              <p className="mt-0.5 text-sm text-danger-700/80">{erreur}</p>
            </div>
            <Button variante="outline" taille="sm" onClick={charger}>
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {/* Info selon rôle */}
      <Card className="mb-4 border-info-500/30 bg-info-50 dark:bg-info-500/5">
        <div className="flex items-start gap-3">
          <Info
            className="mt-0.5 shrink-0 text-info-600 dark:text-info-400"
            size={18}
          />
          <p className="text-xs text-info-700 dark:text-info-400">
            {estBanque
              ? `💡 Vous voyez votre banque, vos donneurs rattachés (${nbDonneurs}) et les établissements proches.`
              : `💡 Vous voyez votre hôpital et les banques de sang proches.`}
          </p>
        </div>
      </Card>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FiltreBtn
          actif={filtre === "tous"}
          onClick={() => setFiltre("tous")}
          label="Tout"
          icone={MapPin}
        />
        <FiltreBtn
          actif={filtre === "mon_etab"}
          onClick={() => setFiltre("mon_etab")}
          label="Mon établissement"
          icone={Building2}
        />
        <FiltreBtn
          actif={filtre === "etablissements"}
          onClick={() => setFiltre("etablissements")}
          label={`Établissements proches (${etablissementsProches.length})`}
          icone={HeartPulse}
        />
        {estBanque && (
          <FiltreBtn
            actif={filtre === "donneurs"}
            onClick={() => setFiltre("donneurs")}
            label={`Mes donneurs (${nbDonneurs})`}
            icone={Users}
          />
        )}
      </div>

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
            description="Vérifiez la localisation de votre établissement."
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
              Types de points affichés.
            </CardDescription>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <LegendeLigne couleur="bg-red-500" label="Banque de sang" />
              <LegendeLigne couleur="bg-blue-500" label="Hôpital" />
              {estBanque && (
                <LegendeLigne couleur="bg-green-500" label="Donneur" />
              )}
              <LegendeLigne couleur="bg-violet-500" label="Ma position" />
            </div>
          </Card>
        </>
      )}
    </PageLayout>
  );
}

// ------------------------------------------------------------
function FiltreBtn({
  actif, onClick, label, icone: Icone,
}: {
  actif: boolean;
  onClick: () => void;
  label: string;
  icone: typeof MapPin;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        actif
          ? "bg-primary-500 text-white"
          : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
      }`}
    >
      <Icone size={14} />
      {label}
    </button>
  );
}

function LegendeLigne({
  couleur, label,
}: {
  couleur: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${couleur}`} />
      <span className="text-sm text-neutral-600 dark:text-neutral-400">
        {label}
      </span>
    </div>
  );
}