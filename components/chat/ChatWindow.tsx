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
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/UserAvatar';

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

  // Fetch conversations - no caching for real-time updates
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(1, 50),
    enabled: !!user,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache conversations
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
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

  // Send message mutation - OPTIMISTIC UPDATE for instant feedback
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string; messageType?: string; attachments?: string[] }) =>
      chatApi.sendMessage(
        selectedConversation!.id,
        data.content,
        data.messageType || 'text',
        data.attachments || []
      ),
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', selectedConversation?.id] });
      
      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(['messages', selectedConversation?.id]);
      
      // Optimistically add message to cache
      if (selectedConversation && user) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          conversationId: selectedConversation.id,
          senderId: user.id,
          content: variables.content,
          messageType: (variables.messageType || 'text') as any,
          attachments: variables.attachments || [],
          createdAt: new Date().toISOString(),
          sender: {
            id: user.id,
            name: user.name,
            profileImage: user.profileImage,
          },
        };
        
        queryClient.setQueryData(['messages', selectedConversation.id], (oldData: any) => {
          if (!oldData) return { pages: [[optimisticMessage]], pageParams: [1] };
          
          const lastPage = oldData.pages[oldData.pages.length - 1];
          const updatedLastPage = [...lastPage, optimisticMessage];
          
          // Sort by createdAt
          updatedLastPage.sort((a: Message, b: Message) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          return {
            ...oldData,
            pages: [...oldData.pages.slice(0, -1), updatedLastPage],
          };
        });
      }
      
      return { previousMessages };
    },
    onSuccess: (data: Message) => {
      // Replace optimistic message with real message from server
      if (selectedConversation) {
        queryClient.setQueryData(['messages', selectedConversation.id], (oldData: any) => {
          if (!oldData) return { pages: [[data]], pageParams: [1] };
          
          // Replace temp message with real one
          const allMessages = oldData.pages.flat();
          const filteredMessages = allMessages.filter((m: Message) => !m.id.startsWith('temp-'));
          
          // Check if real message already exists
          if (!filteredMessages.some((m: Message) => m.id === data.id)) {
            filteredMessages.push(data);
          }
          
          // Sort and repaginate
          filteredMessages.sort((a: Message, b: Message) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          // Repaginate into pages of 50
          const pages: Message[][] = [];
          for (let i = 0; i < filteredMessages.length; i += 50) {
            pages.push(filteredMessages.slice(i, i + 50));
          }
          
          return {
            pages: pages.length > 0 ? pages : [[data]],
            pageParams: pages.map((_, i) => i + 1),
          };
        });
      }
      
      // Update conversations list
      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData?.conversations) return oldData;
        
        const conversations = [...oldData.conversations];
        const convIndex = conversations.findIndex((c: Conversation) => c.id === data.conversationId);
        
        if (convIndex >= 0) {
          conversations[convIndex] = {
            ...conversations[convIndex],
            lastMessageAt: data.createdAt,
            messages: [data],
          };
          
          // Move to top
          const updatedConv = conversations.splice(convIndex, 1)[0];
          conversations.unshift(updatedConv);
        }
        
        return { ...oldData, conversations };
      });
      
      // Invalidate unread count (async)
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
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
      // Invalidate all chat-related caches
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
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

  // Refetch messages when socket reconnects (only if needed)
  useEffect(() => {
    if (isConnected && selectedConversation) {
      // Only refetch if we don't have recent messages (avoid unnecessary refetches)
      const messagesData = queryClient.getQueryData(['messages', selectedConversation.id]);
      if (!messagesData) {
        refetchMessages();
      }
      refetchConversations();
    }
  }, [isConnected, selectedConversation, queryClient, refetchMessages, refetchConversations]);

  // Listen for typing indicators
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    const handleTyping = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === selectedConversation.id && data.userId !== user?.id) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      }
    };

    const handleTypingStop = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === selectedConversation.id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    socket.on('user-typing', handleTyping);
    socket.on('user-stopped-typing', handleTypingStop);

    return () => {
      socket.off('user-typing', handleTyping);
      socket.off('user-stopped-typing', handleTypingStop);
    };
  }, [socket, selectedConversation, user]);

  // Listen for new messages - REAL-TIME: Add directly to cache
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    const handleNewMessage = (message: Message) => {
      // CRITICAL: Add message directly to cache for instant display (no refetch delay)
      if (message.conversationId === selectedConversation.id) {
        // Add message to the current conversation's cache immediately
        queryClient.setQueryData(['messages', message.conversationId], (oldData: any) => {
          if (!oldData) return { pages: [[message]], pageParams: [1] };
          
          // Check if message already exists (prevent duplicates)
          const allMessages = oldData.pages.flat();
          if (allMessages.some((m: Message) => m.id === message.id)) {
            return oldData;
          }
          
          // Add new message to the last page (most recent messages)
          const lastPage = oldData.pages[oldData.pages.length - 1];
          const updatedLastPage = [...lastPage, message];
          
          // Sort messages by createdAt to maintain order
          updatedLastPage.sort((a: Message, b: Message) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          return {
            ...oldData,
            pages: [...oldData.pages.slice(0, -1), updatedLastPage],
          };
        });
        
        // Mark as read immediately
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
      }
      
      // Update conversations list to show latest message
      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData?.conversations) return oldData;
        
        const conversations = [...oldData.conversations];
        const convIndex = conversations.findIndex((c: Conversation) => c.id === message.conversationId);
        
        if (convIndex >= 0) {
          // Update conversation with new last message
          conversations[convIndex] = {
            ...conversations[convIndex],
            lastMessageAt: message.createdAt,
            messages: [message],
            unreadCount: message.conversationId === selectedConversation.id 
              ? 0 
              : (conversations[convIndex].unreadCount || 0) + (message.senderId !== user?.id ? 1 : 0),
          };
          
          // Move to top (most recent first)
          const updatedConv = conversations.splice(convIndex, 1)[0];
          conversations.unshift(updatedConv);
        }
        
        return { ...oldData, conversations };
      });
      
      // Invalidate unread count (async, non-blocking)
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
    };

    onMessage(handleNewMessage);

    return () => {
      offMessage(handleNewMessage);
    };
  }, [socket, selectedConversation, onMessage, offMessage, user, showChatNotification, queryClient, markAsReadMutation]);

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
                        <UserAvatar
                          name={otherParticipant.name}
                          profileImage={otherParticipant.profileImage}
                          seed={otherParticipant.id}
                          size="md"
                        />
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

            {/* Message Input - Fixed above bottom nav on mobile */}
            <div className="flex-shrink-0 sticky bottom-0 lg:static bg-white z-10 safe-area-bottom pb-4 lg:pb-6">
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onTypingStop={handleTypingStop}
                disabled={sendMessageMutation.isPending || !isConnected}
              />
            </div>
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


