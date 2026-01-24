
import { useState, useEffect, useCallback } from 'react';
import { getWebSocketService } from '../websocket';
import  { Notification } from "@/types/commande";
import type { WebSocketStatus } from "@/types/commande";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from './api';






/**
 * Hook personnalisé pour gérer les notifications
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('disconnected');

  // Charger les notifications
  const loadNotifications = useCallback(
    async (isRead: boolean | null = null): Promise<void> => {
    setLoading(true);
    try {
      const data = await getNotifications(isRead);
      setNotifications(data);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  }, 
  []
);

  // Charger le compteur non lues
  const loadUnreadCount = useCallback(async (): Promise<void> => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement compteur:', error);
    }
  }, []);

  // Marquer comme lue
  const markNotificationAsRead = useCallback(
    async (notificationId: string): Promise<void> => {
    try {
      await markAsRead(notificationId);
      
      // Marquer aussi via WebSocket
      const ws = getWebSocketService();
      if (ws?.isConnected()) {
        ws.markAsRead(notificationId);
      }
      
      // Mettre à jour localement
      setNotifications((prev: Notification[]) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage comme lu:', error);
      throw error;
    }
  }, []);

  // Tout marquer comme lu
  const markAllNotificationsAsRead = useCallback(async (): Promise<number> => {
    try {
      const count = await markAllAsRead();
      
      // Mettre à jour localement
      setNotifications(prev =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      
      return count;
    } catch (error) {
      console.error('Erreur marquage tout comme lu:', error);
      throw error;
    }
  }, []);

  // Rafraîchir tout
  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([
      loadNotifications(),
      loadUnreadCount(),
    ]);
  }, [loadNotifications, loadUnreadCount]);

  // Initialiser et écouter les WebSocket
  useEffect(() => {
    // Charger les données initiales
    loadNotifications();
    loadUnreadCount();

    // Configurer WebSocket
    const ws = getWebSocketService();
    if (!ws) return;

    // Écouter les messages WebSocket
    const unsubscribeMessages = ws.onMessage((message) => {
      if (message.type === 'notification') {
        // Nouvelle notification reçue
        console.log('Nouvelle notification via WebSocket');
        
        // Ajouter la notification à la liste
        setNotifications((prev) => [message.notification as Notification, ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
      }
      
      if (message.type === 'notification_read') {
        // Notification marquée comme lue
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === message.notification_id 
              ? { ...n, is_read: true } 
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    });

    // Écouter le statut WebSocket
    const unsubscribeStatus = ws.onStatusChange((status: WebSocketStatus) => {
      console.log('Statut WebSocket:', status);
      setWsStatus(status);
    });

    // Cleanup
    return () => {
      unsubscribeMessages();
      unsubscribeStatus();
    };
  }, [loadNotifications, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    wsStatus,
    loadNotifications,
    loadUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refresh,
  };
};

/**
 * Hook pour gérer le WebSocket
 */
export const useWebSocket = (userId?: string) => {
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");

  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;

    const ws = getWebSocketService();
    if (!ws) return;

    // Se connecter
    ws.connect(userId);

    // Écouter le statut
    const unsubscribe = ws.onStatusChange(
      (newStatus: WebSocketStatus) => {
      setStatus(newStatus);
    });

    // Cleanup
    return () => {
      unsubscribe();
      // Ne pas déconnecter ici car d'autres composants peuvent l'utiliser
    };
  }, [userId]);

  return {
    status,
    isConnected: status === 'connected',
  };
};