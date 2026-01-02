import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import React from 'react';

import {
  FunnelIcon,
  CheckIcon,
  ArrowPathIcon,
  BellSlashIcon,
} from '@heroicons/react/24/outline';
import NotificationItem from '../components/NotificationItem';
import { useNotifications, useWebSocket } from '../lib/hooks/useNotifications';

export default function NotificationsPage() {
  const router = useRouter();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  const {
    notifications,
    unreadCount,
    loading,
    wsStatus,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refresh,
  } = useNotifications();

  // Connecter le WebSocket
  const userId = getUserId(); // À adapter selon votre auth
  const { isConnected } = useWebSocket(userId);

  // Filtrer les notifications
  const displayedNotifications = showUnreadOnly
    ? notifications.filter(n => !n.is_read)
    : notifications;

  // Gérer le clic sur une notification
  const handleNotificationClick = (notification) => {
    const orderId = notification.data?.order_id;
    
    if (orderId) {
      // Naviguer vers les détails de la commande
      router.push(`/orders/${orderId}`);
    }
  };

  // Tout marquer comme lu
  const handleMarkAllAsRead = async () => {
    try {
      const count = await markAllNotificationsAsRead();
      toast.success(`${count} notification(s) marquée(s) comme lue(s)`);
    } catch (error) {
      toast.error('Erreur lors du marquage des notifications');
    }
  };

  // Rafraîchir
  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Notifications rafraîchies');
    } catch (error) {
      toast.error('Erreur lors du rafraîchissement');
    }
  };

  return (
    <>
      <Head>
        <title>Notifications - TeriMedi Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {unreadCount > 0
                    ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                    : 'Toutes les notifications sont lues'}
                </p>
              </div>

              {/* Indicateur WebSocket */}
              <div className="flex items-center space-x-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  title={isConnected ? 'Connecté en temps réel' : 'Déconnecté'}
                />
                <span className="text-xs text-gray-500">
                  {isConnected ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              {/* Filtre non lues */}
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${showUnreadOnly
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                {showUnreadOnly ? 'Toutes' : 'Non lues'}
              </button>

              {/* Rafraîchir */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Rafraîchir
              </button>
            </div>

            {/* Tout marquer comme lu */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              // État de chargement
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : displayedNotifications.length === 0 ? (
              // État vide
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <BellSlashIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {showUnreadOnly
                    ? 'Aucune notification non lue'
                    : 'Aucune notification'}
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  {showUnreadOnly
                    ? 'Toutes vos notifications ont été lues'
                    : 'Vous n\'avez pas encore de notifications'}
                </p>
                {showUnreadOnly && (
                  <button
                    onClick={() => setShowUnreadOnly(false)}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Voir toutes les notifications
                  </button>
                )}
              </div>
            ) : (
              // Liste des notifications
              <div className="divide-y divide-gray-200">
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markNotificationAsRead}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Fonction à adapter selon votre système d'authentification
function getUserId() {
  if (typeof window === 'undefined') return null;
  
  const userId = localStorage.getItem('user_id');
  return userId ? parseInt(userId) : null;
}