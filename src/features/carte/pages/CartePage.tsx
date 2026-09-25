// ============================================================
// AIDORA — PAGE CARTE INTERACTIVE (ADMIN)
// ------------------------------------------------------------
// Affiche :
//   • TOUS les établissements avec coordonnées
//   • TOUS les donneurs avec coordonnées
//   • TOUS les personnels (à la position de leur établissement)
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  MapPin, RefreshCw, Building2, Users, Navigation,
  AlertTriangle, UserCog, Droplets,
} from "lucide-react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { Card, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Loader } from "../../../components/ui/Loader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { CarteInteractive, type Marqueur } from "../../../components/carte/CarteInteractive";
import api, { extraireMessageErreur } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import {
  libelleType,
  libelleStatutEtab,
  possedeBanque,
  type Etablissement,
} from "../../../types/etablissement";

// ------------------------------------------------------------
// Types locaux
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
  etablissement_nom?: string;
}

interface PersonnelGeo {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  role: "PERSONNEL_BANQUE" | "PERSONNEL_HOPITAL" | "ADMINISTRATEUR";
  telephone?: string;
  fonction?: string;
  etablissement_id?: number | null;
  etablissement_nom?: string;
}

type FiltreType =
  | "tous"
  | "banques"
  | "hopitaux"
  | "donneurs"
  | "personnels";

