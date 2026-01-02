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
        
              const profile = await axios.get("http://192.168.100.4:8000/api/users/me/", {
                headers: { Authorization: `Bearer ${token}` },
              });
            
         console.log("profile", profile.data);
        if (profile.data.role !== "admin") {
          router.push("/not-authorized");
          return;
        }
       

        // ✅ Teste aussi la validité du token côté serveur (optionnel)
        await axios.post("http://192.168.100.4:8000/api/token/verify/", {
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