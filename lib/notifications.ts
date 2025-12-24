/**
 * Browser Notification Service
 * Handles browser push notifications for chat messages
 */

export class NotificationService {
  private static permission: NotificationPermission = 'default';
  private static isSupported = typeof window !== 'undefined' && 'Notification' in window;

  /**
   * Request notification permission from user
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Check if notifications are supported and enabled
   */
  static isEnabled(): boolean {
    if (!this.isSupported) return false;
    return this.permission === 'granted';
  }

  /**
   * Get current permission status
   */
  static getPermission(): NotificationPermission {
    if (!this.isSupported) return 'denied';
    return Notification.permission;
  }

  /**
   * Show a notification
   */
  static showNotification(
    title: string,
    options?: NotificationOptions
  ): Notification | null {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options?.tag || 'chat-message',
        requireInteraction: false,
        silent: false,
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click - focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options?.data?.url) {
          window.location.href = options.data.url;
        }
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show chat message notification
   */
  static showChatNotification(
    senderName: string,
    message: string,
    conversationId?: string
  ): Notification | null {
    if (!this.isEnabled()) {
      return null;
    }

    // Don't show notification if window is focused
    if (document.hasFocus()) {
      return null;
    }

    const truncatedMessage =
      message.length > 100 ? message.substring(0, 100) + '...' : message;

    return this.showNotification(`${senderName} sent a message`, {
      body: truncatedMessage,
      tag: `chat-${conversationId}`,
      data: {
        url: conversationId ? `/chat?conversationId=${conversationId}` : '/chat',
      },
    });
  }

  /**
   * Close all notifications with a specific tag
   */
  static closeNotifications(tag: string): void {
    // Notifications API doesn't provide a way to close by tag
    // This is handled by the browser automatically when new notifications with same tag arrive
  }
}

