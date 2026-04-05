// app/pharmacien/commandes/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Eye, CheckCircle, Clock, XCircle, Package } from "lucide-react";

interface Commande {
  id: string;
  order_number:string;
  client: string;
  telephone: string;
  statut: "en_livraison"|"refuse_par_client" | "accepte_par_client"|"soumis" | "en_attente" | "devis_envoye" |"validee" | "en_preparation" | "livree" | "annulee";
  estimated_price: number;
  date_commande: string;
  produits: string;
}

const mockCommandes: Commande[] = [];

const statutConfig = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
  soumis: { label: "En attente de devis", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
  accepte_par_client: { label: "Accepté par le client", color: "bg-blue-100 text-blue-800 border-blue-300", icon: CheckCircle  },
  devis_envoye:{ label: "Devis envoyé", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
  validee: { label: "Validée", color: "bg-blue-100 text-blue-800 border-blue-300", icon: CheckCircle },
  en_preparation: { label: "En préparation", color: "bg-purple-100 text-purple-800 border-purple-300", icon: Package },
  en_livraison: { label: "En livraison", color: "bg-purple-100 text-purple-800 border-purple-300", icon: Package },
  livree: { label: "Livrée", color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle },
  refuse_par_client: { label: "Refusé par client", color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
  annulee: { label: "Annulée", color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
};

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>(mockCommandes);
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("tous");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

          const data = response.data;
          console.log("ma data ",response.data)
          setCommandes(data);
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

  const filteredCommandes = commandes.filter((commande) => {
    const matchSearch = "id client"
      //commande.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      //commande.client.toLowerCase().includes(searchQuery.toLowerCase());
   
    const matchStatut = statutFilter === "tous" || commande.statut === statutFilter;
    
    return matchSearch && matchStatut;
  });

  const stats = {
    total: commandes.length,
    refuse_par_client:commandes.filter(c => c.statut === "refuse_par_client").length,
    soumis: commandes.filter(c => c.statut === "soumis").length,
    en_attente: commandes.filter(c => c.statut === "en_attente").length,
    accepte_par_client:commandes.filter(c => c.statut === "accepte_par_client").length,
    validees: commandes.filter(c => c.statut === "validee").length,
    enPreparation: commandes.filter(c => c.statut === "en_preparation").length,
    en_livraison: commandes.filter(c => c.statut === "en_livraison").length,
    
    livrees: commandes.filter(c => c.statut === "livree").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
        <p className="text-gray-600 mt-1">Gérez toutes vos commandes</p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.en_attente}</div>
            <p className="text-xs text-muted-foreground mt-1">En attente</p>
          </CardContent>
        </Card>

        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.refuse_par_client}</div>
            <p className="text-xs text-muted-foreground mt-1">Refusé par les clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.enPreparation}</div>
            <p className="text-xs text-muted-foreground mt-1">En préparation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.livrees}</div>
            <p className="text-xs text-muted-foreground mt-1">Livrées</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Liste des commandes</CardTitle>
              <CardDescription>Filtrez et recherchez vos commandes</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une commande..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statutFilter} onValueChange={setStatutFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="devis_envoye">Devis envoyé</SelectItem>
                  <SelectItem value="accepte_par_client">Accepte par client</SelectItem>
                  <SelectItem value="refuse_par_client">Refusé par client</SelectItem>
                  
                  <SelectItem value="soumis">En attente</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="en_preparation">En préparation</SelectItem>
                  <SelectItem value="en_livraison">En livraison</SelectItem>
                  
                  <SelectItem value="livree">Livrée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommandes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommandes.map((commande) => {
                    
                    const config = statutConfig[commande.statut];
                    
                    const Icon = config.icon;
                    return (
                      <TableRow key={commande.id}>
                        <TableCell className="font-medium">{commande.order_number}</TableCell>
                        <TableCell>{commande.client}</TableCell>
                        <TableCell className="text-gray-600">{commande.telephone}</TableCell>
                        <TableCell>
                          <Badge className={config.color} variant="outline">
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {commande.estimated_price ? commande.estimated_price.toLocaleString(): "2222"} FCFA
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(commande.date_commande).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/pharmacy/orders/${commande.order_number}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}