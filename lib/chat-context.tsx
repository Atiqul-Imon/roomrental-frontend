'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (conversationId: string, content: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  onMessage: (callback: (message: any) => void) => () => void;
  onTyping: (callback: (data: any) => void) => () => void;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const newSocket = io(`${API_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Chat connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Chat disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Chat connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, user]);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('send-message', { conversationId, content });
    }
  }, [socket, isConnected]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('join-conversation', { conversationId });
    }
  }, [socket, isConnected]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-conversation', { conversationId });
    }
  }, [socket, isConnected]);

  const onMessage = useCallback((callback: (message: any) => void) => {
    if (socket) {
      socket.on('new-message', callback);
      return () => socket.off('new-message', callback);
    }
    return () => {};
  }, [socket]);

  const onTyping = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('user-typing', callback);
      socket.on('user-stopped-typing', callback);
      return () => {
        socket.off('user-typing', callback);
        socket.off('user-stopped-typing', callback);
      };
    }
    return () => {};
  }, [socket]);

  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      if (isTyping) {
        socket.emit('typing-start', { conversationId });
      } else {
        socket.emit('typing-stop', { conversationId });
      }
    }
  }, [socket, isConnected]);

  return (
    <ChatContext.Provider
      value={{
        socket,
        isConnected,
        sendMessage,
        joinConversation,
        leaveConversation,
        onMessage,
        onTyping,
        emitTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}


