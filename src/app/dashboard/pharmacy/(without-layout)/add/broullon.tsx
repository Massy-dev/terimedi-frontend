"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const defaultPosition = { lat: 5.345317, lng: -4.024429 }; // Abidjan par défaut

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ onSelect }: { onSelect: (pos: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

export default function PharmacyForm() {
  const [autoLocate, setAutoLocate] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm();

  // Récupération automatique de la position
  useEffect(() => {
    if (autoLocate) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(coords);
          setValue("latitude", coords.lat);
          setValue("longitude", coords.lng);
          setLoadingLocation(false);
        },
        (err) => {
          console.error(err);
          setLoadingLocation(false);
          alert("Impossible de récupérer votre position GPS.");
        }
      );
    }
  }, [autoLocate, setValue]);

  const onSubmit = async (data: unknown) => {
    console.log("token",localStorage.getItem("token"));
    try {
      console.log("📦 Données à envoyer :", data);

      await axios.post("http://localhost:8000/api/pharmacies/", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ton token JWT
        },
      });

      alert("✅ Pharmacie ajoutée avec succès !");
    } catch (error) {
      console.error(error);
      alert("❌ Erreur lors de l’ajout de la pharmacie.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-5">
      <h1 className="text-2xl font-bold mb-6">🧾 Ajouter une Pharmacie</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">Nom de la pharmacie</label>
          <input
            {...register("name", { required: true })}
            className="border w-full p-2 rounded"
            placeholder="Pharmacie Sainte Marie"
          />
        </div>

        <div>
          <label className="block font-medium">Adresse</label>
          <input
            {...register("address", { required: true })}
            className="border w-full p-2 rounded"
            placeholder="Cocody Angré 7e tranche"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoLocate"
            checked={autoLocate}
            onChange={(e) => setAutoLocate(e.target.checked)}
          />
          <label htmlFor="autoLocate" className="text-sm">
            Je suis actuellement à la pharmacie
          </label>
        </div>

        {autoLocate ? (
          <p className="text-sm text-gray-500">
            {loadingLocation
              ? "📡 Localisation en cours..."
              : "✅ Localisation détectée automatiquement."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Latitude</label>
                <input
                  {...register("latitude", { required: true })}
                  className="border w-full p-2 rounded"
                  placeholder="5.345317"
                />
              </div>
              <div>
                <label>Longitude</label>
                <input
                  {...register("longitude", { required: true })}
                  className="border w-full p-2 rounded"
                  placeholder="-4.024429"
                />
              </div>
            </div>
          </>
        )}

        <div className="h-64 mt-4 border rounded overflow-hidden">
          <MapContainer
            center={position}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker
              onSelect={(pos) => {
                setPosition(pos);
                setValue("latitude", pos.lat);
                setValue("longitude", pos.lng);
              }}
            />
            <Marker position={position} icon={markerIcon} />
          </MapContainer>
        </div>

        <div>
          <label className="block font-medium">Téléphone</label>
          <input
            {...register("telephone", { required: true })}
            className="border w-full p-2 rounded"
            placeholder="+2250707070707"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            {...register("description")}
            className="border w-full p-2 rounded"
            placeholder="Ex: Ouverte 24h/24..."
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Enregistrer la pharmacie
        </button>
      </form>
    </div>
  );
}