// ============================================================
// PAGE
// ============================================================
export function CartePage() {
  const { afficher } = useToast();
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [donneurs, setDonneurs] = useState<DonneurGeo[]>([]);
  const [personnels, setPersonnels] = useState<PersonnelGeo[]>([]);

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
      const [repEtabs, repDonneurs, repPersonnels] = await Promise.all([
        api.get("/etablissements"),
        // 🆕 Récupère TOUS les donneurs (avec coordonnées)
        api.get("/donneurs/admin/tous", { params: { geo: "true" } }),
        // Récupère tous les personnels (admin)
        api.get("/personnels", { params: { limite: 500 } }),
      ]);

      // -------- Établissements --------
      const etabs = repEtabs.data?.data ?? repEtabs.data;
      setEtablissements(Array.isArray(etabs) ? etabs : []);

      // -------- Donneurs --------
      const dData = repDonneurs.data?.data ?? repDonneurs.data;
      const listeDonneurs = Array.isArray(dData)
        ? dData
        : Array.isArray(dData?.donneurs)
        ? dData.donneurs
        : [];
      setDonneurs(
        listeDonneurs.filter(
          (d: DonneurGeo) => d.latitude != null && d.longitude != null
        )
      );

      // -------- Personnels --------
      const pData = repPersonnels.data?.data ?? repPersonnels.data;
      const listePersonnels = Array.isArray(pData?.personnels)
        ? pData.personnels
        : Array.isArray(pData)
        ? pData
        : [];
      setPersonnels(listePersonnels);
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
  // Construction des marqueurs
  // --------------------------------------------------------
  const marqueurs: Marqueur[] = [];

  // 1. Établissements
  etablissements.forEach((e) => {
    if (e.latitude == null || e.longitude == null) return;
    if (filtre === "banques" && e.type !== "BANQUE_DE_SANG") return;
    if (filtre === "hopitaux" && e.type !== "HOPITAL") return;
    if (filtre === "donneurs" || filtre === "personnels") return;

    const hopital = e.type === "HOPITAL";
    const avecBanque = hopital && possedeBanque(e);

    // Compte les personnels rattachés à cet étab
    const nbPersonnels = personnels.filter(
      (p) => p.etablissement_id === e.id
    ).length;

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
          {nbPersonnels > 0 && (
            <p className="font-semibold text-primary-600">
              👥 {nbPersonnels} personnel{nbPersonnels > 1 ? "s" : ""}
            </p>
          )}
        </div>
      ),
    });
  });

  // 2. Donneurs
  donneurs.forEach((d) => {
    if (d.latitude == null || d.longitude == null) return;
    if (filtre === "banques" || filtre === "hopitaux" || filtre === "personnels")
      return;

    const groupe = d.groupe_sanguin
      ? `${d.groupe_sanguin}${d.rhesus === "POSITIF" ? "+" : "-"}`
      : "—";

    marqueurs.push({
      id: d.id + 100000,
      position: [d.latitude, d.longitude],
      titre: `${d.prenom} ${d.nom}`,
      sousTitre: `Donneur · ${groupe}${d.disponible ? " · ✅" : ""}`,
      type: "donneur",
      details: (
        <div className="text-xs space-y-1">
          {d.quartier && <p>🏘️ {d.quartier}</p>}
          {d.ville && <p>📍 {d.ville}</p>}
          {d.telephone && <p>📞 {d.telephone}</p>}
          {d.etablissement_nom && <p>🏥 {d.etablissement_nom}</p>}
        </div>
      ),
    });
  });

  // 3. Personnels — affichés à la position de leur établissement
  personnels.forEach((p) => {
    if (filtre === "banques" || filtre === "hopitaux" || filtre === "donneurs")
      return;

    if (p.etablissement_id == null) return;
    const etab = etablissements.find((e) => e.id === p.etablissement_id);
    if (!etab || etab.latitude == null || etab.longitude == null) return;

    // Léger décalage pour ne pas superposer les personnels au même endroit
    const offset = (p.id % 50) * 0.0001;
    const position: [number, number] = [
      etab.latitude + offset,
      etab.longitude + offset,
    ];

    const libelleRole =
      p.role === "PERSONNEL_BANQUE"
        ? "Personnel banque"
        : p.role === "PERSONNEL_HOPITAL"
        ? "Personnel hôpital"
        : "Administrateur";

    marqueurs.push({
      id: p.id + 200000,
      position,
      titre: `${p.prenom} ${p.nom}`,
      sousTitre: libelleRole,
      type: "personnel",
      details: (
        <div className="text-xs space-y-1">
          {p.fonction && <p>💼 {p.fonction}</p>}
          {p.email && <p>📧 {p.email}</p>}
          {p.telephone && <p>📞 {p.telephone}</p>}
          {etab.nom && <p>🏥 {etab.nom}</p>}
        </div>
      ),
    });
  });

  // 4. Position utilisateur
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
  // Centre de la carte
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
      description="Tous les utilisateurs et établissements géolocalisés."
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
      {/* Compteurs */}
      {!chargement && !erreur && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="text-center">
            <p className="text-xs text-neutral-500">Établissements</p>
            <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
              {etablissements.filter((e) => e.latitude != null).length}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-neutral-500">Donneurs</p>
            <p className="mt-1 text-xl font-bold text-success-600">
              {donneurs.length}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-neutral-500">Personnels</p>
            <p className="mt-1 text-xl font-bold text-primary-600">
              {personnels.filter((p) => p.etablissement_id).length}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-neutral-500">Points affichés</p>
            <p className="mt-1 text-xl font-bold text-info-600">
              {marqueurs.length}
            </p>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { value: "tous", label: "Tout", icone: MapPin },
            { value: "banques", label: "Banques", icone: Droplets },
            { value: "hopitaux", label: "Hôpitaux", icone: Building2 },
            { value: "donneurs", label: "Donneurs", icone: Users },
            { value: "personnels", label: "Personnels", icone: UserCog },
          ] as const
        ).map((f) => {
          const Icone = f.icone;
          return (
            <button
              key={f.value}
              onClick={() => setFiltre(f.value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filtre === f.value
                  ? "bg-primary-500 text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              <Icone size={14} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Erreur */}
      {erreur && (
        <Card className="mb-4 border-danger-500/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-danger-500" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger-700">
                Impossible de charger les données
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
            description="Aucun utilisateur ou établissement géolocalisé trouvé."
          />
        </Card>
      )}

      {!chargement && !erreur && marqueurs.length > 0 && (
        <>
          <Card padding="none">
            <CarteInteractive
              marqueurs={marqueurs}
              centre={centre}
              zoom={12}
              hauteur="600px"
            />
          </Card>

          <Card className="mt-4">
            <CardTitle>Légende</CardTitle>
            <CardDescription className="mb-3">
              Types de points affichés sur la carte.
            </CardDescription>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <LegendeLigne couleur="bg-red-500" label="Banque de sang" />
              <LegendeLigne couleur="bg-blue-500" label="Hôpital" />
              <LegendeLigne couleur="bg-green-500" label="Donneur" />
              <LegendeLigne couleur="bg-orange-500" label="Personnel" />
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