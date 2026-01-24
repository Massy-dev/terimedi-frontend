// app/pharmacien/profil/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Phone,
  Mail,
  Clock,
  Save,
  CheckCircle,
  Camera,
} from "lucide-react";

interface PharmacieProfile {
  nom: string;
  logo: string;
  description: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  horaires: {
    lundi: string;
    mardi: string;
    mercredi: string;
    jeudi: string;
    vendredi: string;
    samedi: string;
    dimanche: string;
  };
  services: string[];
  numeroAgrement: string;
  statut: "active" | "inactive";
}

const mockProfile: PharmacieProfile = {
  nom: "Pharmacie Centrale",
  logo: "/placeholder-pharmacy.png",
  description: "Votre pharmacie de confiance à Abidjan. Nous proposons une large gamme de médicaments et de produits de santé avec des pharmaciens qualifiés à votre service.",
  adresse: "Boulevard de la République, Plateau",
  ville: "Abidjan",
  telephone: "+225 27 XX XX XX XX",
  email: "contact@pharmaciecentrale.ci",
  horaires: {
    lundi: "08:00 - 18:00",
    mardi: "08:00 - 18:00",
    mercredi: "08:00 - 18:00",
    jeudi: "08:00 - 18:00",
    vendredi: "08:00 - 18:00",
    samedi: "08:00 - 14:00",
    dimanche: "Fermé",
  },
  services: ["Livraison à domicile", "Conseil pharmaceutique", "Garde de nuit", "Téléconsultation"],
  numeroAgrement: "AG-2024-0001",
  statut: "active",
};

export default function ProfilPage() {
  const [profile, setProfile] = useState<PharmacieProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Appel API pour sauvegarder le profil
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Upload du logo vers le serveur
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil de la pharmacie</h1>
          <p className="text-gray-600 mt-1">Gérez les informations de votre pharmacie</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Modifier le profil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Logo and Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo de la pharmacie</CardTitle>
              <CardDescription>Image de profil de votre établissement</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.logo} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-3xl">
                    {profile.nom.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label 
                    htmlFor="logo-upload" 
                    className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700"
                  >
                    <Camera className="h-4 w-4" />
                    <input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{profile.nom}</h3>
                <Badge className={profile.statut === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {profile.statut === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations réglementaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">N° d agrément</p>
                <p className="text-base font-semibold">{profile.numeroAgrement}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500">Services proposés</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.services.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nom">Nom de la pharmacie</Label>
                  <Input
                    id="nom"
                    value={profile.nom}
                    onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      value={profile.adresse}
                      onChange={(e) => setProfile({ ...profile, adresse: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Input
                      id="ville"
                      value={profile.ville}
                      onChange={(e) => setProfile({ ...profile, ville: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="telephone"
                        className="pl-10"
                        value={profile.telephone}
                        onChange={(e) => setProfile({ ...profile, telephone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Horaires d ouverture
              </CardTitle>
              <CardDescription>Définissez vos heures d ouverture pour chaque jour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(profile.horaires).map(([jour, horaire]) => (
                  <div key={jour} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium capitalize w-32">{jour}</span>
                    <Input
                      value={horaire}
                      onChange={(e) => setProfile({
                        ...profile,
                        horaires: { ...profile.horaires, [jour]: e.target.value }
                      })}
                      disabled={!isEditing}
                      className="max-w-xs"
                      placeholder="08:00 - 18:00"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Aperçu de votre activité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">248</p>
                  <p className="text-sm text-gray-600 mt-1">Commandes traitées</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">4.8</p>
                  <p className="text-sm text-gray-600 mt-1">Note moyenne</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">156</p>
                  <p className="text-sm text-gray-600 mt-1">Clients actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}