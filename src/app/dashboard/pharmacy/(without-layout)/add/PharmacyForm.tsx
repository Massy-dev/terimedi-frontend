"use client";

import { useState, useEffect } from "react";
import { useFormContext, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const defaultPosition = { lat: 5.345317, lng: -4.024429 }; // Abidjan par défaut

interface PharmacyFormData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone_number: string;
  description?: string;
}

export default function PharmacyForm() {
  const router = useRouter();
  const [autoLocate, setAutoLocate] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const { register, handleSubmit, setValue } = useFormContext<PharmacyFormData>();
  console.log(position)
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

  const onSubmit: SubmitHandler<PharmacyFormData> = async (data) => {
    // If latitude/longitude might still be string, convert safely:
    const payload = {
      ...data,
      latitude:
        typeof data.latitude === "string"
          ? parseFloat(data.latitude)
          : data.latitude,
      longitude:
        typeof data.longitude === "string"
          ? parseFloat(data.longitude)
          : data.longitude,
    };

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/pharmacies/create/`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("✅ Pharmacie ajoutée avec succès !");
      router.push("/dashboard/pharmacy/pending/")
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object"
      ) {
        const errResponse = (error as { response: { data: unknown } }).response;
        console.error("Erreur serveur:", errResponse.data);
        alert("Erreur serveur: " + JSON.stringify(errResponse.data));
      } else {
        console.error(error);
        alert("❌ Erreur lors de l’ajout de la pharmacie.");
      }
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

        <div>
          <label className="block font-medium">Téléphone</label>
          <input
            {...register("phone_number", { required: true })}
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
