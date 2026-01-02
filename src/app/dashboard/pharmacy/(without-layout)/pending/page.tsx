"use client"

import PendingPage from "./pending";  
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState, useEffect } from "react";

export default function AddPharmacyPage() {
  
  const router = useRouter();
  
  useEffect(() => {

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
    
      if (!token) {
            router.push("/auth/login");
            return;
          }

      const profile = await axios.get("http://localhost:8000/api/pharmacies/me/", {
                    headers: { Authorization: `Bearer ${token}` },
                  });
      console.log("test")
      if (profile.data.user.role === "pharmacien" && profile.data.pharmacy.is_approved === true) {
              router.push("/dashboard/pharmacy");
              return;
            }
        

      
    };
    checkAuth();
  }, [router]);

  return (
        
        <PendingPage/> 
  );
}