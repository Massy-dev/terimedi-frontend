// @ts-nocheck
/**
 * Service WebSocket pour NextJS
 * Gère la connexion temps réel pour les notifications
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.pingInterval = 30000;
    this.pingTimer = null;
    this.reconnectTimer = null;
    this.messageHandlers = [];
    this.statusHandlers = [];
    this.status = 'disconnected'; // disconnected, connecting, connected, error
  }

  /**
   * Se connecter au WebSocket
   */
  connect(userId) {
    if (this.ws?.readyState === WebSocket.OPEN || 
        this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket déjà connecté ou en cours de connexion');
      return;
    }

    try {
      this.updateStatus('connecting');
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
      const url = `${wsUrl}/ws/notifications/${userId}/`;
      
      console.log('Connexion WebSocket:', url);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connecté');
        this.updateStatus('connected');
        this.reconnectAttempts = 0;
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message WebSocket reçu:', data.type);
          this.handleMessage(data);
        } catch (error) {
          console.error('Erreur parsing message WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        this.updateStatus('error');
      };

      this.ws.onclose = () => {
        console.log('WebSocket déconnecté');
        this.updateStatus('disconnected');
        this.stopPing();
        this.scheduleReconnect(userId);
      };

    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
      this.updateStatus('error');
      this.scheduleReconnect(userId);
    }
  }

  /**
   * Gérer les messages reçus
   */
  handleMessage(data) {
    // Notifier tous les handlers enregistrés
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Erreur dans message handler:', error);
      }
    });
  }

  /**
   * Envoyer un message
   */
  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        console.log('Message WebSocket envoyé:', message.type);
      } catch (error) {
        console.error('Erreur envoi message WebSocket:', error);
      }
    } else {
      console.warn('WebSocket non connecté, impossible d\'envoyer le message');
    }
  }

  /**
   * Marquer une notification comme lue
   */
  markAsRead(notificationId) {
    this.send({
      type: 'mark_as_read',
      notification_id: notificationId,
    });
  }

  /**
   * Envoyer un ping pour maintenir la connexion
   */
  sendPing() {
    this.send({ type: 'ping' });
  }

  /**
   * Démarrer le timer de ping
   */
  startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      this.sendPing();
    }, this.pingInterval);
  }

  /**
   * Arrêter le timer de ping
   */
  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * Planifier une reconnexion
   */
  scheduleReconnect(userId) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Nombre maximum de tentatives de reconnexion atteint');
      this.updateStatus('error');
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Reconnexion WebSocket dans ${this.reconnectDelay / 1000}s (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      if (userId) {
        this.connect(userId);
      }
    }, this.reconnectDelay);
  }

  /**
   * Mettre à jour le statut
   */
  updateStatus(newStatus) {
    this.status = newStatus;
    this.statusHandlers.forEach(handler => {
      try {
        handler(newStatus);
      } catch (error) {
        console.error('Erreur dans status handler:', error);
      }
    });
  }

  /**
   * S'abonner aux messages
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  /**
   * S'abonner aux changements de statut
   */
  onStatusChange(handler) {
    this.statusHandlers.push(handler);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Se déconnecter
   */
  disconnect() {
    console.log('Déconnexion WebSocket...');
    
    this.stopPing();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.updateStatus('disconnected');
  }

  /**
   * Reconnecter manuellement
   */
  reconnect(userId) {
    this.disconnect();
    this.connect(userId);
  }

  /**
   * Vérifier si connecté
   */
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Obtenir le statut actuel
   */
  getStatus() {
    return this.status;
  }
}

// Instance singleton
let websocketService = null;

export const getWebSocketService = () => {
  if (typeof window === 'undefined') {
    // Ne pas créer d'instance côté serveur
    return null;
  }
  
  if (!websocketService) {
    websocketService = new WebSocketService();
  }
  
  return websocketService;
};

export default WebSocketService;