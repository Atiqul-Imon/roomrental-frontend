'use client';

import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { ChatWindow } from './ChatWindow';
import { X, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/chat-api';

export function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const { isChatOpen, closeChat, conversationId } = useChat();

  // Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: () => chatApi.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!isAuthenticated || !isChatOpen) {
    return null;
  }

  return (
    <>
      {/* Desktop: Right Sidebar (Facebook-style) */}
      <div className="hidden md:block fixed top-0 right-0 h-screen w-[450px] z-[100] bg-white shadow-2xl border-l border-grey-200 flex flex-col transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="bg-gradient-primary text-white px-4 py-4 flex items-center justify-between border-b border-white/20 shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Messages</h2>
            {unreadCount > 0 && (
              <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={closeChat}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow initialConversationId={conversationId} />
        </div>
      </div>

      {/* Mobile: Bottom Full Width */}
      <div className="md:hidden fixed bottom-0 right-0 z-[100] flex flex-col items-end w-full">
        <div className="w-full h-[calc(100vh-4rem)] bg-white flex flex-col overflow-hidden border-t border-grey-200">
          {/* Header */}
          <div className="bg-gradient-primary text-white px-4 py-3 flex items-center justify-between border-b border-white/20 shadow-md flex-shrink-0">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <h2 className="font-semibold text-lg">Messages</h2>
              {unreadCount > 0 && (
                <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={closeChat}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow initialConversationId={conversationId} />
          </div>
        </div>
      </div>
    </>
  );
}

