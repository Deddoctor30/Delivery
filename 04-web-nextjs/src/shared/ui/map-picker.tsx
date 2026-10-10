"use client";

import dynamic from "next/dynamic";

import { MapPlaceholder } from "./map-placeholder";

export type MapPickerCoords = { lat: number; lng: number };

export interface MapPickerProps {
  value: MapPickerCoords;
  onChange: (coords: MapPickerCoords) => void;
  height?: number;
  className?: string;
}

// Leaflet работает только в браузере → грузим динамически без SSR.
// Пока грузится — показываем стилизованный плейсхолдер.
const MapPickerImpl = dynamic(() => import("./map-picker-impl"), {
  ssr: false,
  loading: () => <MapPlaceholder height={320} className="rounded-none" />,
});

export function MapPicker(props: MapPickerProps) {
  return <MapPickerImpl {...props} />;
}
