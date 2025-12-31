'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { NotificationItem } from './NotificationItem';

export function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // TODO: Replace with actual notifications API endpoint when available
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-dropdown'],
    queryFn: async () => {
      // Placeholder - replace with actual API call
      // const response = await api.get('/notifications', { params: { limit: 10, unread: true } });
      // return response.data.data;
      return [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/messages?tab=notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-3 py-2 rounded-lg text-sm font-medium text-grey-700 hover:text-accent-600 hover:bg-accent-50/50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-grey-200 z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-grey-200 flex items-center justify-between">
            <h3 className="font-semibold text-grey-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-grey-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-grey-600" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-grey-400 mx-auto mb-3" />
                <p className="text-grey-600 text-sm">No notifications</p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 5).map((notification: any) => (
                  <NotificationItem
                    key={notification.id}
                    {...notification}
                    onClick={() => {
                      setIsOpen(false);
                      // Handle notification click
                      if (notification.type === 'message' && notification.conversationId) {
                        // Mobile: Navigate to conversation page, Desktop: open sidebar
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          router.push(`/messages/${notification.conversationId}`);
                        } else {
                          router.push(`/messages?conversationId=${notification.conversationId}&tab=chat`);
                        }
                      } else {
                        router.push('/messages?tab=notifications');
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-grey-200">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-sm font-medium text-accent-600 hover:text-accent-700 py-2"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

