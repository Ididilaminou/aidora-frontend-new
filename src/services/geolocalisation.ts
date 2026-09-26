// ============================================================
// AIDORA — SERVICE GÉOLOCALISATION AVEC FALLBACKS MULTIPLES
// ------------------------------------------------------------
// 1. GPS navigateur (rapide si autorisé)
// 2. IP via ipapi.co
// 3. IP via ipwho.is (backup)
// 4. Position par défaut (Yaoundé)
// ============================================================

export interface Position {
  latitude: number;
  longitude: number;
  source: "gps" | "ip" | "defaut";
}

// Position par défaut : Yaoundé (Cameroun)
const POSITION_DEFAUT: Position = {
  latitude: 3.848,
  longitude: 11.502,
  source: "defaut",
};

/**
 * Récupère la position via l'API Geolocation du navigateur.
 */
function positionNavigateur(options: PositionOptions): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Géolocalisation non supportée"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          source: "gps",
        }),
      (err) => reject(err),
      options
    );
  });
}

/**
 * Fallback 1 : ipapi.co
 */
async function positionIpapiCo(): Promise<Position> {
  const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
  if (!res.ok) throw new Error(`ipapi.co HTTP ${res.status}`);

  const data = await res.json();
  if (!data.latitude || !data.longitude) {
    throw new Error("ipapi.co : coordonnées manquantes");
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    source: "ip",
  };
}

/**
 * Fallback 2 : ipwho.is (backup gratuit)
 */
async function positionIpwho(): Promise<Position> {
  const res = await fetch("https://ipwho.is/", { cache: "no-store" });
  if (!res.ok) throw new Error(`ipwho.is HTTP ${res.status}`);

  const data = await res.json();
  if (!data.success || !data.latitude || !data.longitude) {
    throw new Error("ipwho.is : coordonnées manquantes");
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    source: "ip",
  };
}

/**
 * Fallback 3 : ipinfo.io
 */
async function positionIpinfo(): Promise<Position> {
  const res = await fetch("https://ipinfo.io/json", { cache: "no-store" });
  if (!res.ok) throw new Error(`ipinfo.io HTTP ${res.status}`);

  const data = await res.json();
  if (!data.loc) throw new Error("ipinfo.io : loc manquant");

  const [lat, lon] = data.loc.split(",").map(Number);
  if (isNaN(lat) || isNaN(lon)) throw new Error("ipinfo.io : loc invalide");

  return {
    latitude: lat,
    longitude: lon,
    source: "ip",
  };
}

/**
 * ✅ FONCTION PRINCIPALE
 * Essaie dans l'ordre :
 *   1. GPS navigateur (15s)
 *   2. ipapi.co
 *   3. ipwho.is
 *   4. ipinfo.io
 *   5. Yaoundé par défaut
 */
export async function obtenirPosition(
  options: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 60000,
  }
): Promise<Position> {
  // -------- Tentative GPS --------
  try {
    const pos = await positionNavigateur(options);
    console.info("✅ [GEO] Position GPS obtenue");
    return pos;
  } catch (err: any) {
    console.warn(`⚠️ [GEO] GPS échoué (code ${err?.code}) → fallback IP`);
  }

  // -------- Fallback IP : 3 sources en cascade --------
  const sourcesIp = [
    { nom: "ipapi.co", fn: positionIpapiCo },
    { nom: "ipwho.is", fn: positionIpwho },
    { nom: "ipinfo.io", fn: positionIpinfo },
  ];

  for (const { nom, fn } of sourcesIp) {
    try {
      const pos = await fn();
      console.info(`✅ [GEO] Position IP obtenue via ${nom}`);
      return pos;
    } catch (err: any) {
      console.warn(`⚠️ [GEO] ${nom} échoué :`, err?.message);
    }
  }

  // -------- Dernier recours : position par défaut --------
  console.info("ℹ️ [GEO] Utilisation de la position par défaut (Yaoundé)");
  return POSITION_DEFAUT;
}