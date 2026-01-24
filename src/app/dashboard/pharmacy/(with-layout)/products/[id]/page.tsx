// src/app/dashboard/pharmacy/(with-layout)/products/[id]/page.tsx

"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const router = useRouter();
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Product Detail</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product ID: {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Cette page est en cours de développement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}