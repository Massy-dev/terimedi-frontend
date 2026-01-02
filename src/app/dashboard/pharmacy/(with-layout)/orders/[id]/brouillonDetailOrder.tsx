// app/pharmacien/commandes/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import React from 'react';
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Pill,
} from "lucide-react";

interface CommandeDetail {

        "id": string;
        "produit": string;
        "order_number": string;
        "estimated_price": number;
        "statut": "en_attente" | "validee" | "en_preparation" | "livree" | "annulee";
        "confirmed_at": Date;

        "id_client": string;
        "username": string;
        "email": string;
        "first_name": string;
        "last_name": string;
        "phone": string;
        "delivery_fee":string;
                    

}



const statutConfig = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
  validee: { label: "Validée", color: "bg-blue-100 text-blue-800 border-blue-300", icon: CheckCircle },
  en_preparation: { label: "En préparation", color: "bg-purple-100 text-purple-800 border-purple-300", icon: Package },
  livree: { label: "Livrée", color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle },
  annulee: { label: "Annulée", color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
};

export default function CommandeDetailPage({ params }: { params:Promise<{ commande_id: string }> }) {
  const router = useRouter();
  const [commandeData, setCommandeData] = useState<CommandeDetail | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState<"valider" | "preparer" | "livrer" | "annuler">("valider");
  const [loading, setLoading] = useState(true);

  const config = statutConfig["en_attente"];
  const Icon = config.icon;
  const commande = React.use(params);

  console.log("commande---",commande.id

  )
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await axios.get(`http://localhost:8000/api/orders/detail/${commande.id}/`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

          const data = response.data;
          console.log("ma data ",data)
          setCommandeData(data);
        } catch (error) {
          console.error("Erreur chargement pharmacies:", error);
        } finally {
          setLoading(false);
        }
    }
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-green-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );

 

  const handleAction = (action: "valider" | "preparer" | "livrer" | "annuler") => {
    // TODO: Implémenter l'appel API pour changer le statut
    const newStatut = {
      valider: "validee" as const,
      preparer: "en_preparation" as const,
      livrer: "livree" as const,
      annuler: "annulee" as const,
    }[action];

    if (commandeData) {
      
      setCommandeData({ ...commandeData, statut: newStatut });
    }
    setOpenDialog(false);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{commandeData?.order_number}</h1>
            <p className="text-gray-600 mt-1">Détails de la commande</p>
          </div>
        </div>
        <Badge className={`${config.color} text-sm py-2 px-4`} variant="outline">
          <Icon className="h-4 w-4 mr-2" />
          {config.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom</p>
                  <p className="text-base font-medium">{commandeData?.id_client}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Téléphone</p>
                  <p className="text-base font-medium">{commandeData?.phone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Adresse de livraison</p>
                  <p className="text-base">{commandeData?.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Produits commandés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                
                  <div key={commandeData?.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{commandeData?.produit}</p>
                      <p className="text-sm text-gray-500">
                        Quantité: {commandeData?.estimated_price ? commandeData?.estimated_price : 10} × 
                        {commandeData?.estimated_price ? commandeData?.estimated_price.toLocaleString(): 1000} FCFA
                      </p>
                    </div>
                    <p className="font-semibold">
                      {commandeData?.estimated_price ? commandeData?.estimated_price.toLocaleString(): 1000} FCFA</p>
                  </div>
               
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">
                    {typeof commandeData?.estimated_price === 'number' && typeof commandeData?.delivery_fee === 'number'
                      ? (commandeData.estimated_price - commandeData.delivery_fee).toLocaleString()
                      : 0} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="font-medium">
                    {typeof commandeData?.delivery_fee === 'number'
                    ? commandeData?.delivery_fee.toLocaleString() : 0} FCFA</span>
                </div> 
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">{commandeData?.estimated_price ? commandeData?.estimated_price.toLocaleString(): 0} FCFA</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {commandeData?.phone && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{commandeData?.phone}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Gérer cette commande</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {commandeData?.statut === "en_attente" && (
                <>
                  <Dialog open={openDialog && actionType === "valider"} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setActionType("valider")}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider la commande
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Valider la commande</DialogTitle>
                        <DialogDescription>
                          Confirmez-vous la validation de cette commande ?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(false)}>
                          Annuler
                        </Button>
                        <Button onClick={() => handleAction("valider")}>
                          Confirmer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={openDialog && actionType === "annuler"} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full" onClick={() => setActionType("annuler")}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Annuler la commande
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Annuler la commande</DialogTitle>
                        <DialogDescription>
                          Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(false)}>
                          Retour
                        </Button>
                        <Button variant="destructive" onClick={() => handleAction("annuler")}>
                          Annuler la commande
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {commandeData?.statut === "validee" && (
                <Button className="w-full" onClick={() => {
                  setActionType("preparer");
                  handleAction("preparer");
                }}>
                  <Package className="h-4 w-4 mr-2" />
                  Marquer en préparation
                </Button>
              )}

              {commandeData?.statut === "en_preparation" && (
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => {
                  setActionType("livrer");
                  handleAction("livrer");
                }}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marquer comme livrée
                </Button>
              )}

              {commandeData?.phone && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/ordonnances/${commandeData?.phone}`} target="_blank">
                    Voir l ordonnance
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date de commande</p>
                  <p className="font-medium">
                    {new Date().toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}