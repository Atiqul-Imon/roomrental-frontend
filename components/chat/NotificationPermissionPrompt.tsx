'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotificationPermissionPrompt() {
  const { permission, isEnabled, requestPermission } = useNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (isEnabled || isDismissed || permission === 'denied') {
    return null;
  }

  const handleRequest = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slide-in-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Bell className="w-5 h-5 text-primary-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Enable Notifications</h3>
          <p className="text-sm text-gray-600 mb-3">
            Get notified when you receive new messages, even when you're not on the chat page.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleRequest}
              className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Enable
            </Button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

