"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import SoumettreDevis from "./SetPrices";
import CommandeDetail from "./commandeDetail";

interface Commande {
  id: number;
  order_number: string;
  statut: string;
  // ... autres champs
}

export default function PharmacyOrderRouter() {
  const params = useParams();
  const commandeId = params.id as string;
  
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Token pharmacie (connectée)
  const token = localStorage.getItem("token")

  useEffect(() => {
    async function loadCommande() {
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:8000/api/orders/detail/${commandeId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const order = res.data;
        setCommande(order);
       
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCommande();
  }, [commandeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
    if (error || !commande) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600">{error || 'Commande introuvable'}</p>
          </div>
        </div>
      );
    }
  
  

  // 🔍 Condition : le devis est-il déjà soumis ?
  const devisSubmitted =
  commande.statut === "soumis" ||
  commande.statut === "en_attente" 

if (devisSubmitted) {
  // ✔️ Le devis a déjà été soumis → aller vers la page de préparation
  return <SoumettreDevis commande={commande} mode="devis_envoye"/>;
} else {
  // ❌ Pas encore de devis → aller vers saisie des prix
  return <CommandeDetail commande={commande} mode="accepte_par_client" />;
}
}
