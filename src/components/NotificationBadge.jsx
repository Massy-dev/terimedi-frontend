import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { getUnreadCount } from '../lib/hooks/api';
import { getWebSocketService } from '../lib/websocket';
import React from 'react';

export default function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Charger le compteur initial
    loadUnreadCount();

    // Écouter les WebSocket
    const ws = getWebSocketService();
    if (!ws) return;

    const unsubscribe = ws.onMessage((message) => {
      if (message.type === 'notification') {
        // Nouvelle notification
        setUnreadCount(prev => prev + 1);
      } else if (message.type === 'notification_read') {
        // Notification lue
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });

    // Rafraîchir périodiquement
    const interval = setInterval(loadUnreadCount, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement compteur badge:', error);
    }
  };

  return (
    <Link href="/notifications">
      <div
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Icône de cloche */}
        {isHovered || unreadCount > 0 ? (
          <BellIconSolid className="h-6 w-6 text-gray-700" />
        ) : (
          <BellIcon className="h-6 w-6 text-gray-700" />
        )}

        {/* Badge avec le nombre */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Animation pulse si nouvelles notifications */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex h-3 w-3 transform translate-x-1/2 -translate-y-1/2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          </span>
        )}
      </div>
    </Link>
  );
}