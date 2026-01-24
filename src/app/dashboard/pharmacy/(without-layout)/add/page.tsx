"use client"
import PharmacyForm from './PharmacyForm';
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";

const PharmacyMap = dynamic(() => import("./PharmacyMap"), { ssr: false });

export default function AddPharmacyPage() {
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: 5.345317,
    lng: -4.024429,
  });
  const router = useRouter();
  console.log("test 2")
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

      if (profile.data.user.role === "pharmacien" && profile.data.pharmacy !== null) {
              router.push("/not-authorized");
              return;
            }
        

      
    };
    checkAuth();
  }, [router]);
  const methods = useForm();

  return (
    
      <div className="flex w-5/6 mx-auto gap-2 py-10 px-5">
        <FormProvider {...methods}>
          <div className="min-w-2/4">
            <PharmacyForm/>
          </div>
          <div className="mt-10 w-full border rounded overflow-hidden">
            <PharmacyMap
              position={position}
              onSelect={(pos) => {
                setPosition(pos);
                methods.setValue("latitude", pos.lat);
                methods.setValue("longitude", pos.lng);
              }}
            />
          </div>
        </FormProvider>
      </div>
   
    
  );
}
