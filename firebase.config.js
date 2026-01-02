import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Configuration Firebase - Remplacez par vos valeurs
// Vous les trouveez dans Firebase Console > Paramètres du projet > Configuration SDK
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMEN_ID
};

// Initialiser Firebase (singleton)
const app = 
  !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Obtenir l'instance de messaging (seulement côté client)


/**
 * ✅ Récupérer Messaging en toute sécurité
 */
export const getFirebaseMessaging = async () => {
  console.log("le typeee",typeof window);
  if (typeof window === 'undefined') return null;

  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Messaging non supporté');
    return null;
  }

  return getMessaging(app);
};

/**
 * Demander la permission et obtenir le token FCM
 */
export const requestNotificationPermission = async () => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });

    console.log('Token FCM:', token);
    return token;
  } catch (err) {
    console.error('Erreur FCM:', err);
    return null;
  }
};

/**
 * Écouter les messages en premier plan
 */
export const onMessageListener = async() => {
  const messaging = await getFirebaseMessaging();
  
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Message reçu (foreground):', payload);
  });
};



/*
INSTRUCTIONS POUR OBTENIR LA VAPID KEY :

1. Allez sur Firebase Console
2. Paramètres du projet > Cloud Messaging
3. Onglet "Web configuration"
4. Section "Web Push certificates"
5. Cliquez sur "Generate key pair" si vous n'en avez pas
6. Copiez la clé et remplacez 'VOTRE_VAPID_KEY' ci-dessus
*/