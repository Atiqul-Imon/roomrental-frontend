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

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(1, 50),
    enabled: !!user,
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
    // Standard enterprise chat cache settings:
    // - Cache messages for performance (default gcTime: 5 minutes)
    // - Refetch on mount to ensure fresh data
    // - Socket events handle real-time updates
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const messages = messagesData?.pages.flat() || [];

  // Send message mutation with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string; messageType?: string; attachments?: string[] }) =>
      chatApi.sendMessage(
        selectedConversation!.id,
        data.content,
        data.messageType || 'text',
        data.attachments || []
      ),
    onMutate: async (variables) => {
      if (!selectedConversation || !user) return;

      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', selectedConversation.id] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(['messages', selectedConversation.id]);

      // Optimistically update cache with temporary message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: selectedConversation.id,
        senderId: user.id,
        content: variables.content,
        messageType: (variables.messageType || 'text') as 'text' | 'image' | 'file' | 'system',
        attachments: variables.attachments || [],
        createdAt: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.name,
          profileImage: user.profileImage,
        },
      };

      queryClient.setQueryData(['messages', selectedConversation.id], (old: any) => {
        if (!old) return old;
        const lastPage = old.pages[old.pages.length - 1];
        return {
          ...old,
          pages: [
            ...old.pages.slice(0, -1),
            [...lastPage, optimisticMessage],
          ],
        };
      });

      // Update conversations list optimistically
      queryClient.setQueryData(['conversations'], (old: any) => {
        if (!old?.conversations) return old;
        return {
          ...old,
          conversations: old.conversations.map((conv: Conversation) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: optimisticMessage.content,
                  lastMessageAt: optimisticMessage.createdAt,
                }
              : conv
          ),
        };
      });

      return { previousMessages };
    },
    onSuccess: (data: Message) => {
      if (!selectedConversation) return;

      // Replace optimistic message with real message from server
      queryClient.setQueryData(['messages', selectedConversation.id], (old: any) => {
        if (!old) return old;
        const allMessages = old.pages.flat();
        
        // Check if message already exists (socket event might have already added it)
        if (allMessages.some((m: Message) => m.id === data.id)) {
          return old; // Message already in cache
        }
        
        // Find and replace temp message with real one
        let foundTemp = false;
        const newPages = old.pages.map((page: Message[]) => {
          const tempIndex = page.findIndex((m: Message) => m.id.startsWith('temp-'));
          if (tempIndex !== -1 && !foundTemp) {
            foundTemp = true;
            return page.map((m: Message, idx: number) => 
              idx === tempIndex ? data : m
            );
          }
          return page;
        });
        
        if (foundTemp) {
          return { ...old, pages: newPages };
        }
        
        // If temp message not found, add real message to last page (fallback)
        const lastPage = old.pages[old.pages.length - 1];
        if (!lastPage.some((m: Message) => m.id === data.id)) {
          return {
            ...old,
            pages: [
              ...old.pages.slice(0, -1),
              [...lastPage, data],
            ],
          };
        }
        
        return old;
      });

      // Update conversations list with real message
      queryClient.setQueryData(['conversations'], (old: any) => {
        if (!old?.conversations) return old;
        return {
          ...old,
          conversations: old.conversations.map((conv: Conversation) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: data.content,
                  lastMessageAt: data.createdAt,
                }
              : conv
          ),
        };
      });

      // Invalidate conversations to refresh unread counts, etc.
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousMessages && selectedConversation) {
        queryClient.setQueryData(['messages', selectedConversation.id], context.previousMessages);
      }
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
        // Update cache with new message (socket event for real-time updates)
        queryClient.setQueryData(
          ['messages', selectedConversation.id],
          (old: any) => {
            if (!old) return old;
            const allMessages = old.pages.flat();
            // Check if message already exists (avoid duplicates)
            if (allMessages.some((m: Message) => m.id === message.id || (m.id.startsWith('temp-') && m.content === message.content && m.senderId === message.senderId))) {
              // Replace temp message with real one if it exists
              const hasTemp = allMessages.some((m: Message) => m.id.startsWith('temp-') && m.content === message.content && m.senderId === message.senderId);
              if (hasTemp) {
                const newPages = old.pages.map((page: Message[]) => 
                  page.map((m: Message) => 
                    m.id.startsWith('temp-') && m.content === message.content && m.senderId === message.senderId ? message : m
                  )
                );
                return { ...old, pages: newPages };
              }
              return old;
            }
            // Add new message to the last page
            const lastPage = old.pages[old.pages.length - 1];
            return {
              ...old,
              pages: [
                ...old.pages.slice(0, -1),
                [...lastPage, message],
              ],
            };
          }
        );
        // Update conversations list
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
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    };

    onMessage(handleNewMessage);

    return () => {
      offMessage(handleNewMessage);
    };
  }, [socket, selectedConversation, onMessage, offMessage, user, showChatNotification, queryClient, markAsReadMutation]);

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

