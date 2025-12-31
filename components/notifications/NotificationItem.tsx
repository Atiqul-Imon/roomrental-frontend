'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bell, MessageCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface NotificationItemProps {
  id: string;
  type: 'message' | 'listing' | 'review' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  onClick?: () => void;
}

const typeIcons = {
  message: MessageCircle,
  listing: CheckCircle,
  review: XCircle,
  system: AlertCircle,
};

const typeColors = {
  message: 'text-accent-600 bg-accent-50',
  listing: 'text-blue-600 bg-blue-50',
  review: 'text-amber-600 bg-amber-50',
  system: 'text-grey-600 bg-grey-50',
};

export function NotificationItem({
  id,
  type,
  title,
  message,
  read,
  createdAt,
  onClick,
}: NotificationItemProps) {
  const Icon = typeIcons[type] || Bell;
  const colorClass = typeColors[type] || typeColors.system;

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-grey-100 hover:bg-grey-50 transition-colors cursor-pointer ${
        !read ? 'bg-accent-50/30' : 'bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${read ? 'text-grey-700' : 'text-grey-900'}`}>
                {title}
              </p>
              <p className={`text-sm mt-1 ${read ? 'text-grey-600' : 'text-grey-800'}`}>
                {message}
              </p>
            </div>
            {!read && (
              <div className="flex-shrink-0 w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
            )}
          </div>
          <p className="text-xs text-grey-500 mt-2">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

