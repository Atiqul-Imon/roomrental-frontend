'use client';

import { ChatSidebar } from './ChatSidebar';
import { useChat } from '@/lib/chat-context';
import { useEffect } from 'react';

export function ChatWidgetWrapper() {
  const { isChatOpen } = useChat();
  
  // No need to push content for bottom-positioned widget
  
  return (
    <>
      {/* Desktop: Chat Sidebar (pushes content) */}
      <div className="hidden md:block">
        <ChatSidebar />
      </div>
    </>
  );
}

