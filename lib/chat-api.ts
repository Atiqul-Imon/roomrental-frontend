import { api } from './api';

export interface Conversation {
  id: string;
  participant1: {
    id: string;
    name: string;
    profileImage?: string;
    email?: string;
  };
  participant2: {
    id: string;
    name: string;
    profileImage?: string;
    email?: string;
  };
  listing?: {
    id: string;
    title: string;
    images: string[];
    price?: number;
  };
  lastMessageAt?: string;
  unreadCount: number;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  attachments: string[];
  readAt?: string;
  deliveredAt?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    profileImage?: string;
  };
}

export const chatApi = {
  // Create or get conversation
  createOrGetConversation: async (userId: string, listingId?: string): Promise<Conversation> => {
    const response = await api.post('/chat/conversations', {
      userId,
      listingId,
    });
    return response.data;
  },

  // Get conversations list
  getConversations: async (page: number = 1, limit: number = 20): Promise<Conversation[]> => {
    const response = await api.get('/chat/conversations', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get messages
  getMessages: async (conversationId: string, page: number = 1, limit: number = 50): Promise<Message[]> => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Send message
  sendMessage: async (
    conversationId: string,
    content: string,
    messageType: string = 'text',
    attachments: string[] = []
  ): Promise<Message> => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
      messageType,
      attachments,
    });
    return response.data;
  },

  // Mark as read
  markAsRead: async (conversationId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/chat/conversations/${conversationId}/read`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/chat/unread-count');
    return response.data;
  },
};


