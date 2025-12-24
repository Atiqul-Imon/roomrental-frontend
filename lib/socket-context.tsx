'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  onMessage: (callback: (message: any) => void) => void;
  onTyping: (callback: (data: { userId: string; conversationId: string }) => void) => void;
  onTypingStop: (callback: (data: { userId: string; conversationId: string }) => void) => void;
  emitTyping: (conversationId: string) => void;
  emitTypingStop: (conversationId: string) => void;
  offMessage: (callback: (message: any) => void) => void;
  offTyping: (callback: (data: { userId: string; conversationId: string }) => void) => void;
  offTypingStop: (callback: (data: { userId: string; conversationId: string }) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return;
    }

    // Initialize socket connection
    const newSocket = io(`${API_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    return () => {
      newSocket.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  const joinConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('join-conversation', { conversationId });
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-conversation', { conversationId });
    }
  };

  const onMessage = (callback: (message: any) => void) => {
    if (socket) {
      socket.on('new-message', callback);
    }
  };

  const offMessage = (callback: (message: any) => void) => {
    if (socket) {
      socket.off('new-message', callback);
    }
  };

  const onTyping = (callback: (data: { userId: string; conversationId: string }) => void) => {
    if (socket) {
      socket.on('user-typing', callback);
    }
  };

  const offTyping = (callback: (data: { userId: string; conversationId: string }) => void) => {
    if (socket) {
      socket.off('user-typing', callback);
    }
  };

  const onTypingStop = (callback: (data: { userId: string; conversationId: string }) => void) => {
    if (socket) {
      socket.on('user-stopped-typing', callback);
    }
  };

  const offTypingStop = (callback: (data: { userId: string; conversationId: string }) => void) => {
    if (socket) {
      socket.off('user-stopped-typing', callback);
    }
  };

  const emitTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-start', { conversationId });
    }
  };

  const emitTypingStop = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { conversationId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        onMessage,
        onTyping,
        onTypingStop,
        emitTyping,
        emitTypingStop,
        offMessage,
        offTyping,
        offTypingStop,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}


