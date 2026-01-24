// app/pharmacien/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import PharmacienOverview from "./dashboard"



export default function DashboardPage() { 

  const router = useRouter();
  useEffect(() => {

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
    
      if (!token) {
            router.push("/auth/login");
            return;
          }

      const profile = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pharmacies/me/`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
      console.log("test")
      if (profile.data.user.role === "pharmacien" && profile.data.pharmacy.is_approved === false) {
              router.push("/not-authorized");
              return;
            }


      
    };
    checkAuth();
  }, [router]);


return (
  <>
    <PharmacienOverview />
  </>
  
)
};
