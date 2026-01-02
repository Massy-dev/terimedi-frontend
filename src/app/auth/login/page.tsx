"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://192.168.100.4:8000/api/users/login/", { phone, password });
      setToken(res.data.access);

      // récupération du profil pour décider de la redirection
      const profile = await axios.get("http://192.168.100.4:8000/api/pharmacies/me/", {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });
      console.log("test ",profile.data.pharmacy)
         
      if ((profile.data.user.role === "pharmacien") && (profile.data.pharmacy === null)) {
        router.push("/dashboard/pharmacy/add");
      } 
      
      else if ((profile.data.user.role === "pharmacien") && (profile.data.pharmacy.is_approved === false)) {
        router.push("/dashboard/pharmacy/pending");
      }
      
      else if ((profile.data.user.role === "pharmacien") && (profile.data.pharmacy.is_approved === true)) {
        router.push("/dashboard/pharmacy");
      } 
      
      else {
        router.push("/dashboard/admin");
      }
    } catch (err: unknown) {
      setError("Identifiants incorrects ou erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-white">
      <form
        onSubmit={handleLogin}
        className="p-6 shadow-lg rounded-lg w-full max-w-md border"
      >
        <h1 className="text-2xl font-bold text-primary text-center mb-4">
          Connexion Pharmacien
        </h1>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Téléphone (+2250707070707)"
          className="w-full border px-3 py-2 mb-3 rounded-md"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full border px-3 py-2 mb-4 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-green-700"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <p className="text-center text-sm mt-3">
          Pas encore de compte ?{" "}
          <a href="/auth/register/" className="text-primary font-semibold">
            Créer un compte
          </a>
        </p>
      </form>
    </main>
  );
}
