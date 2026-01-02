import "./globals.css";
import type { ReactNode } from "react";



export const metadata = {
  title: "Terimedi Dashboard",
  description: "Tableau de bord administrateur et pharmacie Terimedi",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white text-black">{children}</body>
    </html>
  );
}
