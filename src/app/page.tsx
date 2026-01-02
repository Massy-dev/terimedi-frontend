import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-primary mb-4">
        Bienvenue sur Terimedi
      </h1>
      <p className="mb-6 text-gray-600">Choisissez une action :</p>
      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Se connecter
        </Link>
        <Link
          href="/auth/register"
          className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white"
        >
          S’inscrire
        </Link>
      </div>
    </main>
  );
}
