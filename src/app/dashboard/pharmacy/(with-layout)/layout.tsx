// app/pharmacien/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//import '../../global';
import { requestNotificationPermission } from '../../../../../firebase.config';
import { registerDeviceToken } from '../../../../lib/hooks/api';
//import { getUserId } from '../lib/api';
import { getWebSocketService } from '../../../../lib/websocket';
import NotificationToast from '../../../../components/NotificationToast';

import {
  Home,
  Package,
  ShoppingCart,
  Store,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Accueil", href: "/dashboard/pharmacy/", icon: Home },
  { name: "Commandes", href: "/dashboard/pharmacy/orders/", icon: ShoppingCart },
  { name: "Stock", href: "/dashboard/pharmacy/products", icon: Package },
  { name: "Profil", href: "/dashboard/pharmacy/profile", icon: Store },
];

export default function PharmacienLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialiser les notifications au chargement de l'app
    const initializeNotifications = async () => {
      try {
        // 1. Demander la permission FCM et obtenir le token
        const fcmToken = await requestNotificationPermission();
        
        if (fcmToken) {
          console.log('Token FCM obtenu:', fcmToken.substring(0, 20) + '...');
          
          // 2. Enregistrer le token sur le serveur
          try {
            await registerDeviceToken(fcmToken, 'web');
            console.log('Token FCM enregistré sur le serveur');
          } catch (error) {
            console.error('Erreur enregistrement token:', error);
          }
        }
  
        // 3. Connecter le WebSocket si l'utilisateur est authentifié
        const userId = getUserId(); // Fonction à adapter selon votre auth
        if (userId) {
          const ws = getWebSocketService();
          if (ws) {
            ws.connect(String(userId));
            console.log('WebSocket initialisé');
          }
        }
  
        setInitialized(true);
      } catch (error) {
        console.error('Erreur initialisation notifications:', error);
        setInitialized(true);
      }
    };
    
    initializeNotifications();
  }, []);

  

  // Fonction à adapter selon votre système d'authentification
  const getUserId = () => {
    if (typeof window === 'undefined') return null;
    
    // Exemple: récupérer depuis localStorage
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId) : null;
    
    // Ou depuis un cookie, JWT, context, etc.
  };


  return (
    <div className="flex h-screen bg-gray-50">
       {/* Container pour les toasts */}
       <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Listener global pour les notifications */}
      {initialized && <NotificationToast />}
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TeriMedi</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-green-700" : "text-gray-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="/placeholder-pharmacy.png" />
              <AvatarFallback className="bg-green-100 text-green-700">PH</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Pharmacie Centrale
              </p>
              <p className="text-xs text-gray-500 truncate">Pharmacien</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
            {/* Mobile Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold">TeriMedi</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-green-700" : "text-gray-500"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="/placeholder-pharmacy.png" />
                    <AvatarFallback className="bg-green-100 text-green-700">PH</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/pharmacy/profile">Profil de la pharmacie</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Paramètres</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

