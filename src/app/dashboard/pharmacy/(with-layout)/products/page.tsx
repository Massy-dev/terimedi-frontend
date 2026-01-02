// app/pharmacien/stock/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
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
  Plus, 
  Edit, 
  AlertTriangle, 
  Package, 
  TrendingDown,
  Filter
} from "lucide-react";

interface Medicament {
  id: string;
  nom: string;
  categorie: string;
  prixUnitaire: number;
  quantiteStock: number;
  seuilAlerte: number;
  dateExpiration: string;
  reference: string;
}

const mockMedicaments: Medicament[] = [
  {
    id: "1",
    nom: "Paracétamol 500mg",
    categorie: "Antalgique",
    prixUnitaire: 2500,
    quantiteStock: 150,
    seuilAlerte: 50,
    dateExpiration: "2025-12-31",
    reference: "MED-001",
  },
  {
    id: "2",
    nom: "Amoxicilline 1g",
    categorie: "Antibiotique",
    prixUnitaire: 5500,
    quantiteStock: 30,
    seuilAlerte: 40,
    dateExpiration: "2025-06-30",
    reference: "MED-002",
  },
  {
    id: "3",
    nom: "Ibuprofène 400mg",
    categorie: "Anti-inflammatoire",
    prixUnitaire: 3000,
    quantiteStock: 85,
    seuilAlerte: 50,
    dateExpiration: "2026-03-15",
    reference: "MED-003",
  },
  {
    id: "4",
    nom: "Vitamine C 1000mg",
    categorie: "Complément",
    prixUnitaire: 2500,
    quantiteStock: 200,
    seuilAlerte: 100,
    dateExpiration: "2025-09-20",
    reference: "MED-004",
  },
  {
    id: "5",
    nom: "Oméprazole 20mg",
    categorie: "Gastro-entérologie",
    prixUnitaire: 4000,
    quantiteStock: 15,
    seuilAlerte: 30,
    dateExpiration: "2025-11-10",
    reference: "MED-005",
  },
  {
    id: "6",
    nom: "Loratadine 10mg",
    categorie: "Antihistaminique",
    prixUnitaire: 3500,
    quantiteStock: 60,
    seuilAlerte: 40,
    dateExpiration: "2026-01-25",
    reference: "MED-006",
  },
  {
    id: "7",
    nom: "Metformine 850mg",
    categorie: "Antidiabétique",
    prixUnitaire: 6000,
    quantiteStock: 25,
    seuilAlerte: 35,
    dateExpiration: "2025-08-05",
    reference: "MED-007",
  },
];

