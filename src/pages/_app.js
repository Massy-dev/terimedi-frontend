//@ts-nocheck
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { requestNotificationPermission } from '../../firebase.config';
import { registerDeviceToken } from '../lib/hooks/api';
import { getWebSocketService } from '../lib/websocket';
import NotificationToast from '../components/NotificationToast';

function MyApp({ Component, pageProps }) {
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

  // Fonction à adapter selon votre système d'authentification
  const getUserId = () => {
    if (typeof window === 'undefined') return null;
    
    // Exemple: récupérer depuis localStorage
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId) : null;
    
    // Ou depuis un cookie, JWT, context, etc.
  };

  return (
    <>
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

      {/* Votre application */}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;