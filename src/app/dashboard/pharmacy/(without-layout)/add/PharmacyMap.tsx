"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({
  onSelect,
}: {
  onSelect: (pos: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

export default function PharmacyMap({
  position,
  onSelect,
}: {
  position: { lat: number; lng: number };
  onSelect: (pos: { lat: number; lng: number }) => void;
}) {
  return (
    
      <MapContainer
        center={position}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker onSelect={onSelect} />
        <Marker position={position} icon={markerIcon} />
      </MapContainer>
    
  );
}
