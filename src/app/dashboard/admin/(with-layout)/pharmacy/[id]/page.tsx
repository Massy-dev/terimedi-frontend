// app/admin/pharmacies/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  User,
  ShoppingCart,
  TrendingUp,
  Clock,
  AlertCircle,
  FileText,
  Edit,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PharmacyDetail {
  id: string;
  nom: string;
  logo: string | null;
  description: string;
  proprietaire: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
  contact: {
    email: string;
    telephone: string;
    adresse: string;
    ville: string;
    codePostal: string;
  };
  statut: "active" | "en_attente" | "rejetee" | "suspendue";
  dateInscription: string;
  dateValidation: string | null;
  stats: {
    nombreCommandes: number;
    revenuTotal: number;
    revenuMois: number;
    noteMoyenne: number;
    tauxLivraison: number;
  };
  documents: Array<{
    type: string;
    nom: string;
    url: string;
    dateAjout: string;
  }>;
  horaires: {
    [key: string]: string;
  };
}

interface Commande {
  id: string;
  numero: string;
  client: string;
  montant: number;
  statut: "en_attente" | "validee" | "en_preparation" | "livree" | "annulee";
  date: string;
}

const mockPharmacy: PharmacyDetail = {
  id: "1",
  nom: "Pharmacie Centrale",
  logo: null,
  description: "Pharmacie de référence à Abidjan, spécialisée dans la vente de médicaments et produits de santé. Service de qualité depuis 2020.",
  proprietaire: {
    nom: "Kouassi",
    prenom: "Jean",
    email: "jean.kouassi@email.ci",
    telephone: "+225 07 XX XX XX XX",
  },
  contact: {
    email: "contact@pharmaciecentrale.ci",
    telephone: "+225 27 XX XX XX XX",
    adresse: "Boulevard de la République",
    ville: "Abidjan",
    codePostal: "00225",
  },
  statut: "active",
  dateInscription: "2024-01-15",
  dateValidation: "2024-01-16",
  stats: {
    nombreCommandes: 324,
    revenuTotal: 48500000,
    revenuMois: 4850000,
    noteMoyenne: 4.7,
    tauxLivraison: 98.5,
  },
  documents: [
    { type: "Licence", nom: "licence-pharmacie.pdf", url: "#", dateAjout: "2024-01-15" },
    { type: "Diplôme", nom: "diplome-pharmacien.pdf", url: "#", dateAjout: "2024-01-15" },
    { type: "Assurance", nom: "assurance-responsabilite.pdf", url: "#", dateAjout: "2024-01-15" },
  ],
  horaires: {
    lundi: "08:00 - 18:00",
    mardi: "08:00 - 18:00",
    mercredi: "08:00 - 18:00",
    jeudi: "08:00 - 18:00",
    vendredi: "08:00 - 18:00",
    samedi: "08:00 - 14:00",
    dimanche: "Fermé",
  },
};

const mockCommandes: Commande[] = [
  { id: "1", numero: "CMD-2024-001", client: "Jean Kouassi", montant: 15000, statut: "livree", date: "2024-10-16" },
  { id: "2", numero: "CMD-2024-002", client: "Marie Koné", montant: 8500, statut: "en_preparation", date: "2024-10-16" },
  { id: "3", numero: "CMD-2024-003", client: "Yao Ange", montant: 22000, statut: "validee", date: "2024-10-16" },
  { id: "4", numero: "CMD-2024-004", client: "Adjoua Bamba", montant: 12500, statut: "livree", date: "2024-10-15" },
  { id: "5", numero: "CMD-2024-005", client: "Kouadio Serge", montant: 9800, statut: "en_attente", date: "2024-10-16" },
];

const revenusData = [
  { mois: "Mai", montant: 3800000 },
  { mois: "Juin", montant: 4200000 },
  { mois: "Juil", montant: 3900000 },
  { mois: "Août", montant: 4500000 },
  { mois: "Sept", montant: 4650000 },
  { mois: "Oct", montant: 4850000 },
];

const statutConfig = {
  active: { label: "Active", color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle },
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
  rejetee: { label: "Rejetée", color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
  suspendue: { label: "Suspendue", color: "bg-gray-100 text-gray-800 border-gray-300", icon: Ban },
};

const commandeStatutConfig = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  validee: { label: "Validée", color: "bg-blue-100 text-blue-800" },
  en_preparation: { label: "En préparation", color: "bg-purple-100 text-purple-800" },
  livree: { label: "Livrée", color: "bg-green-100 text-green-800" },
  annulee: { label: "Annulée", color: "bg-red-100 text-red-800" },
};

