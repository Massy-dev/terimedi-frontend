import Link from 'next/link';
import { useRouter } from 'next/router';
import NotificationBadge from './NotificationBadge';
import React from 'react';

import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../global';
import { requestNotificationPermission } from '../../firebase.config';
import { registerDeviceToken } from '../lib/hooks/api';
//import { getUserId } from '../lib/api';
import { getWebSocketService } from '../lib/websocket';
import NotificationToast from '../components/NotificationToast';


import {
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function Layout({ children }) {
  const router = useRouter();
  
  /** Configuration de notification */
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    // Initialiser les notifications au chargement de l'app
    initializeNotifications();
  }, []);

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
          ws.connect(userId);
          console.log('WebSocket initialisé');
        }
      }

      setInitialized(true);
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
      setInitialized(true);
    }
  };

  const getUserId = () => {
    if (typeof window === 'undefined') return null;
    
    // Exemple: récupérer depuis localStorage
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId) : null;
    
    // Ou depuis un cookie, JWT, context, etc.
  };
  

  const navigation = [
    { name: 'Accueil', href: '/', icon: HomeIcon },
    { name: 'Commandes', href: '/orders', icon: ShoppingBagIcon },
    { name: 'Clients', href: '/customers', icon: UserGroupIcon },
    { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => router.pathname === path;

  return (
    
    <div className="min-h-screen bg-gray-50">
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
          theme="dark"
        />

        {/* Listener global pour les notifications */}
        {initialized && <NotificationToast />}
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo et Navigation */}
            <div className="flex">
              {/* Logo */}
              <Link href="/">
                <div className="flex-shrink-0 flex items-center cursor-pointer">
                  <span className="text-2xl font-bold text-blue-600">
                    TeriMedi
                  </span>
                  <span className="ml-2 text-sm text-gray-500">Admin</span>
                </div>
              </Link>

              {/* Navigation principale */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={`
                          inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                          ${isActive(item.href)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Actions à droite */}
            <div className="flex items-center space-x-4">
              {/* Badge de notifications */}
              <NotificationBadge />

              {/* Profil utilisateur */}
              <div className="relative">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        <div className="sm:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`
                      flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors
                      ${isActive(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main>{children}</main>
    </div>
  );
}