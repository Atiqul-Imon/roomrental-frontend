import { api } from './api';
import { Conversation, Message } from '@/types';

export const chatApi = {
  // Create or get conversation
  createOrGetConversation: async (userId: string, listingId?: string): Promise<Conversation> => {
    const response = await api.post('/chat/conversations', { userId, listingId });
    return response.data.data || response.data;
  },

  // Get all conversations
  getConversations: async (page: number = 1, limit: number = 20): Promise<{
    conversations: Conversation[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get('/chat/conversations', {
      params: { page, limit },
    });
    const data = response.data.data || response.data || [];
    return {
      conversations: Array.isArray(data) ? data : [],
      pagination: {
        total: response.data.pagination?.total || data.length || 0,
        page: response.data.pagination?.page || page,
        limit: response.data.pagination?.limit || limit,
        totalPages: response.data.pagination?.totalPages || 1,
      },
    };
  },

  // Get messages for a conversation
  getMessages: async (
    conversationId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<Message[]> => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },

  // Send a message
  sendMessage: async (
    conversationId: string,
    content: string,
    messageType: string = 'text',
    attachments: string[] = [],
  ): Promise<Message> => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
      messageType,
      attachments,
    });
    return response.data.data || response.data;
  },

  // Mark messages as read
  markAsRead: async (conversationId: string): Promise<void> => {
    await api.post(`/chat/conversations/${conversationId}/read`);
  },

  // Get unread message count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/chat/unread-count');
    return response.data.count || 0;
  },
};

