
/**
 * Service WebSocket pour NextJS
 * Gère la connexion temps réel pour les notifications
 */

type WebSocketStatus = "disconnected" | "connecting" | "connected" | "error";

export type WebSocketMessage =
  | { type: "notification"; notification: unknown }
  | { type: "notification_read"; notification_id: string }
  | { type: "mark_as_read"; notification_id: string }
  | { type: "ping" };

type MessageHandler = (message: WebSocketMessage) => void;
type StatusHandler = (status: WebSocketStatus) => void;

class WebSocketService {

  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;
  private readonly pingInterval = 30000;

  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private messageHandlers: MessageHandler[] = [];
  private statusHandlers: StatusHandler[] = [];

  private status: WebSocketStatus = "disconnected";

  /**
   * Se connecter au WebSocket
   */
  connect(userId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN || 
        this.ws?.readyState === WebSocket.CONNECTING
      ) {
      console.log('WebSocket déjà connecté ou en cours de connexion');
      return;
    }

    try {
      this.updateStatus('connecting');
      const wsBase = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
      const url = `${wsBase}/ws/notifications/${userId}/`;
      
      console.log('Connexion WebSocket:', url);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connecté');
        this.updateStatus('connected');
        this.reconnectAttempts = 0;
        this.startPing();
      };

      this.ws.onmessage = (event: MessageEvent<string>) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
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
  private handleMessage(data: WebSocketMessage): void {
    // Notifier tous les handlers enregistrés
    this.messageHandlers.forEach((handler) => {
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
  private send(message: WebSocketMessage): void{
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
  markAsRead(notificationId: string): void {
    this.send({
      type: 'mark_as_read',
      notification_id: notificationId,
    });
  }

  /**
   * Envoyer un ping pour maintenir la connexion
   */
  private sendPing(): void {
    this.send({ type: 'ping' });
  }

  /**
   * Démarrer le timer de ping
   */
  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      this.send({ type: "ping" });
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
  scheduleReconnect(userId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Nombre maximum de tentatives de reconnexion atteint');
      this.updateStatus('error');
      return;
    }

    this.reconnectAttempts+= 1;
    console.log(
      `Reconnexion WebSocket dans ${this.reconnectDelay / 1000}s (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
     this.connect(userId);
      
    }, this.reconnectDelay);
  }

  /**
   * Mettre à jour le statut
   */
  private updateStatus(newStatus: WebSocketStatus): void {
    this.status = newStatus;
    this.statusHandlers.forEach((handler) => handler(newStatus));
     
  }

  /**
   * S'abonner aux messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.messageHandlers = this.messageHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  /**
   * S'abonner aux changements de statut
   */
  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.push(handler);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.statusHandlers = this.statusHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  /**
   * Se déconnecter
   */
  disconnect(): void {
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
  reconnect(userId: string): void {
    this.disconnect();
    this.connect(userId);
  }

  /**
   * Vérifier si connecté
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Obtenir le statut actuel
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }
}

// Instance singleton
let websocketService: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService | null => {
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