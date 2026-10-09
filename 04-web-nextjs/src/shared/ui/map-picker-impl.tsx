"use client";

import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { useRef } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { MapPickerCoords, MapPickerProps } from "./map-picker";


// import png может вернуть строку-URL (Turbopack) или StaticImageData ({src}) —
// приводим к строке в любом случае.
const toUrl = (img: unknown): string =>
  typeof img === "string" ? img : (img as { src: string }).src;

// Иконки маркера ломаются с бандлером — задаём явным L.icon (import png → { src }).
const markerIcon = L.icon({
  iconUrl: toUrl(iconUrl),
  iconRetinaUrl: toUrl(iconRetinaUrl),
  shadowUrl: toUrl(shadowUrl),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onChange }: { onChange: (c: MapPickerCoords) => void }) {
  useMapEvents({
    click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

export default function MapPickerImpl({ value, onChange, height = 320 }: MapPickerProps) {
  const markerRef = useRef<L.Marker>(null);
  return (
    <MapContainer
      center={[value.lat, value.lng]}
      zoom={12}
      scrollWheelZoom
      attributionControl={false}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      <Marker
        position={[value.lat, value.lng]}
        icon={markerIcon}
        draggable
        ref={markerRef}
        eventHandlers={{
          dragend: () => {
            const p = markerRef.current?.getLatLng();
            if (p) onChange({ lat: p.lat, lng: p.lng });
          },
        }}
      />
    </MapContainer>
  );
}
