"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { routeModule } from "next/dist/build/templates/app-page";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  
  const [role, setRole] = useState("");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [success, setSuccess] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    setRole("pharmacien")

     try {
      await axios.post('http://192.168.100.4:8000/api/users/register/', {
       
        phone,
        role,
        password,
        password2,
      });

      setSuccess('Registration successful! Please log in.');
      // Redirection ajout pharmacie
        router.push("/auth/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue.");
      }
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black">
      <form
        onSubmit={handleRegister}
        className="bg-gray-50 p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
          {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <h1 className="text-2xl font-bold mb-6 text-center">Inscription</h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}


        <div className="mb-4">
          <label className="block text-sm font-medium">Numéro de téléphone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg mt-1"
            placeholder="+2250701020304"
            required
          />
        </div>



        <div className="mb-6">
          <label className="block text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg mt-1"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium">Comfirmation mot de passe</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg mt-1"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>

        <a href="/auth/login" className="block text-center mt-4 text-sm text-gray-600 hover:underline">
          Se connecter
        </a>
      </form>
    </div>
  );
}
