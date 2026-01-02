// @ts-nocheck
import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const NOTIFICATIONS_ENDPOINT = '/api/notifications';

// Instance Axios avec configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers login si non authentifié
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
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
export const registerDeviceToken = async (token, platform = 'web') => {
  try {
    const response = await api.post(`${NOTIFICATIONS_ENDPOINT}/devices/`, {
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
 * Désenregistrer un token FCM
 */
export const unregisterDeviceToken = async (token) => {
  try {
    const response = await api.post(`${NOTIFICATIONS_ENDPOINT}/devices/unregister/`, {
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
export const getNotifications = async (isRead = null) => {
  try {
    let url = `${NOTIFICATIONS_ENDPOINT}/list/`;
    if (isRead !== null) {
      url += `?is_read=${isRead}`;
    }
    const response = await api.get(url);
    return response.data.results || response.data;
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    throw error;
  }
};

/**
 * Récupérer le nombre de notifications non lues
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get(`${NOTIFICATIONS_ENDPOINT}/list/unread_count/`);
    return response.data.unread_count || 0;
  } catch (error) {
    console.error('Erreur getUnreadCount:', error);
    return 0;
  }
};

/**
 * Marquer une notification comme lue
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.post(
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
export const markAllAsRead = async () => {
  try {
    const response = await api.post(`${NOTIFICATIONS_ENDPOINT}/list/mark_all_as_read/`);
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
export const getNotificationPreferences = async () => {
  try {
    const response = await api.get(`${NOTIFICATIONS_ENDPOINT}/preferences/my_preferences/`);
    return response.data;
  } catch (error) {
    console.error('Erreur getNotificationPreferences:', error);
    throw error;
  }
};

/**
 * Mettre à jour les préférences
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await api.patch(
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
}) => {
  try {
    const response = await api.post(`${NOTIFICATIONS_ENDPOINT}/manage/send_notification/`, {
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
}) => {
  try {
    const response = await api.post(`${NOTIFICATIONS_ENDPOINT}/manage/send_bulk_notification/`, {
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