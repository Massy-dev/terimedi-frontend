"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { CheckCircle2, XCircle, Loader2 } from "lucide-react";


interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  is_approved: boolean;
  is_deleted: boolean;
  latitude: number;
  longitude: number;
}

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  

  
  const fetchPharmacies = async () => {
    console.log(localStorage.getItem("token"))
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pharmacies/liste/`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      const data = response.data.results;
      console.log(data)
      setPharmacies(data);
    } catch (error) {
      console.error("Erreur chargement pharmacies:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: boolean, typeStatut: string) => {
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pharmacies/${id}/${typeStatut}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ is_approved: newStatus }),
        }
      )

      if (response.ok) {
        setPharmacies((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, is_approved: newStatus as Pharmacy["is_approved"] } : p
          )
        );
      } else {
        console.error("Erreur de mise à jour du statut");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-green-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold mb-6 text-green-700"
      >
        Liste des pharmacies
      </motion.h1>

      <div className="overflow-x-auto border rounded-2xl shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-green-100 text-green-800">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Adresse</th>
              <th className="p-3 text-left">Téléphone</th>
              <th className="p-3 text-center">Statut</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pharmacies.map((pharmacy) => (
              <tr
                key={pharmacy.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3">{pharmacy.name}</td>
                <td className="p-3">{pharmacy.address}</td>
                <td className="p-3">{pharmacy.phone_number}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      pharmacy.is_approved === true
                        ? "bg-green-100 text-green-700"
                        : pharmacy.is_deleted === true
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >


                    {pharmacy.is_approved === false && pharmacy.is_deleted === false 
                      ? "En attente"
                      : pharmacy.is_deleted === true 
                      ? "Rejetée"
                      : "Validée"}

                  </span>
                </td>
                <td className="p-3 text-center space-x-2">
                  {pharmacy.is_approved === false && pharmacy.is_deleted === false ?(
                    <>
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4"
                        onClick={() => updateStatus(pharmacy.id, true, 'validate/')}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Valider
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-4"
                        onClick={() => updateStatus(pharmacy.id, true, 'reject/')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                      </button>
                    </>
                  ): ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pharmacies.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          Aucune pharmacie enregistrée pour le moment.
        </p>
      )}
    </div>
  );
}