'use client';

import { useEffect, useState, useCallback } from 'react';
import { NotificationService } from '@/lib/notifications';
import { useAuth } from '@/lib/auth-context';

export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermission(NotificationService.getPermission());
      setIsEnabled(NotificationService.isEnabled());
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const newPermission = await NotificationService.requestPermission();
    setPermission(newPermission);
    setIsEnabled(newPermission === 'granted');
    return newPermission;
  }, []);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      // Only show if user has push notifications enabled in preferences
      if (user?.preferences?.pushNotifications !== false) {
        return NotificationService.showNotification(title, options);
      }
      return null;
    },
    [user]
  );

  const showChatNotification = useCallback(
    (senderName: string, message: string, conversationId?: string) => {
      // Only show if user has push notifications enabled in preferences
      if (user?.preferences?.pushNotifications !== false) {
        return NotificationService.showChatNotification(
          senderName,
          message,
          conversationId
        );
      }
      return null;
    },
    [user]
  );

  return {
    permission,
    isEnabled,
    requestPermission,
    showNotification,
    showChatNotification,
  };
}

