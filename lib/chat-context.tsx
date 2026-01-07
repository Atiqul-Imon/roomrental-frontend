'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  openChat: (conversationId?: string) => void;
  closeChat: () => void;
  conversationId?: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const openChat = (convId?: string) => {
    setConversationId(convId);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setConversationId(undefined);
  };

  return (
    <ChatContext.Provider value={{ isChatOpen, openChat, closeChat, conversationId }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}






