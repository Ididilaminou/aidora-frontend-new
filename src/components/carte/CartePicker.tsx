// ============================================================
// AIDORA — CARTE PICKER (avec recherche par nom)
// ============================================================

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, MapPin, X } from "lucide-react";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const ICONE_POSITION = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ResultatRecherche {
  display_name: string;
  lat: string;
  lon: string;
}

interface CartePickerProps {
  position: [number, number] | null;
  onChange: (position: [number, number]) => void;
  hauteur?: string;
  zoom?: number;
}

// ------------------------------------------------------------
function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recentrer({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

// ============================================================
// COMPOSANT
// ============================================================

export function CartePicker({
  position,
  onChange,
  hauteur = "320px",
  zoom = 13,
}: CartePickerProps) {
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<ResultatRecherche[]>([]);
  const [chargementRecherche, setChargementRecherche] = useState(false);
  const [dropdownOuvert, setDropdownOuvert] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const centre: [number, number] = position ?? [3.848, 11.502];

  // Debounce sur la recherche
  useEffect(() => {
    if (recherche.trim().length < 3) {
      setResultats([]);
      setDropdownOuvert(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setChargementRecherche(true);
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", recherche);
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "6");
        url.searchParams.set("countrycodes", "cm");
        url.searchParams.set("accept-language", "fr");

        const reponse = await fetch(url.toString(), {
          headers: { "User-Agent": "Aidora-App/1.0" },
        });

        if (reponse.ok) {
          const data = await reponse.json();
          setResultats(Array.isArray(data) ? data : []);
          setDropdownOuvert(true);
        }
      } catch {
        setResultats([]);
      } finally {
        setChargementRecherche(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [recherche]);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOuvert(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choisirResultat(r: ResultatRecherche) {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    if (isNaN(lat) || isNaN(lon)) return;

    onChange([lat, lon]);
    setRecherche("");
    setResultats([]);
    setDropdownOuvert(false);
  }

  return (
    <div className="space-y-2">
      {/* BARRE DE RECHERCHE */}
      <div ref={dropdownRef} className="relative z-20">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Rechercher un lieu… (ex : Hôpital Central Yaoundé)"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          {chargementRecherche && (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary-500"
            />
          )}
          {!chargementRecherche && recherche && (
            <button
              type="button"
              onClick={() => {
                setRecherche("");
                setResultats([]);
                setDropdownOuvert(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* DROPDOWN RÉSULTATS */}
        {dropdownOuvert && resultats.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {resultats.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => choisirResultat(r)}
                className="flex w-full items-start gap-2 border-b border-neutral-100 px-3 py-2.5 text-left transition last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-primary-500" />
                <span className="line-clamp-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {r.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CARTE */}
      <div
        style={{ height: hauteur }}
        className="relative z-0 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
      >
        <MapContainer
          center={centre}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={(lat, lng) => onChange([lat, lng])} />
          {position && <Marker position={position} icon={ICONE_POSITION} />}
          <Recentrer position={position} />
        </MapContainer>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        💡 Tapez un nom pour rechercher, ou cliquez directement sur la carte.
      </p>
    </div>
  );
}