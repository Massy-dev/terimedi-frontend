import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ShoppingCartIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  CheckBadgeIcon,
  TruckIcon,
  HomeIcon,
  XCircleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const notificationIcons = {
  order_created: ShoppingCartIcon,
  order_confirmed: CheckCircleIcon,
  order_preparing: ArchiveBoxIcon,
  order_ready: CheckBadgeIcon,
  order_delivering: TruckIcon,
  order_delivered: HomeIcon,
  order_cancelled: XCircleIcon,
  general: BellIcon,
};

const notificationColors = {
  order_created: 'bg-blue-100 text-blue-600',
  order_confirmed: 'bg-green-100 text-green-600',
  order_preparing: 'bg-orange-100 text-orange-600',
  order_ready: 'bg-purple-100 text-purple-600',
  order_delivering: 'bg-indigo-100 text-indigo-600',
  order_delivered: 'bg-teal-100 text-teal-600',
  order_cancelled: 'bg-red-100 text-red-600',
  general: 'bg-gray-100 text-gray-600',
};

export default function NotificationItem({ notification, onRead, onClick }) {
  const {
    id,
    notification_type,
    title,
    body,
    is_read,
    created_at,
  } = notification;

  const Icon = notificationIcons[notification_type] || BellIcon;
  const colorClass = notificationColors[notification_type] || notificationColors.general;

  // Formater le temps
  let timeAgo = 'Il y a un instant';
  try {
    const date = new Date(created_at);
    timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: fr });
  } catch (error) {
    console.error('Erreur format date:', error);
  }

  const handleClick = () => {
    if (!is_read) {
      onRead(id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-start p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors
        ${!is_read ? 'bg-blue-50' : 'bg-white'}
      `}
    >
      {/* Icône */}
      <div className={`flex-shrink-0 rounded-full p-2 ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Contenu */}
      <div className="ml-4 flex-1">
        <div className="flex items-start justify-between">
          <h3 className={`text-sm font-medium text-gray-900 ${!is_read ? 'font-bold' : ''}`}>
            {title}
          </h3>
          {!is_read && (
            <span className="ml-2 flex-shrink-0 inline-block h-2 w-2 rounded-full bg-blue-600"></span>
          )}
        </div>
        
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {body}
        </p>
        
        <p className="mt-1 text-xs text-gray-400">
          {timeAgo}
        </p>
      </div>
    </div>
  );
}