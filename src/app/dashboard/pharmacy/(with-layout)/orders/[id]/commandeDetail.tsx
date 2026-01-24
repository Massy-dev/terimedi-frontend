// app/pharmacien/commandes/[id]/commandeDetail.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Commande, CommandeStatut } from "@/types/commande";
import Image from 'next/image'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
} from "lucide-react";

type StatutConfig = {
  label: string;
  color: string;
  icon: React.ElementType;
};

interface CommandeDetailProps {
  commande: Commande;
  mode?: "accepte_par_client" | "devis_envoye" | "preparation" | "suivi" | "annulee" | "soumis";
}

const statutConfig:  Record<CommandeStatut, StatutConfig> = {
  soumis: { label: "Soumis", color: "bg-blue-100 text-blue-800", icon: Clock },
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  en_attente_de_prix: { label: "En attente de prix", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  devis_envoye: { label: "Devis envoyé", color: "bg-purple-100 text-purple-800", icon: Clock },
  accepte_par_client: { label: "Accepté par client", color: "bg-green-100 text-green-800", icon: CheckCircle },
  refuse_par_client: { label: "Refusé par client", color: "bg-red-100 text-red-800", icon: AlertCircle },
  reviser_prix: { label: "Révision demandée", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  en_preparation: { label: "En préparation", color: "bg-blue-100 text-blue-800", icon: Package },
  en_livraison: { label: "En livraison", color: "bg-purple-100 text-purple-800", icon: Truck },
  livree: { label: "Livrée", color: "bg-green-100 text-green-800", icon: CheckCircle },
  annulee: { label: "Annulée", color: "bg-gray-100 text-gray-800", icon: AlertCircle },
};

export default function CommandeDetail({ commande, mode }: CommandeDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'preparation' | 'livraison' | 'livree'>('preparation');

  const config = statutConfig[commande.statut];
  const Icon = config.icon;

  const items = commande.items ?? [];

  const sousTotal = items.reduce((acc, med) => {
  return acc + (med.unit_price ?? 0) * med.quantity;
  }, 0);

  const fraisLivraison = commande.delivery_fee ?? 0;

  const total = sousTotal + fraisLivraison;

  // Gérer les actions de changement de statut
  const handleAction = async () => {
    setIsLoading(true);
    try {
      let newStatut = '';
      
      if (dialogAction === 'preparation') {
        newStatut = 'en_preparation';
      } else if (dialogAction === 'livraison') {
        newStatut = 'en_livraison';
      } else if (dialogAction === 'livree') {
        newStatut = 'livree';
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${commande.id}/changer-statut/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ statut: newStatut }),
        }
      );

      if (!response.ok) throw new Error('Erreur lors du changement de statut');

      // Recharger la page
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Erreur lors du changement de statut');
    } finally {
      setIsLoading(false);
      setDialogOpen(false);
    }
  };

  const openDialog = (action: 'preparation' | 'livraison' | 'livree') => {
    setDialogAction(action);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{commande.order_number}</h1>
            <p className="text-gray-600 mt-1">Détails de la commande</p>
          </div>
        </div>
        <Badge className={`${config.color} text-sm py-2 px-4`} variant="outline">
          <Icon className="h-4 w-4 mr-2" />
          {config.label}
        </Badge>
      </div>

      {/* Messages selon le mode */}
      {mode === 'devis_envoye' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">En attente de la réponse du client</p>
                <p className="text-sm text-yellow-700">Le client examine votre devis.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === 'annulee' && typeof commande === 'object' && commande !== null && 'raison_refus' in commande && commande.raison_refus && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Commande refusée par le client</p>
                <p className="text-sm text-red-700 mt-1">{`Raison : ${commande.raison_refus ?? ''}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boutons d'action */}
      {commande.statut === 'accepte_par_client' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Commande acceptée !</p>
                  <p className="text-sm text-green-700">Le client a validé votre devis. Vous pouvez commencer la préparation.</p>
                </div>
              </div>
              <Button
                onClick={() => openDialog('preparation')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Package className="h-4 w-4 mr-2" />
                Commencer la préparation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {commande.statut === 'en_preparation' && (
        <div className="flex gap-3">
          <Button
            onClick={() => openDialog('livraison')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Truck className="h-4 w-4 mr-2" />
            Marquer en livraison
          </Button>
        </div>
      )}

      {commande.statut === 'en_livraison' && (
        <Button
          onClick={() => openDialog('livree')}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Marquer comme livrée
        </Button>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations client */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Contact client</p>
                <p className="text-base font-medium">{commande.clt_phone}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Adresse de livraison</p>
                <p className="text-base">{commande.adresse_livraison}</p>
              </div>
            </div>
            {commande.notes && (
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-base">{commande.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations de date */}
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
                  {new Date(commande.date_commande).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            {commande.devis_envoye_at && (
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Devis envoyé le</p>
                  <p className="font-medium">
                    {new Date(commande.devis_envoye_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}
            {commande.accepte_par_client_at && (
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Accepté le</p>
                  <p className="font-medium">
                    {new Date(commande.accepte_par_client_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Médicaments */}
      <Card>
        <CardHeader>
          <CardTitle>Médicaments commandés</CardTitle>
          <CardDescription>Liste des produits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commande.items?.map((med,index) => (
              <div key={med.id} className="flex items-start justify-between py-3 border-b last:border-0">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{med.produit}</p>
                    <p className="text-sm text-gray-500">Quantité: {med.quantity}</p>
                    {med.disponibilite !== 'disponible' && (
                      <Badge className="mt-1 bg-orange-100 text-orange-800" variant="secondary">
                        {med.note_pharmacie || 'Produit similaire'}
                      </Badge>
                    )}
                    
                    {med.prescription_image && (
                      <Image
                        src={med.prescription_image}
                        alt={med.produit}
                        className="mt-2 w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {med.unit_price && (
                    <>
                      <p className="text-sm text-gray-500">
                        {med.unit_price.toLocaleString()} FCFA × {med.quantity}
                      </p>
                      <p className="font-semibold">
                        {(med.unit_price * med.quantity).toLocaleString()} FCFA
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totaux */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sous-total</span>
              <span className="font-medium">{sousTotal.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frais de livraison</span>
              <span className="font-medium">{fraisLivraison.toLocaleString()} FCFA</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">{total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'preparation' && "Commencer la préparation"}
              {dialogAction === 'livraison' && "Marquer en livraison"}
              {dialogAction === 'livree' && "Marquer comme livrée"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'preparation' && "Confirmez que vous commencez la préparation de cette commande."}
              {dialogAction === 'livraison' && "Confirmez que la commande est prête et en cours de livraison."}
              {dialogAction === 'livree' && "Confirmez que la commande a été livrée au client."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAction}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Traitement..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}