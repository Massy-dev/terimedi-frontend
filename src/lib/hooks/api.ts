"use client";
import axios, { AxiosError, AxiosInstance } from 'axios';

export type NotificationType =
  | "order_created"
  | "order_updated"
  | "order_accepted"
  | "order_rejected"
  | "order_delivered";

export interface BaseNotificationPayload{
  notificationType: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;

}

export interface SendNotificationParams extends BaseNotificationPayload {
  userId: string;
  forceFcm?: boolean;
}

export interface SendBulkNotificationParams extends BaseNotificationPayload {
  userIds: string[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  notification_type: NotificationType;
  created_at: string;
  data?: Record<string, unknown> | null;
}

export interface PaginatedResponse<T> {
  results: T[];
  count?: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export type ApiSuccessResponse = Record<string, unknown>;

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const NOTIFICATIONS_ENDPOINT = '/api/notifications';

// Instance Axios avec configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};
console.log("token dans api.ts : "+getAuthToken()+" et token dans localStorage : "+localStorage.getItem("auth_token"));
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Rediriger vers login si non authentifié
   
        localStorage.removeItem('auth_token');
        
        window.location.href = '/auth/login';
      
    }
    return Promise.reject(error);
  }
);

// =======================
// DEVICE TOKENS
// =======================

/**
 * Enregistrer un token FCM
 */
export const registerDeviceToken = async (
  token: string,
  platform: "web" | "android" | "ios" = "web"
): Promise<ApiSuccessResponse>  => {
  try {
    const response = await api.post<ApiSuccessResponse>(`${NOTIFICATIONS_ENDPOINT}/devices/`, {
      token,
      platform,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur registerDeviceToken:', error);
    throw error;
  }
};

/**
/**
 * Désenregistrer un token FCM
 */
export const unregisterDeviceToken = async (
  token: string
): Promise<ApiSuccessResponse> => {
  try {
    const response = await api.post<ApiSuccessResponse>(
      `${NOTIFICATIONS_ENDPOINT}/devices/unregister/`, {
      token,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur unregisterDeviceToken:', error);
    throw error;
  }
};

// =======================
// NOTIFICATIONS
// =======================

/**
 * Récupérer les notifications
 */
export const getNotifications = async (
  isRead: boolean | null = null): Promise<Notification[]> => {
  try {
    let url = `${NOTIFICATIONS_ENDPOINT}/list/`;
    if (isRead !== null) {
      url += `?is_read=${isRead}`;
    }
    const response = await api.get<PaginatedResponse<Notification> | Notification[]>(url);
    return Array.isArray(response.data) 
    ? response.data 
    :response.data.results ;

  } catch (error) {
    console.error('Erreur getNotifications:', error);
    throw error;
  }
};

/**
 * Récupérer le nombre de notifications non lues
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await api.get<UnreadCountResponse>(
      `${NOTIFICATIONS_ENDPOINT}/list/unread_count/`);
    return response.data.unread_count || 0;
  } catch (error) {
    console.error('Erreur getUnreadCount:', error);
    return 0;
  }
};

/**
/**
 * Marquer une notification comme lue
 */
export const markAsRead = async (
  notificationId: string | number): Promise<ApiSuccessResponse> => {
  try {
    const response = await api.post<ApiSuccessResponse>(
      `${NOTIFICATIONS_ENDPOINT}/list/${notificationId}/mark_as_read/`
    );
    return response.data;
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    throw error;
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllAsRead = async (): Promise<number> => {
  try {
    const response = await api.post<{ count: number }>(
      `${NOTIFICATIONS_ENDPOINT}/list/mark_all_as_read/`);
    return response.data.count || 0;
  } catch (error) {
    console.error('Erreur markAllAsRead:', error);
    throw error;
  }
};

// =======================
// PRÉFÉRENCES
// =======================

/**
 * Récupérer les préférences de notifications
 */
export interface NotificationPreferences {
  [key: string]: boolean;
}

export const getNotificationPreferences = async ():Promise<NotificationPreferences> => {
  try {
    const response = await api.get<NotificationPreferences>(`${NOTIFICATIONS_ENDPOINT}/preferences/my_preferences/`);
    return response.data;
  } catch (error) {
    console.error('Erreur getNotificationPreferences:', error);
    throw error;
  }
};

/**
/**
 * Mettre à jour les préférences
 */
export const updateNotificationPreferences = async (
  preferences: NotificationPreferences
): Promise<NotificationPreferences> => {
  try {
    const response = await api.patch<NotificationPreferences>(
      `${NOTIFICATIONS_ENDPOINT}/preferences/update_preferences/`,
      preferences
    );
    return response.data;
  } catch (error) {
    console.error('Erreur updateNotificationPreferences:', error);
    throw error;
  }
};

// =======================
// ENVOI DE NOTIFICATIONS (ADMIN)
// =======================

/**
 * Envoyer une notification à un utilisateur
 */
export const sendNotification = async ({
  userId,
  notificationType,
  title,
  body,
  data = null,
  forceFcm = false,
}: SendNotificationParams): Promise<ApiSuccessResponse> => {
  try {
    const response = await api.post<ApiSuccessResponse>(
      `${NOTIFICATIONS_ENDPOINT}/manage/send_notification/`, 
      {
      user_id: userId,
      notification_type: notificationType,
      title,
      body,
      data,
      force_fcm: forceFcm,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur sendNotification:', error);
    throw error;
  }
};

/**
 * Envoyer une notification à plusieurs utilisateurs
 */
export const sendBulkNotification = async ({
  userIds,
  notificationType,
  title,
  body,
  data = null,
}: SendBulkNotificationParams): Promise<ApiSuccessResponse> => {
  try {
    const response = await api.post<ApiSuccessResponse>(
      `${NOTIFICATIONS_ENDPOINT}/manage/send_bulk_notification/`, 
      {
      user_ids: userIds,
      notification_type: notificationType,
      title,
      body,
      data,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur sendBulkNotification:', error);
    throw error;
  }
};

export default api;