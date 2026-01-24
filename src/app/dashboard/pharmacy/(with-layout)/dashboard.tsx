"use client"


import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ShoppingCart,
  TrendingUp,
  Package,
  AlertCircle,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Types
interface Stats {
  commandesDuJour: number;
  revenuDuJour: number;
  commandesEnAttente: number;
  stockFaible: number;
}

interface Commande {
  id: string;
  numero: string;
  client: string;
  statut: "en_attente" | "validee" | "en_preparation" | "livree" | "annulee";
  montant: number;
  date: string;
}

// Données simulées (à remplacer par vos appels API)
const mockStats: Stats = {
  commandesDuJour: 24,
  revenuDuJour: 145000,
  commandesEnAttente: 8,
  stockFaible: 12,
};

const mockCommandes: Commande[] = [
  { id: "1", numero: "CMD-2024-001", client: "Jean Kouassi", statut: "en_attente", montant: 15000, date: "2024-10-16" },
  { id: "2", numero: "CMD-2024-002", client: "Marie Koné", statut: "validee", montant: 8500, date: "2024-10-16" },
  { id: "3", numero: "CMD-2024-003", client: "Yao Ange", statut: "en_preparation", montant: 22000, date: "2024-10-16" },
  { id: "4", numero: "CMD-2024-004", client: "Adjoua Bamba", statut: "livree", montant: 12500, date: "2024-10-16" },
  { id: "5", numero: "CMD-2024-005", client: "Kouadio Serge", statut: "en_attente", montant: 9800, date: "2024-10-16" },
];

const revenusData = [
  { jour: "Lun", montant: 120000 },
  { jour: "Mar", montant: 150000 },
  { jour: "Mer", montant: 98000 },
  { jour: "Jeu", montant: 135000 },
  { jour: "Ven", montant: 178000 },
  { jour: "Sam", montant: 145000 },
  { jour: "Dim", montant: 92000 },
];

const statutConfig = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  validee: { label: "Validée", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  en_preparation: { label: "En préparation", color: "bg-purple-100 text-purple-800", icon: Package },
  livree: { label: "Livrée", color: "bg-green-100 text-green-800", icon: CheckCircle },
  annulee: { label: "Annulée", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function PharmacienOverview() {
  const [stats, setStats] = useState<Stats>(mockStats);
  const [commandes, setCommandes] = useState<Commande[]>(mockCommandes);
  
  useEffect(() => {
    // TODO: Remplacer par vos appels API
    // fetchStats();
    // fetchCommandes();
    
  }, [commandes, stats]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">Bienvenue sur votre espace pharmacien</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes du jour</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.commandesDuJour}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+12%</span> par rapport à hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu du jour</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenuDuJour.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+8%</span> par rapport à hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.commandesEnAttente}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Commandes à traiter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.stockFaible}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Médicaments à réapprovisionner
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus de la semaine</CardTitle>
            <CardDescription>Évolution des revenus sur 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jour" />
                <YAxis />
                <Tooltip 
                  formatter={(value?: number) => 
                    value !== undefined
                    ?`${value.toLocaleString()} FCFA`
                    :"_"}
                />
                <Bar dataKey="montant" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Commandes récentes</CardTitle>
                <CardDescription>Les dernières commandes reçues</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/pharmacy/orders/">Voir tout</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commandes.slice(0, 5).map((commande) => {
                const config = statutConfig[commande.statut];
                const Icon = config.icon;
                return (
                  <div key={commande.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {commande.numero}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{commande.client}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">
                        {commande.montant.toLocaleString()} FCFA
                      </span>
                      <Badge className={config.color} variant="secondary">
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-24 flex flex-col items-center justify-center space-y-2" variant="outline" asChild>
              <Link href="/dashboard/pharmacy/orders/">
                <ShoppingCart className="h-6 w-6" />
                <span>Gérer les commandes</span>
              </Link>
            </Button>
            <Button className="h-24 flex flex-col items-center justify-center space-y-2" variant="outline" asChild>
              <Link href="/dashboard/pharmacy/products">
                <Package className="h-6 w-6" />
                <span>Gérer le stock</span>
              </Link>
            </Button>
            <Button className="h-24 flex flex-col items-center justify-center space-y-2" variant="outline" asChild>
              <a href="/dashboard/pharmacy/profile">
                <Eye className="h-6 w-6" />
                <span>Modifier le profil</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}