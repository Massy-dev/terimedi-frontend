// app/admin/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Types
interface AdminStats {
  pharmacies: {
    total: number;
    active: number;
    enAttente: number;
    rejetees: number;
  };
  users: {
    total: number;
    clients: number;
    pharmaciens: number;
    nouveaux: number;
  };
  commandes: {
    total: number;
    enCours: number;
    completees: number;
    montantTotal: number;
  };
  revenus: {
    aujourdhui: number;
    semaine: number;
    mois: number;
    croissance: number;
  };
}

// Données mockées
const mockStats: AdminStats = {
  pharmacies: {
    total: 45,
    active: 38,
    enAttente: 5,
    rejetees: 2,
  },
  users: {
    total: 1250,
    clients: 1205,
    pharmaciens: 45,
    nouveaux: 23,
  },
  commandes: {
    total: 3542,
    enCours: 127,
    completees: 3415,
    montantTotal: 52840000,
  },
  revenus: {
    aujourdhui: 1250000,
    semaine: 8750000,
    mois: 35600000,
    croissance: 12.5,
  },
};

const revenusData = [
  { mois: "Jan", montant: 25000000 },
  { mois: "Fév", montant: 28000000 },
  { mois: "Mar", montant: 32000000 },
  { mois: "Avr", montant: 29000000 },
  { mois: "Mai", montant: 34000000 },
  { mois: "Juin", montant: 35600000 },
];

const commandesParJour = [
  { jour: "Lun", commandes: 45 },
  { jour: "Mar", commandes: 52 },
  { jour: "Mer", commandes: 38 },
  { jour: "Jeu", commandes: 61 },
  { jour: "Ven", commandes: 73 },
  { jour: "Sam", commandes: 49 },
  { jour: "Dim", commandes: 34 },
];

const pharmaciesParVille = [
  { ville: "Abidjan", count: 28, color: "#16a34a" },
  { ville: "Bouaké", count: 7, color: "#3b82f6" },
  { ville: "Yamoussoukro", count: 5, color: "#f59e0b" },
  { ville: "San-Pedro", count: 3, color: "#8b5cf6" },
  { ville: "Autres", count: 2, color: "#6b7280" },
];

const topPharmacies = [
  { nom: "Pharmacie Centrale", commandes: 324, revenu: 4850000 },
  { nom: "Pharmacie du Plateau", commandes: 298, revenu: 4320000 },
  { nom: "Pharmacie d'Adjamé", commandes: 267, revenu: 3980000 },
  { nom: "Pharmacie de Cocody", commandes: 245, revenu: 3650000 },
  { nom: "Pharmacie de Yopougon", commandes: 223, revenu: 3340000 },
];

const recentActivities = [
  { type: "pharmacy", message: "Nouvelle pharmacie inscrite : Pharmacie Saint-Michel", time: "Il y a 5 min" },
  { type: "order", message: "127 nouvelles commandes aujourd'hui", time: "Il y a 15 min" },
  { type: "user", message: "23 nouveaux utilisateurs inscrits", time: "Il y a 1h" },
  { type: "validation", message: "Pharmacie du Port validée", time: "Il y a 2h" },
  { type: "alert", message: "5 pharmacies en attente de validation", time: "Il y a 3h" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(mockStats);
  setStats(stats);
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
        <p className="text-gray-600 mt-1">Vue d&apos;ensemble de la plateforme TeriMedi</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pharmacies</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pharmacies.total}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className="bg-green-100 text-green-800">{stats.pharmacies.active} actives</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">{stats.pharmacies.enAttente} en attente</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-green-600 font-medium">+{stats.users.nouveaux}</span> nouveaux cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.commandes.total}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.commandes.enCours} en cours de traitement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.revenus.mois / 1000000).toFixed(1)}M FCFA
            </div>
            <p className="text-xs text-green-600 font-medium mt-2">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{stats.revenus.croissance}% vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
            <CardDescription>Revenus mensuels des 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(1)}M FCFA`} />
                <Line type="monotone" dataKey="montant" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes par jour</CardTitle>
            <CardDescription>Volume de commandes cette semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={commandesParJour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="commandes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pharmacies by City */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition géographique</CardTitle>
            <CardDescription>Pharmacies par ville</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pharmaciesParVille}
                  dataKey="count"
                  nameKey="ville"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pharmaciesParVille.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Pharmacies */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pharmacies</CardTitle>
            <CardDescription>Meilleures performances ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPharmacies.map((pharmacy, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{pharmacy.nom}</p>
                      <p className="text-xs text-gray-500">{pharmacy.commandes} commandes</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {(pharmacy.revenu / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const icons = {
                  pharmacy: <Store className="h-4 w-4 text-blue-500" />,
                  order: <ShoppingCart className="h-4 w-4 text-green-500" />,
                  user: <Users className="h-4 w-4 text-purple-500" />,
                  validation: <CheckCircle className="h-4 w-4 text-green-500" />,
                  alert: <AlertCircle className="h-4 w-4 text-orange-500" />,
                };
                return (
                  <div key={index} className="flex items-start space-x-3">
                    {icons[activity.type as keyof typeof icons]}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {stats.pharmacies.enAttente > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">
                  {stats.pharmacies.enAttente} pharmacie(s) en attente de validation
                </p>
                <p className="text-sm text-orange-700">
                  Consultez la liste des pharmacies pour les approuver ou rejeter
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}