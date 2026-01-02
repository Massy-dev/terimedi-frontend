"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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

        const profile = await axios.get("http://localhost:8000/api/users/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });

        if (profile.data.role === "pharmacien" && !profile.data.pharmacy) {
        router.push("/dashboard/pharmacy/add");
      } 
      
      else if (
        profile.data.role === "pharmacien" &&
        profile.data.pharmacy.status === "pending"
      ) { router.push("/dashboard/pharmacy/pending");} 
      
      else if (profile.data.role === "admin") {
        router.push("/dashboard/admin");
      } 
      
      else {
        router.push("/dashboard/admin");
      }

      setLoading(false);

      } catch (error) {
        console.error("Erreur d’authentification :", error);
        router.push("/auth/login");
      }
// récupération du profil pour décider de la redirection
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