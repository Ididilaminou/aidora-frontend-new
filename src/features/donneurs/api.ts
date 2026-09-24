// ============================================================
// AIDORA — API DONNEUR
// ------------------------------------------------------------
// GET    /api/donneurs/moi
// PUT    /api/donneurs/moi
// PATCH  /api/donneurs/moi/disponibilite
// ============================================================

import api from "../../services/api";
import type { ProfilDonneur } from "../../types/donneur";
import type { Don } from "../../types/don";

// ------------------------------------------------------------
// Profil
// ------------------------------------------------------------

export async function obtenirMonProfil(): Promise<ProfilDonneur> {
  const reponse = await api.get("/donneurs/moi");
  return reponse.data?.data ?? reponse.data;
}

export async function mettreAJourMonProfil(
  payload: Partial<ProfilDonneur>
): Promise<ProfilDonneur> {
  const reponse = await api.put("/donneurs/moi", payload);
  return reponse.data?.data ?? reponse.data;
}

export async function basculerDisponibilite(
  disponible: boolean
): Promise<ProfilDonneur> {
  const reponse = await api.patch("/donneurs/moi/disponibilite", {
    disponible,
  });
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// Mes dons
// ------------------------------------------------------------

export async function obtenirMesDons(donneurId: number): Promise<Don[]> {
  const reponse = await api.get(`/dons/donneur/${donneurId}`);
  const data = reponse.data?.data ?? reponse.data;
  return Array.isArray(data?.dons)
    ? data.dons
    : Array.isArray(data)
    ? data
    : [];
}

// ============================================================
// RDV DONNEUR
// ============================================================

import type { Etablissement } from "../../types/etablissement";
import type { Creneau } from "../../types/rdv";

/**
 * Recherche les banques de sang proches d'une position GPS.
 * Utilise l'endpoint PUBLIC /etablissements/recherche-proximite
 * qui est accessible aux donneurs.
 */
// ============================================================
// ÉTABLISSEMENTS QUI PRENNENT DES DONS
// ------------------------------------------------------------
// Au Cameroun, la plupart des grands hôpitaux ont une banque
// de sang. On inclut donc BANQUE_DE_SANG + HOPITAL.
// ============================================================

/** Types d'établissements qui acceptent les dons */
const TYPES_QUI_PRENNENT_DONS = ["BANQUE_DE_SANG", "HOPITAL"];

/**
 * Recherche les établissements proches (banques + hôpitaux).
 */
export async function obtenirBanquesProches(
  latitude: number,
  longitude: number,
  rayonKm = 50
): Promise<Etablissement[]> {
  const reponse = await api.get("/etablissements/recherche-proximite", {
    params: { latitude, longitude, rayon: rayonKm },
  });
  const data = reponse.data?.data ?? reponse.data;
  const liste = Array.isArray(data?.etablissements)
    ? data.etablissements
    : Array.isArray(data)
    ? data
    : [];

  // ✅ Inclut :
  //    - Les banques de sang
  //    - Les hôpitaux AVEC banque de sang
  // Exclut :
  //    - Les hôpitaux SANS banque (ils ne prennent pas de dons)
  return liste.filter((e: Etablissement) => {
    if (e.type === "BANQUE_DE_SANG") return true;
    if (e.type === "HOPITAL") {
      // Vérifie le champ possede_banque_de_sang
      const possede =
        typeof e.possede_banque_de_sang === "boolean"
          ? e.possede_banque_de_sang
          : e.possede_banque_de_sang === 1;
      return possede;
    }
    return false;
  });
}

/**
 * Fallback : tous les établissements (banques + hôpitaux).
 */
export async function obtenirToutesBanques(): Promise<Etablissement[]> {
  return obtenirBanquesProches(3.848, 11.502, 10000);
}

export async function obtenirCreneauxBanque(
  etablissementId: number
): Promise<Creneau[]> {
  const reponse = await api.get("/rdv/creneaux", {
    params: { etablissement_id: etablissementId },
  });
  const data = reponse.data?.data ?? reponse.data;
  const liste = Array.isArray(data?.creneaux)
    ? data.creneaux
    : Array.isArray(data)
    ? data
    : [];
  // Garde uniquement les créneaux actifs à venir
  return liste.filter((c: Creneau) => {
    const actif =
      typeof c.est_actif === "boolean" ? c.est_actif : c.est_actif === 1;
    const futur =
      new Date(c.date_creneau).getTime() >= Date.now() - 24 * 3600 * 1000;
    return actif && futur;
  });
}

export async function prendreRdv(payload: {
  creneau_id: number;
  etablissement_id: number;
  commentaire?: string;
}) {
  const reponse = await api.post("/rdv", payload);
  return reponse.data?.data ?? reponse.data;
}

// ------------------------------------------------------------
// Itinéraire vers une adresse
// ------------------------------------------------------------
export function ouvrirItineraire(destination: {
  adresse?: string;
  ville?: string;
  latitude?: number;
  longitude?: number;
}) {
  let query = "";

  // Priorité aux coordonnées si disponibles
  if (destination.latitude != null && destination.longitude != null) {
    query = `${destination.latitude},${destination.longitude}`;
  } else {
    query = [destination.adresse, destination.ville]
      .filter(Boolean)
      .join(", ");
  }

  if (!query) return;

  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// Fonction dans api.ts :
export function ouvrirSurCarte(destination: {
  adresse?: string;
  ville?: string;
}) {
  const query = [destination.adresse, destination.ville]
    .filter(Boolean)
    .join(", ");
  if (!query) return;
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    "_blank"
  );
}


// ============================================================
// GÉOLOCALISATION INVERSE (OpenStreetMap Nominatim)
// ============================================================
// Transforme lat/lng en ville + quartier.
// API gratuite, sans clé, mais limitée à 1 req/sec.
// ============================================================

export interface AdresseGeocodee {
  ville?: string;
  quartier?: string;
  adresse?: string;
  region?: string;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<AdresseGeocodee> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "fr");

    const reponse = await fetch(url.toString(), {
      headers: {
        // Nominatim exige un User-Agent identifiable
        "User-Agent": "Aidora-App/1.0",
      },
    });

    if (!reponse.ok) throw new Error("Erreur de géocodage");

    const data = await reponse.json();
    const addr = data.address ?? {};

    // Priorité aux champs locaux (Cameroun)
    const ville =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      "";
    const quartier =
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.hamlet ||
      "";
    const region = addr.state || addr.region || "";

    // Compose une adresse lisible
    const adresseParts = [
      addr.road,
      addr.house_number,
    ].filter(Boolean);
    const adresse = adresseParts.join(" ") || data.display_name || "";

    return {
      ville: ville || undefined,
      quartier: quartier || undefined,
      adresse: adresse || undefined,
      region: region || undefined,
    };
  } catch (err) {
    console.error("[reverseGeocode]", err);
    return {};
  }
}