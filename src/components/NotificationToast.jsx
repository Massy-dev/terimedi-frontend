'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { getWebSocketService } from '../lib/websocket';
import { onMessageListener } from '../../firebase.config';
import React from 'react';

export default function NotificationToast() {
  const router = useRouter();

  useEffect(() => {
    // Écouter les notifications FCM (premier plan)
    onMessageListener()
      .then((payload) => {
        console.log('Notification FCM reçue:', payload);
        showNotification(payload.notification, payload.data);
      })
      .catch((err) => console.error('Erreur FCM listener:', err));

    // Écouter les notifications WebSocket
    const ws = getWebSocketService();
    if (!ws) return;

    const unsubscribe = ws.onMessage((message) => {
      if (message.type === 'notification') {
        console.log('Notification WebSocket reçue');
        showNotification(message.notification, null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showNotification = (notification, data) => {
    if (!notification) return;

    const orderId = data?.order_id || notification?.data?.order_id;

    toast.info(
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{notification.title}</span>
        <span className="text-xs text-gray-600 mt-1">{notification.body}</span>
      </div>,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClick: () => {
          if (orderId) {
            // Naviguer vers les détails de la commande
            router.push(`/orders/${orderId}`);
          } else {
            // Naviguer vers la page notifications
            router.push('/notifications');
          }
        },
      }
    );

    // Jouer un son (optionnel)
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(e => console.log('Impossible de jouer le son:', e));
    } catch (e) {
      console.log('Son non disponible');
    }
  };

  return null; // Ce composant ne rend rien
}