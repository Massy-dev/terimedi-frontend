// lib/api.ts

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/", 
  headers: { 
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
   },
// ou ton backend
});

export default axiosInstance;


export async function getUserId() {
  const token = localStorage.getItem("token");
  const profile = await axios.get("http://localhost:8000/api/pharmacies/me/", {
                    headers: { Authorization: `Bearer ${token}` },
                  });
      

  console.log("profil------------",profile)
  if (!profile) {
    throw new Error('Utilisateur introuvable');
  }

  return profile; // { token: "xxx", role: "admin" | "pharmacy" }
}

/*export async function loginUser(username: string, password: string) {
  //const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
  const res = await fetch("http://localhost:8000/api/users/login/", {  
  method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error('Numéro ou mot de passe incorrect');
  }

  return res.json(); // { token: "xxx", role: "admin" | "pharmacy" }
}*/
