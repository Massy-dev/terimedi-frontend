// app/admin/pharmacies/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import Link from "next/link";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Pharmacy {
  id: string;
  name: string;
  logo: string | null;
  owner: string;
  email: string;
  phone_number: string;
  address: string;
  description: string;
  is_approved: boolean;
  is_deleted: boolean;
  statut: "active" | "en_attente" | "rejetee" | "suspendue";
  created_at: string;
  nombreCommandes: number;
  revenu: number;
}

const mockPharmacies: Pharmacy[] = [];

const statutConfig = {
  active: { label: "Active", color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle },
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: AlertCircle },
  rejetee: { label: "Rejetée", color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
  suspendue: { label: "Suspendue", color: "bg-gray-100 text-gray-800 border-gray-300", icon: XCircle },
};

export default function ListPharmacies() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(mockPharmacies);
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("tous");
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"valider" | "rejeter" | "supprimer" | "suspendre">("valider");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPharmacies() {
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
    }
    fetchPharmacies();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-green-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchSearch =
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatut = statutFilter === "tous" || pharmacy.statut === statutFilter;

    return matchSearch && matchStatut;
  });

  const stats = {
    total: pharmacies.length,
    active: pharmacies.filter((p) => p.is_approved === true).length,
    enAttente: pharmacies.filter((p) => p.is_approved === false && p.is_deleted===false).length,
    rejetees: pharmacies.filter((p) => p.is_deleted === true).length,
    suspendues: pharmacies.filter((p) => p.statut === "suspendue").length,
  };

  const openDialog = (pharmacy: Pharmacy, action: "valider" | "rejeter" | "supprimer" | "suspendre") => {
    setSelectedPharmacy(pharmacy);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleAction = () => {
    if (!selectedPharmacy) return;

    // TODO: Appel API pour effectuer l'action
    const updatedPharmacies = pharmacies.map((p) => {
      if (p.id === selectedPharmacy.id) {
        if (dialogAction === "valider") {
          return { ...p, statut: "active" as const };
        } else if (dialogAction === "rejeter") {
          return { ...p, statut: "rejetee" as const };
        } else if (dialogAction === "suspendre") {
          return { ...p, statut: "suspendue" as const };
        }
      }
      return p;
    });

    if (dialogAction === "supprimer") {
      setPharmacies(pharmacies.filter((p) => p.id !== selectedPharmacy.id));
    } else {
      setPharmacies(updatedPharmacies);
    }

    setDialogOpen(false);
    setSelectedPharmacy(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des pharmacies</h1>
        <p className="text-gray-600 mt-1">Validez, rejetez ou gérez les pharmacies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.enAttente}</div>
            <p className="text-xs text-muted-foreground mt-1">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejetees}</div>
            <p className="text-xs text-muted-foreground mt-1">Rejetées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{stats.suspendues}</div>
            <p className="text-xs text-muted-foreground mt-1">Suspendues</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Liste des pharmacies</CardTitle>
              <CardDescription>Gérez toutes les pharmacies inscrites</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
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
                  <SelectItem value="active">Actives</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="rejetee">Rejetées</SelectItem>
                  <SelectItem value="suspendue">Suspendues</SelectItem>
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
                  <TableHead>Pharmacie</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPharmacies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucune pharmacie trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPharmacies.map((pharmacy) => {
                    const config = statutConfig[pharmacy.statut];
                    const Icon = config.icon;
                    return (
                      <TableRow key={pharmacy.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={pharmacy.logo || undefined} />
                              <AvatarFallback className="bg-green-100 text-green-700">
                                {pharmacy.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{pharmacy.name}</p>
                              <p className="text-xs text-gray-500">
                                Inscrit le {new Date(pharmacy.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{pharmacy.owner}</p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-1" />
                              {pharmacy.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {pharmacy.phone_number}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            <div>
                              <p className="font-medium">{pharmacy.description}</p>
                              <p className="text-xs text-gray-500">{pharmacy.address}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={config.color} variant="outline">
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {pharmacy.is_approved === true && pharmacy.is_deleted ===false ? (
                            <div>
                              <p className="text-sm font-medium">{pharmacy.nombreCommandes} commandes</p>
                              <p className="text-xs text-gray-500">
                                {(pharmacy.revenu / 1000000).toFixed(1)}M FCFA
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/admin/pharmacy/${pharmacy.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            {pharmacy.is_approved === false && pharmacy.is_deleted ===false && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => openDialog(pharmacy, "valider")}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => openDialog(pharmacy, "rejeter")}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {pharmacy.is_approved === true && pharmacy.is_deleted === false && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => openDialog(pharmacy, "suspendre")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openDialog(pharmacy, "supprimer")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                `Voulez-vous vraiment valider "${selectedPharmacy?.name}" ? La pharmacie pourra commencer à utiliser la plateforme.`}
              {dialogAction === "rejeter" &&
                `Voulez-vous vraiment rejeter "${selectedPharmacy?.name}" ? Cette action peut être annulée plus tard.`}
              {dialogAction === "suspendre" &&
                `Voulez-vous vraiment suspendre "${selectedPharmacy?.name}" ? La pharmacie ne pourra plus utiliser la plateforme temporairement.`}
              {dialogAction === "supprimer" &&
                `Êtes-vous sûr de vouloir supprimer "${selectedPharmacy?.name}" ? Cette action est irréversible.`}
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