export default function PharmacyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<PharmacyDetail>(mockPharmacy);
  const [commandes, setCommandes] = useState<Commande[]>(mockCommandes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"valider" | "rejeter" | "suspendre" | "supprimer">("valider");

  const config = statutConfig[pharmacy.statut];
  const Icon = config.icon;

  const handleAction = () => {
    // TODO: Appel API
    if (dialogAction === "valider") {
      setPharmacy({ ...pharmacy, statut: "active" });
    } else if (dialogAction === "rejeter") {
      setPharmacy({ ...pharmacy, statut: "rejetee" });
    } else if (dialogAction === "suspendre") {
      setPharmacy({ ...pharmacy, statut: "suspendue" });
    } else if (dialogAction === "supprimer") {
      router.push("/admin/pharmacies");
    }
    setDialogOpen(false);
  };

  const openDialog = (action: "valider" | "rejeter" | "suspendre" | "supprimer") => {
    setDialogAction(action);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={pharmacy.logo || undefined} />
              <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                {pharmacy.nom.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pharmacy.nom}</h1>
              <p className="text-gray-600 mt-1">{pharmacy.contact.ville}</p>
            </div>
          </div>
        </div>
        <Badge className={`${config.color} text-sm py-2 px-4`} variant="outline">
          <Icon className="h-4 w-4 mr-2" />
          {config.label}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {pharmacy.statut === "en_attente" && (
          <>
            <Button
              onClick={() => openDialog("valider")}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Valider la pharmacie
            </Button>
            <Button
              variant="destructive"
              onClick={() => openDialog("rejeter")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </>
        )}
        {pharmacy.statut === "active" && (
          <Button
            variant="outline"
            onClick={() => openDialog("suspendre")}
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            <Ban className="h-4 w-4 mr-2" />
            Suspendre
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => openDialog("supprimer")}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </Button>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commandes</p>
                <p className="text-2xl font-bold mt-1">{pharmacy.stats.nombreCommandes}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenu total</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {(pharmacy.stats.revenuTotal / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold mt-1">
                  {(pharmacy.stats.revenuMois / 1000).toFixed(0)}K
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">
                  {pharmacy.stats.noteMoyenne}/5
                </p>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux livraison</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {pharmacy.stats.tauxLivraison}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="commandes">Commandes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>

        {/* Tab: Informations */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-base mt-1">{pharmacy.description}</p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Adresse</p>
                      <p className="text-base">{pharmacy.contact.adresse}</p>
                      <p className="text-base">{pharmacy.contact.ville}, {pharmacy.contact.codePostal}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Téléphone</p>
                      <p className="text-base">{pharmacy.contact.telephone}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base">{pharmacy.contact.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Propriétaire */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Propriétaire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                      {pharmacy.proprietaire.prenom.charAt(0)}{pharmacy.proprietaire.nom.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {pharmacy.proprietaire.prenom} {pharmacy.proprietaire.nom}
                    </p>
                    <p className="text-sm text-gray-500">Pharmacien</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">{pharmacy.proprietaire.email}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">{pharmacy.proprietaire.telephone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Horaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Horaires d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(pharmacy.horaires).map(([jour, horaire]) => (
                    <div key={jour} className="flex justify-between py-2 border-b last:border-0">
                      <span className="font-medium capitalize">{jour}</span>
                      <span className="text-gray-600">{horaire}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Graphique */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des revenus</CardTitle>
                <CardDescription>6 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(0)}K FCFA`} />
                    <Line type="monotone" dataKey="montant" stroke="#16a34a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Commandes */}
        <TabsContent value="commandes">
          <Card>
            <CardHeader>
              <CardTitle>Commandes récentes</CardTitle>
              <CardDescription>Les {commandes.length} dernières commandes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commandes.map((cmd) => (
                    <TableRow key={cmd.id}>
                      <TableCell className="font-medium">{cmd.numero}</TableCell>
                      <TableCell>{cmd.client}</TableCell>
                      <TableCell>{cmd.montant.toLocaleString()} FCFA</TableCell>
                      <TableCell>
                        <Badge className={commandeStatutConfig[cmd.statut].color} variant="secondary">
                          {commandeStatutConfig[cmd.statut].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(cmd.date).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documents administratifs
              </CardTitle>
              <CardDescription>Licences et certificats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pharmacy.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{doc.type}</p>
                        <p className="text-sm text-gray-500">{doc.nom}</p>
                        <p className="text-xs text-gray-400">
                          Ajouté le {new Date(doc.dateAjout).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        Télécharger
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Historique */}
        <TabsContent value="historique">
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
              <CardDescription>Actions et modifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Pharmacie validée</p>
                    <p className="text-sm text-gray-500">
                      Le {pharmacy.dateValidation ? new Date(pharmacy.dateValidation).toLocaleDateString('fr-FR') : '-'} par Admin
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Inscription</p>
                    <p className="text-sm text-gray-500">
                      Le {new Date(pharmacy.dateInscription).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "valider" && "Valider la pharmacie"}
              {dialogAction === "rejeter" && "Rejeter la pharmacie"}
              {dialogAction === "suspendre" && "Suspendre la pharmacie"}
              {dialogAction === "supprimer" && "Supprimer la pharmacie"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "valider" &&
                `Voulez-vous vraiment valider "${pharmacy.nom}" ? La pharmacie pourra commencer à utiliser la plateforme.`}
              {dialogAction === "rejeter" &&
                `Voulez-vous vraiment rejeter "${pharmacy.nom}" ? Cette action peut être annulée plus tard.`}
              {dialogAction === "suspendre" &&
                `Voulez-vous vraiment suspendre "${pharmacy.nom}" ? La pharmacie ne pourra plus utiliser la plateforme temporairement.`}
              {dialogAction === "supprimer" &&
                `Êtes-vous sûr de vouloir supprimer "${pharmacy.nom}" ? Cette action est irréversible.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant={dialogAction === "supprimer" || dialogAction === "rejeter" ? "destructive" : "default"}
              onClick={handleAction}
              className={
                dialogAction === "valider"
                  ? "bg-green-600 hover:bg-green-700"
                  : dialogAction === "suspendre"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : ""
              }
            >
              {dialogAction === "valider" && "Valider"}
              {dialogAction === "rejeter" && "Rejeter"}
              {dialogAction === "suspendre" && "Suspendre"}
              {dialogAction === "supprimer" && "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}