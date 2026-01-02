export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600">Accès refusé 🚫</h1>
      <p className="mt-2 text-gray-600">Vous n avez pas les droits nécessaires pour accéder à cette page.</p>
    </div>
  );
}