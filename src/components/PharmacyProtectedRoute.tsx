"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  is_admin?: boolean;
  role?: string;
}

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        
        const token = localStorage.getItem("token");
        
        if (!token) {
          router.push("/auth/login");
          return;
        }

        // ✅ Décodage du token JWT pour vérifier expiration
        const decoded: DecodedToken = jwtDecode(token);
        
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          localStorage.removeItem("token");
          router.push("/auth/login");
          return;
        }

        // ✅ Vérifie si c’est bien un admin
        // !(decoded.is_admin || à ajouter après
        // récupération du profil pour verification du role 
        
              const profile = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pharmacies/me/`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              
             
        
         if (profile.data.user.role !== "pharmacien") {
          router.push("/not-authorized");
          return;
        }
        else if (profile.data.user.role === "pharmacien" && profile.data.pharmacy === null) {
          router.push("/dashboard/pharmacy/add");
          return;
        }
        else if (profile.data.user.role === "pharmacien" && profile.data.pharmacy.is_approved === false) {
          router.push("/dashboard/pharmacy/pending");
          return;
        }
        
      else {
          router.push("/dashboard/pharmacy");
          return;
        }

        // ✅ Teste aussi la validité du token côté serveur (optionnel)
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token/verify/`, {
          token:token
        });

        setLoading(false);
      } catch (error) {
        console.error("Erreur d’authentification :", error);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}




/*import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/auth/login");
  }, [router]);

  return <>{children}</>;
}
*/