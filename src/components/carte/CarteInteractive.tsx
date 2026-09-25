// ============================================================
// AIDORA — COMPOSANT CARTE INTERACTIVE
// ------------------------------------------------------------
// Affiche une carte OpenStreetMap avec des marqueurs.
// ============================================================

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Correctif pour les icônes Leaflet avec Vite (sinon les marqueurs sont invisibles)
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Configuration par défaut de l'icône
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
export interface Marqueur {
  id: number;
  position: [number, number]; // [latitude, longitude]
  titre: string;
  sousTitre?: string;
  type?: "banque" | "hopital" | "donneur" | "personnel" | "vous";
  details?: React.ReactNode;
}

interface CarteInteractiveProps {
  marqueurs: Marqueur[];
  centre?: [number, number];
  zoom?: number;
  hauteur?: string;
  onMarkerClick?: (id: number) => void;
}

// ------------------------------------------------------------
// Icônes personnalisées par type
// ------------------------------------------------------------
const icones = {
  banque: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  hopital: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  donneur: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  vous: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

export function CarteInteractive({
  marqueurs,
  centre = [3.848, 11.502], // Yaoundé par défaut
  zoom = 12,
  hauteur = "500px",
  onMarkerClick,
}: CarteInteractiveProps) {
  return (
    <div style={{ height: hauteur, width: "100%" }} className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
      <MapContainer
        center={centre}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {marqueurs.map((m) => (
          <Marker
            key={m.id}
            position={m.position}
            icon={icones[m.type]}
            eventHandlers={{
              click: () => onMarkerClick?.(m.id),
            }}
          >
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-neutral-900">{m.titre}</h4>
                {m.sousTitre && <p className="text-sm text-neutral-600">{m.sousTitre}</p>}
                {m.details && <div className="mt-2">{m.details}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}