'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '@/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ConversationList } from './ConversationList';
import { useSocket } from '@/lib/socket-context';
import { chatApi } from '@/lib/chat-api';
import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { useNotifications } from '@/hooks/useNotifications';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ChatSidebarContentProps {
  initialConversationId?: string;
}

export function ChatSidebarContent({ initialConversationId }: ChatSidebarContentProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { openChat } = useChat();
  const { socket, isConnected, joinConversation, leaveConversation, onMessage, offMessage, isUserOnline } =
    useSocket();
  const { showChatNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Fetch conversations - no caching for real-time updates
  const { data: conversationsData, isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(1, 50),
    enabled: !!user,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache conversations
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Set conversation when data is loaded
  useEffect(() => {
    if (initialConversationId) {
      if (conversationsData?.conversations) {
        const conv = conversationsData.conversations.find((c) => c.id === initialConversationId);
        if (conv) {
          setSelectedConversation(conv);
        } else {
          // Conversation not found in list, refetch conversations
          refetchConversations();
        }
      } else if (!conversationsLoading) {
        // If conversations are not loading and data is not available, refetch
        refetchConversations();
      }
    } else if (!initialConversationId) {
      // If no conversation ID provided, clear selection
      setSelectedConversation(null);
    }
  }, [initialConversationId, conversationsData, conversationsLoading, refetchConversations]);

  // Try to set conversation again after refetch
  useEffect(() => {
    if (initialConversationId && conversationsData?.conversations && !selectedConversation) {
      const conv = conversationsData.conversations.find((c) => c.id === initialConversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [initialConversationId, conversationsData, selectedConversation]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    openChat(conversation.id);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    openChat(); // Open without conversationId to show list
  };

  // Fetch messages for selected conversation with infinite scroll
  // NO CACHING for messages - always fetch fresh from server
  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useInfiniteQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: ({ pageParam = 1 }) =>
      chatApi.getMessages(selectedConversation!.id, pageParam, 50),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 50) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: !!selectedConversation?.id,
    initialPageParam: 1,
    // No caching for messages - always fetch fresh
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache messages (metadata is cached separately)
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: false, // Socket handles real-time updates
  });

  const messages = messagesData?.pages.flat() || [];

  // Send message mutation - NO optimistic updates, just refetch messages
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string; messageType?: string; attachments?: string[] }) =>
      chatApi.sendMessage(
        selectedConversation!.id,
        data.content,
        data.messageType || 'text',
        data.attachments || []
      ),
    onSuccess: (data: Message) => {
      if (!selectedConversation) return;

      // Invalidate all chat-related caches immediately
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });

      // Reset infinite query to ensure fresh data
      queryClient.resetQueries({ queryKey: ['messages', selectedConversation.id] });

      // Refetch messages to get fresh data immediately
      refetchMessages();
      // Refetch conversations to update the list
      refetchConversations();
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: () => chatApi.markAsRead(selectedConversation!.id),
    onSuccess: () => {
      // Invalidate all chat-related caches
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversation && isConnected) {
      joinConversation(selectedConversation.id);
      markAsReadMutation.mutate();

      return () => {
        leaveConversation(selectedConversation.id);
      };
    }
  }, [selectedConversation?.id, isConnected]);

  // Invalidate cache and refetch when socket reconnects
  useEffect(() => {
    if (isConnected && selectedConversation) {
      // Clear all chat caches on reconnect to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      // Refetch messages immediately
      refetchMessages();
      refetchConversations();
    }
  }, [isConnected, selectedConversation, queryClient, refetchMessages, refetchConversations]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    const handleNewMessage = (message: Message) => {
      // Invalidate all chat-related caches immediately for real-time updates
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      
      // Reset infinite query to ensure fresh data
      queryClient.resetQueries({ queryKey: ['messages', message.conversationId] });
      
      if (message.conversationId === selectedConversation.id) {
        // Refetch messages to get fresh data immediately
        refetchMessages();
        markAsReadMutation.mutate();
      } else {
        // Message in another conversation - show notification
        if (message.senderId !== user?.id) {
          showChatNotification(
            message.sender.name,
            message.content,
            message.conversationId
          );
        }
        // Refetch conversations to update the list
        refetchConversations();
      }
    };

    onMessage(handleNewMessage);

    return () => {
      offMessage(handleNewMessage);
    };
  }, [socket, selectedConversation, onMessage, offMessage, user, showChatNotification, queryClient, markAsReadMutation, refetchMessages]);

  const handleSendMessage = (content: string, messageType?: string, attachments?: string[]) => {
    if (selectedConversation && (content.trim() || (attachments && attachments.length > 0))) {
      sendMessageMutation.mutate({
        content,
        messageType: messageType || 'text',
        attachments: attachments || [],
      });
    }
  };

  const handleTyping = useCallback(() => {
    if (selectedConversation && socket && isConnected) {
      socket.emit('typing-start', { conversationId: selectedConversation.id });
    }
  }, [selectedConversation, socket, isConnected]);

  const handleTypingStop = useCallback(() => {
    if (selectedConversation && socket && isConnected) {
      socket.emit('typing-stop', { conversationId: selectedConversation.id });
    }
  }, [selectedConversation, socket, isConnected]);

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return null;
    return conversation.participant1Id === user.id
      ? conversation.participant2
      : conversation.participant1;
  };

  // Show conversation list when no conversation is selected
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col bg-white h-full min-h-0">
        <ConversationList
          conversations={conversationsData?.conversations || []}
          selectedConversationId={undefined}
          onSelectConversation={handleSelectConversation}
          currentUserId={user?.id || ''}
          isLoading={conversationsLoading}
        />
      </div>
    );
  }

  const otherParticipant = getOtherParticipant(selectedConversation);

  return (
    <div className="flex-1 flex flex-col bg-grey-50 h-full min-h-0">
      {/* Chat Header */}
      <div className="p-4 border-b border-grey-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          {otherParticipant && (
            <>
              <button
                onClick={handleBackToList}
                className="p-1.5 hover:bg-grey-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Back to conversations"
                title="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5 text-grey-700" />
              </button>
              <div className="relative">
                {otherParticipant.profileImage ? (
                  <Image
                    src={otherParticipant.profileImage}
                    alt={otherParticipant.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-semibold text-sm">
                    {otherParticipant.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isUserOnline(otherParticipant.id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-grey-900 truncate">{otherParticipant.name}</h3>
                </div>
                {selectedConversation.listing && (
                  <Link
                    href={`/listings/${selectedConversation.listing.id}`}
                    className="text-sm text-grey-600 hover:text-accent-600 truncate block"
                  >
                    {selectedConversation.listing.title}
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={messagesLoading}
        currentUserId={user?.id || ''}
        hasMore={hasNextPage}
        isFetchingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 bg-white border-t border-grey-200 flex-shrink-0">
          <p className="text-sm text-grey-600 italic">
            {Array.from(typingUsers).join(', ')} typing...
          </p>
        </div>
      )}

      {/* Message Input */}
      <div className="flex-shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onTypingStop={handleTypingStop}
          disabled={sendMessageMutation.isPending || !isConnected}
        />
      </div>
    </div>
  );
}

