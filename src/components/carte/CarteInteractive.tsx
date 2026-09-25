// ============================================================
// AIDORA — COMPOSANT CARTE INTERACTIVE
// ------------------------------------------------------------
// Utilise CircleMarker (aucune image requise) → fonctionne
// en développement ET en production.
// ============================================================

import type { ReactNode } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
export interface Marqueur {
  id: number;
  position: [number, number];
  titre: string;
  sousTitre?: string;
  type?: "banque" | "hopital" | "donneur" | "personnel" | "vous";
  details?: ReactNode;
}

interface CarteInteractiveProps {
  marqueurs: Marqueur[];
  centre?: [number, number];
  zoom?: number;
  hauteur?: string;
  onMarkerClick?: (id: number) => void;
}

// ------------------------------------------------------------
// Couleurs et tailles par type
// ------------------------------------------------------------
const STYLES: Record<
  string,
  { couleur: string; rayon: number; bordure: number }
> = {
  banque:    { couleur: "#dc2626", rayon: 12, bordure: 3 },
  hopital:   { couleur: "#2563eb", rayon: 10, bordure: 3 },
  donneur:   { couleur: "#16a34a", rayon: 7,  bordure: 2 },
  personnel: { couleur: "#ea580c", rayon: 8,  bordure: 2 },
  vous:      { couleur: "#7c3aed", rayon: 11, bordure: 4 },
};

const STYLE_DEFAUT = STYLES.donneur;

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
          const style = STYLES[m.type ?? ""] ?? STYLE_DEFAUT;

          return (
            <CircleMarker
              key={m.id}
              center={m.position}
              radius={style.rayon}
              pathOptions={{
                color: "#ffffff",
                fillColor: style.couleur,
                fillOpacity: 0.9,
                weight: style.bordure,
              }}
              eventHandlers={{
                click: () => onMarkerClick?.(m.id),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <h4 className="font-bold text-neutral-900 text-sm">
                    {m.titre}
                  </h4>
                  {m.sousTitre && (
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {m.sousTitre}
                    </p>
                  )}
                  {m.details && <div className="mt-2 text-xs">{m.details}</div>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}