import api from './api';

const ORDERS_ENDPOINT = '/api/orders';

/**
 * Récupérer toutes les commandes
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await api.get(`${ORDERS_ENDPOINT}/`, { params });
    return response.data.results || response.data;
  } catch (error) {
    console.error('Erreur getOrders:', error);
    throw error;
  }
};

/**
 * Récupérer une commande par ID
 */
export const getOrder = async (orderId) => {
  try {
    const response = await api.get(`${ORDERS_ENDPOINT}/${orderId}/`);
    return response.data;
  } catch (error) {
    console.error('Erreur getOrder:', error);
    throw error;
  }
};

/**
 * Confirmer une commande (pharmacien)
 * Déclenche une notification au client
 */
export const sendQuote = async (orderId) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderId}/soumettre-devis/`);
    return response.data;
  } catch (error) {
    console.error("Erreur d'envoie de devis:", error);
    throw error;
  }
};

/**
 * Confirmer une commande (pharmacien)
 * Déclenche une notification au client
 */
export const confirmOrder = async (orderId) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderId}/confirm/`);
    return response.data;
  } catch (error) {
    console.error('Erreur confirmOrder:', error);
    throw error;
  }
};

/**
 * Démarrer la préparation (pharmacien)
 * Déclenche une notification au client
 */
export const startPreparing = async (orderId) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderId}/start_preparing/`);
    return response.data;
  } catch (error) {
    console.error('Erreur startPreparing:', error);
    throw error;
  }
};

/**
 * Marquer comme prête (pharmacien)
 * Déclenche une notification au client
 */
export const markReady = async (orderId) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderId}/mark_ready/`);
    return response.data;
  } catch (error) {
    console.error('Erreur markReady:', error);
    throw error;
  }
};

/**
 * Démarrer la livraison
 * Déclenche une notification au client
 */
export const startDelivery = async (orderId, deliveryInfo = {}) => {
  try {
    const response = await api.post(
      `${ORDERS_ENDPOINT}/${orderId}/start_delivery/`,
      deliveryInfo
    );
    return response.data;
  } catch (error) {
    console.error('Erreur startDelivery:', error);
    throw error;
  }
};

/**
 * Marquer comme livrée
 * Déclenche une notification au client
 */
export const markDelivered = async (orderId) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderId}/mark_delivered/`);
    return response.data;
  } catch (error) {
    console.error('Erreur markDelivered:', error);
    throw error;
  }
};

/**
 * Annuler une commande
 * Déclenche une notification au client
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderId}/cancel/`, {
      reason,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur cancelOrder:', error);
    throw error;
  }
};