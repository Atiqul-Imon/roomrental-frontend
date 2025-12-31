'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Bell } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { useRouter } from 'next/navigation';

export function NotificationList() {
  const router = useRouter();
  
  // TODO: Replace with actual notifications API endpoint when available
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // Placeholder - replace with actual API call
      // const response = await api.get('/notifications');
      // return response.data.data;
      return [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Bell className="w-16 h-16 text-grey-400 mx-auto mb-4" />
          <p className="text-grey-700 text-lg font-medium mb-2">No notifications</p>
          <p className="text-grey-500 text-sm">You're all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-grey-50">
      <div className="max-w-4xl mx-auto">
        {notifications.map((notification: any) => (
          <NotificationItem
            key={notification.id}
            id={notification.id}
            type={notification.type || 'system'}
            title={notification.title || 'Notification'}
            message={notification.message || ''}
            read={notification.read || false}
            createdAt={notification.createdAt || new Date().toISOString()}
            onClick={() => {
              if (notification.type === 'message' && notification.conversationId) {
                // Mobile: Navigate to conversation page
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  router.push(`/messages/${notification.conversationId}`);
                } else {
                  // Desktop: Navigate to messages page and select conversation
                  router.push(`/messages?conversationId=${notification.conversationId}&tab=chat`);
                }
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

