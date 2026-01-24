"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Image from 'next/image'

type Disponibilite = "disponible" | "rupture";

interface OrderItem {
  id: string;
  produit: string;
  quantity: number;
  unit_price: number;
  prescription_image?: string | null;
  disponibilite: Disponibilite;
  note_pharmacie?: string;
}

interface Order {
  id: string;
  order_number: string;
  delivery_fee?: number;
  items: OrderItem[];
}

export default function SetPricesPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState<number | string>(0);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // token pharmacie stocké localement après login pharmacie
  //const token = typeof window !== "undefined" ? localStorage.getItem("pharmacy_token") : null;

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/detail/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      console.log("res", res);
      const data = res.data;
      setOrder(data);

      // Mappe les produits en items avec champs additionnels
      const mapped: OrderItem[] = (data.items ?? []).map((p: OrderItem) => ({
        id: p.id,
        produit: p.produit,
        quantity: p.quantity,
        unit_price: p.unit_price ?? 0,
        prescription_image: p.prescription_image ?? null,
        disponibilite: p.disponibilite ?? "disponible",
        note_pharmacie: p.note_pharmacie ?? "",
      }));
      

      setItems(mapped);
      setDeliveryFee(data.delivery_fee ?? 0);
    } catch (err: unknown) {
      console.error("fetchOrder error", err);
      setError("Impossible de charger la commande.");
    } finally {
      setLoading(false);
    }
  };

  const updateItemField =  <K extends keyof OrderItem>(
    index: number,
    field: K,
    value: OrderItem[K]
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, i) => {
      const qty = Number(i.quantity ?? 0);
      const price = Number(i.unit_price ?? 0);
      return sum + qty * price;
    }, 0);
    return itemsTotal + Number(deliveryFee || 0);
  };

  const submitPrices = async () => {
    setIsSubmitting(true);
    setError(null);

    // validation minimale : chaque item doit avoir un price si disponible
    for (const i of items) {
      if (i.disponibilite && (!i.unit_price || Number(i.unit_price) < 0)) {
        setError("Renseigne un prix valide pour chaque médicament disponible.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        items: items.map((i) => ({
          id: i.id,
          unit_price: Number(i.unit_price ?? 0),
          disponibilite: i.disponibilite === undefined ? 'disponible' : i.disponibilite,
          note_pharmacie: i.note_pharmacie ?? "",
        })),
        delivery_fee: Number(deliveryFee || 0),
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}/soumettre-devis/`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      // succès
      alert("Devis envoyé au client !");
      router.push("/dashboard/pharmacy/orders");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "Erreur lors de l'envoi du devis";
        setError(String(message));
      } else {
        setError("Erreur inconnue");
      }
    }finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Chargement...</p>;
  if (error)
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={() => fetchOrder()}
        >
          Réessayer
        </button>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">
        Saisir les prix — Commande #{order?.order_number}
      </h1>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="p-4 border rounded-lg bg-gray-50 flex gap-4 items-start"
          >
            <div className="w-20 h-20 flex-shrink-0">
              {item.prescription_image ? (
                <Image
                  src={item.prescription_image}
                  alt="Prescription"
                  className="w-20 h-20 rounded object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                  📦
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="font-semibold">{item.produit}</p>
              <p className="text-sm text-gray-600">Quantité : {item.quantity}</p>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                <div>
                  <label className="block text-sm">Prix unitaire (FCFA)</label>
                  <input
                    type="number"
                    value={item.unit_price ?? 0}
                    name="unit_price"
                    onChange={(e) =>
                      updateItemField(index, "unit_price", Number(e.target.value))
                    }
                    className="mt-1 w-full border p-2 rounded"
                    placeholder="0"
                    min={0}
                  />
                </div>

                <div>
                  <label className="block text-sm">Disponibilité</label>
                  <select
                    value={item.disponibilite}
                    name="disponibilite"
                    onChange={(e) =>
                      updateItemField(index, "disponibilite", e.target.value as Disponibilite)
                    }
                    className="mt-1 w-full border p-2 rounded"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="rupture">En rupture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm">Note pharmacie</label>
                  <input
                    type="text"
                    name="note_pharmacie"
                    value={item.note_pharmacie ?? ""}
                    onChange={(e) => updateItemField(index, "note_pharmacie", e.target.value)}
                    className="mt-1 w-full border p-2 rounded"
                    placeholder="Ex: générique disponible, délai, etc."
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <label className="block font-medium">Frais de livraison (FCFA)</label>
        <input
          type="number"
          name="delivery_fee"
          className="border rounded p-2 w-full mt-1"
          value={deliveryFee}
          onChange={(e) => setDeliveryFee(e.target.value)}
        />
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p className="text-lg font-semibold">Total : {calculateTotal()} FCFA</p>
      </div>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      <button
        onClick={submitPrices}
        disabled={isSubmitting}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700 disabled:bg-gray-400"
      >
        {isSubmitting ? "Envoi..." : "Envoyer le devis au client"}
      </button>
    </div>
  );
}
