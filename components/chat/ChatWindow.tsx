'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '@/types';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useSocket } from '@/lib/socket-context';
import { chatApi } from '@/lib/chat-api';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/hooks/useNotifications';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ChatWindowProps {
  initialConversationId?: string;
}

export function ChatWindow({ initialConversationId }: ChatWindowProps) {
  const { user } = useAuth();
  const { socket, isConnected, joinConversation, leaveConversation, onMessage, offMessage, isUserOnline } =
    useSocket();
  const { showChatNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(1, 50),
    enabled: !!user,
  });

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
      // If last page has messages, there might be more
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

  // Send message mutation - refetch messages (no caching)
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string; messageType?: string; attachments?: string[] }) =>
      chatApi.sendMessage(
        selectedConversation!.id,
        data.content,
        data.messageType || 'text',
        data.attachments || []
      ),
    onSuccess: (data: Message) => {
      // Refetch messages to get fresh data (no caching)
      refetchMessages();
      
      // Update conversations metadata (cached) with last message info
      queryClient.setQueryData(['conversations'], (old: any) => {
        if (!old?.conversations) return old;
        return {
          ...old,
          conversations: old.conversations.map((conv: Conversation) =>
            conv.id === selectedConversation?.id
              ? {
                  ...conv,
                  lastMessage: data.content,
                  lastMessageAt: data.createdAt,
                }
              : conv
          ),
        };
      });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: () => chatApi.markAsRead(selectedConversation!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  // Set initial conversation
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

  // Listen for new messages
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === selectedConversation.id) {
        // Refetch messages to get fresh data (no caching)
        refetchMessages();
        
        // Update conversations metadata (cached) with last message info
        queryClient.setQueryData(['conversations'], (old: any) => {
          if (!old?.conversations) return old;
          return {
            ...old,
            conversations: old.conversations.map((conv: Conversation) =>
              conv.id === selectedConversation.id
                ? {
                    ...conv,
                    lastMessage: message.content,
                    lastMessageAt: message.createdAt,
                  }
                : conv
            ),
          };
        });
        
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
        // Update conversations metadata (cached) for other conversations
        queryClient.setQueryData(['conversations'], (old: any) => {
          if (!old?.conversations) return old;
          return {
            ...old,
            conversations: old.conversations.map((conv: Conversation) =>
              conv.id === message.conversationId
                ? {
                    ...conv,
                    lastMessage: message.content,
                    lastMessageAt: message.createdAt,
                  }
                : conv
            ),
          };
        });
      }
    };

    onMessage(handleNewMessage);

    return () => {
      offMessage(handleNewMessage);
    };
  }, [socket, selectedConversation, onMessage, offMessage, user, showChatNotification]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

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

  const conversations = conversationsData?.conversations || [];

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-grey-200 bg-white flex flex-col">
        <div className="p-4 border-b border-grey-200 bg-white">
          <h2 className="text-xl font-bold text-grey-900">Messages</h2>
        </div>
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
          currentUserId={user?.id || ''}
          isLoading={conversationsLoading}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-grey-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-grey-200 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-grey-100 rounded-lg transition-colors"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5 text-grey-700" />
                </button>
                {(() => {
                  const otherParticipant = getOtherParticipant(selectedConversation);
                  if (!otherParticipant) return null;
                  return (
                    <>
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
                  );
                })()}
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
              <div className="px-4 py-2 bg-white border-t border-grey-200">
                <p className="text-sm text-grey-600 italic">
                  {Array.from(typingUsers).join(', ')} typing...
                </p>
              </div>
            )}

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              onTypingStop={handleTypingStop}
              disabled={sendMessageMutation.isPending || !isConnected}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-grey-50">
            <div className="text-center p-8 max-w-md">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <p className="text-grey-900 text-lg font-semibold mb-2">Select a conversation</p>
              <p className="text-grey-600 text-sm">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