export default function StockPage() {
  const [medicaments, setMedicaments] = useState<Medicament[]>(mockMedicaments);
  const [searchQuery, setSearchQuery] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<string>("tous");
  const [stockFilter, setStockFilter] = useState<string>("tous");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  
  const [formData, setFormData] = useState({
    nom: "",
    categorie: "",
    prixUnitaire: "",
    quantiteStock: "",
    seuilAlerte: "",
    dateExpiration: "",
    reference: "",
  });

  const categories = Array.from(new Set(medicaments.map(m => m.categorie)));

  const filteredMedicaments = medicaments.filter((med) => {
    const matchSearch = 
      med.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchCategorie = categorieFilter === "tous" || med.categorie === categorieFilter;
    
    let matchStock = true;
    if (stockFilter === "faible") {
      matchStock = med.quantiteStock <= med.seuilAlerte;
    } else if (stockFilter === "normal") {
      matchStock = med.quantiteStock > med.seuilAlerte;
    }
    
    return matchSearch && matchCategorie && matchStock;
  });

  const stats = {
    total: medicaments.length,
    stockFaible: medicaments.filter(m => m.quantiteStock <= m.seuilAlerte).length,
    valeurTotale: medicaments.reduce((acc, m) => acc + (m.prixUnitaire * m.quantiteStock), 0),
  };

  const getStockStatus = (med: Medicament) => {
    if (med.quantiteStock === 0) {
      return { label: "Rupture", color: "bg-red-100 text-red-800 border-red-300" };
    } else if (med.quantiteStock <= med.seuilAlerte) {
      return { label: "Stock faible", color: "bg-orange-100 text-orange-800 border-orange-300" };
    }
    return { label: "Disponible", color: "bg-green-100 text-green-800 border-green-300" };
  };

  const handleAddMedicament = () => {
    // TODO: Appel API pour ajouter le médicament
    const newMed: Medicament = {
      id: String(medicaments.length + 1),
      nom: formData.nom,
      categorie: formData.categorie,
      prixUnitaire: Number(formData.prixUnitaire),
      quantiteStock: Number(formData.quantiteStock),
      seuilAlerte: Number(formData.seuilAlerte),
      dateExpiration: formData.dateExpiration,
      reference: formData.reference,
    };
    setMedicaments([...medicaments, newMed]);
    setOpenAddDialog(false);
    setFormData({
      nom: "",
      categorie: "",
      prixUnitaire: "",
      quantiteStock: "",
      seuilAlerte: "",
      dateExpiration: "",
      reference: "",
    });
  };

  const handleEditMedicament = () => {
    if (!selectedMedicament) return;
    // TODO: Appel API pour modifier le médicament
    const updatedMeds = medicaments.map(m => 
      m.id === selectedMedicament.id 
        ? { ...selectedMedicament, ...formData, 
            prixUnitaire: Number(formData.prixUnitaire),
            quantiteStock: Number(formData.quantiteStock),
            seuilAlerte: Number(formData.seuilAlerte) 
          }
        : m
    );
    setMedicaments(updatedMeds);
    setOpenEditDialog(false);
    setSelectedMedicament(null);
  };

  const openEdit = (med: Medicament) => {
    setSelectedMedicament(med);
    setFormData({
      nom: med.nom,
      categorie: med.categorie,
      prixUnitaire: String(med.prixUnitaire),
      quantiteStock: String(med.quantiteStock),
      seuilAlerte: String(med.seuilAlerte),
      dateExpiration: med.dateExpiration,
      reference: med.reference,
    });
    setOpenEditDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du stock</h1>
          <p className="text-gray-600 mt-1">Gérez l'inventaire de vos médicaments</p>
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un médicament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un médicament</DialogTitle>
              <DialogDescription>
                Remplissez les informations du nouveau médicament
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nom">Nom du médicament</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Paracétamol 500mg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Ex: MED-008"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <Input
                  id="categorie"
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  placeholder="Ex: Antalgique"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="prix">Prix unitaire (FCFA)</Label>
                  <Input
                    id="prix"
                    type="number"
                    value={formData.prixUnitaire}
                    onChange={(e) => setFormData({ ...formData, prixUnitaire: e.target.value })}
                    placeholder="2500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantite">Quantité</Label>
                  <Input
                    id="quantite"
                    type="number"
                    value={formData.quantiteStock}
                    onChange={(e) => setFormData({ ...formData, quantiteStock: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="seuil">Seuil d'alerte</Label>
                  <Input
                    id="seuil"
                    type="number"
                    value={formData.seuilAlerte}
                    onChange={(e) => setFormData({ ...formData, seuilAlerte: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expiration">Date d'expiration</Label>
                  <Input
                    id="expiration"
                    type="date"
                    value={formData.dateExpiration}
                    onChange={(e) => setFormData({ ...formData, dateExpiration: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddMedicament}>
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total médicaments</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <Package className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock faible</p>
                <p className="text-3xl font-bold mt-2 text-orange-600">{stats.stockFaible}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur totale</p>
                <p className="text-3xl font-bold mt-2 text-green-600">
                  {(stats.valeurTotale / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-500 mt-1">FCFA</p>
              </div>
              <TrendingDown className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Liste des médicaments</CardTitle>
              <CardDescription>Gérez votre inventaire</CardDescription>
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
              <Select value={categorieFilter} onValueChange={setCategorieFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="faible">Stock faible</SelectItem>
                  <SelectItem value="normal">Stock normal</SelectItem>
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
                  <TableHead>Référence</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicaments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Aucun médicament trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedicaments.map((med) => {
                    const status = getStockStatus(med);
                    return (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">{med.reference}</TableCell>
                        <TableCell>{med.nom}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{med.categorie}</Badge>
                        </TableCell>
                        <TableCell>{med.prixUnitaire.toLocaleString()} FCFA</TableCell>
                        <TableCell>
                          <span className={med.quantiteStock <= med.seuilAlerte ? "text-orange-600 font-semibold" : ""}>
                            {med.quantiteStock}
                          </span>
                          <span className="text-gray-500 text-sm"> / {med.seuilAlerte}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color} variant="outline">
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(med.dateExpiration).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEdit(med)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
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

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le médicament</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du médicament
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nom">Nom du médicament</Label>
              <Input
                id="edit-nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-reference">Référence</Label>
              <Input
                id="edit-reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-categorie">Catégorie</Label>
              <Input
                id="edit-categorie"
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-prix">Prix unitaire (FCFA)</Label>
                <Input
                  id="edit-prix"
                  type="number"
                  value={formData.prixUnitaire}
                  onChange={(e) => setFormData({ ...formData, prixUnitaire: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-quantite">Quantité</Label>
                <Input
                  id="edit-quantite"
                  type="number"
                  value={formData.quantiteStock}
                  onChange={(e) => setFormData({ ...formData, quantiteStock: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-seuil">Seuil d'alerte</Label>
                <Input
                  id="edit-seuil"
                  type="number"
                  value={formData.seuilAlerte}
                  onChange={(e) => setFormData({ ...formData, seuilAlerte: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-expiration">Date d'expiration</Label>
                <Input
                  id="edit-expiration"
                  type="date"
                  value={formData.dateExpiration}
                  onChange={(e) => setFormData({ ...formData, dateExpiration: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditMedicament}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}