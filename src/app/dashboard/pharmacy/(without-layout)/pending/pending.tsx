"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, LogOut } from "lucide-react";


export default function PendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6">
      {/* Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        {/* Icône principale */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <Clock className="text-green-600 w-12 h-12" />
          </div>
        </div>

        {/* Texte principal */}
        <h1 className="text-2xl font-semibold mb-3">
          Demande en attente de validation
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Merci d’avoir soumis les informations de votre pharmacie. Votre
          demande est actuellement en cours de validation par notre équipe
          Terimedi. Vous recevrez une notification dès qu’elle sera approuvée.
        </p>

        {/* Illustration de progression */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          <CheckCircle2 className="text-green-500 w-6 h-6 opacity-70" />
          <div className="h-1 bg-green-200 w-12 rounded"></div>
          <Clock className="text-green-600 w-6 h-6 animate-pulse" />
        </div>

        {/* Boutons d’action */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6"
            onClick={() => router.push("/dashboard/pharmacy/pending")}
          >
            Actualiser le statut
          </button>
          <button
            
            className="border-green-600 text-green-600 hover:bg-green-50 rounded-2xl px-6 flex items-center gap-2"
            onClick={() => router.push("/auth/login")}
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <p className="text-gray-400 text-sm mt-10">
        © {new Date().getFullYear()} Terimedi. Tous droits réservés.
      </p>
    </div>
  );
}
