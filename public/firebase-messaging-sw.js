// @ts-nocheck
// Service Worker pour les notifications en arrière-plan
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuration Firebase - Doit être identique à firebase.config.js
firebase.initializeApp({
  apiKey: "AIzaSyA4PGj5w5J_voj7dedVBzYyrpkiooQ-vwc",
  authDomain: "terimedi.firebaseapp.com",
  projectId: "terimedi",
  storageBucket: "terimedi.appspot.com",
  messagingSenderId: "901456421234",
  appId: "1:901456421234:web:253a17a40db2f63865fdeb",
  measurementId: "G-PZ589RGE15"
});

const messaging = firebase.messaging();

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('Notification reçue en arrière-plan:', payload);
  
  const notificationTitle = payload.notification?.title || 'TeriMedi';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle notification',
    icon: '/icon.png',
    badge: '/badge.png',
    data: payload.data,
    tag: payload.data?.notification_id || 'default',
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer le clic sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification cliquée:', event);
  
  event.notification.close();
  
  // Ouvrir ou focus la fenêtre de l'app
  const urlToOpen = event.notification.data?.url || '/notifications';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Vérifier si une fenêtre est déjà ouverte
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});