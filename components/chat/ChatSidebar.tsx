'use client';

import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { ChatSidebarContent } from './ChatSidebarContent';
import { X, MessageCircle, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/chat-api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ChatSidebar() {
  const { isAuthenticated } = useAuth();
  const { isChatOpen, closeChat, conversationId } = useChat();
  const router = useRouter();
  
  // Prevent scroll events from propagating to body when scrolling inside sidebar
  useEffect(() => {
    if (!isChatOpen) return;
    
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const sidebar = target.closest('[data-chat-sidebar]');
      if (sidebar) {
        // Stop propagation to prevent body scroll when scrolling inside sidebar
        e.stopPropagation();
      }
    };
    
    // Use capture phase to catch events before they bubble
    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    
    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [isChatOpen]);

  // Fetch unread count - no caching for real-time updates
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: () => chatApi.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache unread count
    refetchInterval: 10000, // Refetch every 10 seconds for better real-time feel
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  if (!isAuthenticated || !isChatOpen) {
    return null;
  }

  return (
    <div 
      data-chat-sidebar
      className="fixed bottom-0 right-4 w-[380px] h-[600px] z-[100] bg-white shadow-2xl rounded-t-xl border border-grey-200 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-gradient-primary text-white px-4 py-3 flex items-center justify-between rounded-t-xl border-b border-white/20 shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5" />
          <h2 className="font-semibold text-base">Messages</h2>
          {unreadCount > 0 && (
            <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/messages')}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="View all conversations"
            title="View all conversations"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={closeChat}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Content - Only shows active conversation, no conversation list */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ChatSidebarContent initialConversationId={conversationId} />
      </div>
    </div>
  );
}

