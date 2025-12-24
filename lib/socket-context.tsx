'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>; // Set of online user IDs
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  onMessage: (callback: (message: any) => void) => void;
  onTyping: (callback: (data: { userId: string; conversationId: string }) => void) => void;
  onTypingStop: (callback: (data: { userId: string; conversationId: string }) => void) => void;
  onUserOnline: (callback: (data: { userId: string }) => void) => void;
  onUserOffline: (callback: (data: { userId: string }) => void) => void;
  emitTyping: (conversationId: string) => void;
  emitTypingStop: (conversationId: string) => void;
  offMessage: (callback: (message: any) => void) => void;
  offTyping: (callback: (data: { userId: string; conversationId: string }) => void) => void;
  offTypingStop: (callback: (data: { userId: string; conversationId: string }) => void) => void;
  isUserOnline: (userId: string) => boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
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

    // Listen for user online/offline events
    newSocket.on('user-online', (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    });

    newSocket.on('user-offline', (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
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

  const onUserOnline = (callback: (data: { userId: string }) => void) => {
    if (socket) {
      socket.on('user-online', callback);
    }
  };

  const onUserOffline = (callback: (data: { userId: string }) => void) => {
    if (socket) {
      socket.on('user-offline', callback);
    }
  };

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        joinConversation,
        leaveConversation,
        onMessage,
        onTyping,
        onTypingStop,
        onUserOnline,
        onUserOffline,
        emitTyping,
        emitTypingStop,
        offMessage,
        offTyping,
        offTypingStop,
        isUserOnline,
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


