// ============================================================
// AIDORA — COMPOSANT CARTE INTERACTIVE
// ------------------------------------------------------------
// Affiche une carte OpenStreetMap avec des marqueurs colorés.
// Les icônes sont des SVG inline (aucune dépendance externe).
// ============================================================

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ------------------------------------------------------------
// Icône SVG inline — évite les appels réseau et les erreurs
// ------------------------------------------------------------
function creerIcone(couleur: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
      <path fill="${couleur}" stroke="#ffffff" stroke-width="2"
        d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z"/>
      <circle fill="#ffffff" cx="15" cy="15" r="5"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "aidora-marker",   // pas de classe leaflet par défaut
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
}

// ------------------------------------------------------------
// Icônes par type de marqueur
// ------------------------------------------------------------
const COULEURS = {
  banque:    "#dc2626", // rouge
  hopital:   "#2563eb", // bleu
  donneur:   "#16a34a", // vert
  personnel: "#ea580c", // orange
  vous:      "#7c3aed", // violet
} as const;

type TypeMarqueur = keyof typeof COULEURS;

const ICONES: Record<TypeMarqueur, L.DivIcon> = {
  banque:    creerIcone(COULEURS.banque),
  hopital:   creerIcone(COULEURS.hopital),
  donneur:   creerIcone(COULEURS.donneur),
  personnel: creerIcone(COULEURS.personnel),
  vous:      creerIcone(COULEURS.vous),
};

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
export interface Marqueur {
  id: number;
  position: [number, number];
  titre: string;
  sousTitre?: string;
  type?: TypeMarqueur;
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
// Composant
// ------------------------------------------------------------
export function CarteInteractive({
  marqueurs,
  centre = [3.848, 11.502],
  zoom = 12,
  hauteur = "500px",
  onMarkerClick,
}: CarteInteractiveProps) {
  return (
    <div
      style={{ height: hauteur, width: "100%" }}
      className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
    >
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

        {marqueurs.map((m) => {
          // ✅ Fallback : si le type n'existe pas, utilise "donneur"
          const icone = ICONES[m.type as TypeMarqueur] ?? ICONES.donneur;

          return (
            <Marker
              key={m.id}
              position={m.position}
              icon={icone}
              eventHandlers={{
                click: () => onMarkerClick?.(m.id),
              }}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-neutral-900">{m.titre}</h4>
                  {m.sousTitre && (
                    <p className="text-sm text-neutral-600">{m.sousTitre}</p>
                  )}
                  {m.details && <div className="mt-2">{m.details}</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}