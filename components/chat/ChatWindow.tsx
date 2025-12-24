'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '@/types';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useSocket } from '@/lib/socket-context';
import { chatApi } from '@/lib/chat-api';
import { useAuth } from '@/lib/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ChatWindowProps {
  initialConversationId?: string;
}

export function ChatWindow({ initialConversationId }: ChatWindowProps) {
  const { user } = useAuth();
  const { socket, isConnected, joinConversation, leaveConversation, onMessage, offMessage } =
    useSocket();
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

  // Fetch messages for selected conversation
  const {
    data: messages = [],
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => chatApi.getMessages(selectedConversation!.id, 1, 100),
    enabled: !!selectedConversation?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      chatApi.sendMessage(selectedConversation!.id, content, 'text', []),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      refetchMessages();
      refetchConversations();
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
    if (initialConversationId && conversationsData?.conversations) {
      const conv = conversationsData.conversations.find((c) => c.id === initialConversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [initialConversationId, conversationsData]);

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
        queryClient.setQueryData(['messages', selectedConversation.id], (old: Message[] = []) => {
          // Check if message already exists
          if (old.some((m) => m.id === message.id)) {
            return old;
          }
          return [...old, message];
        });
        refetchMessages();
        refetchConversations();
        markAsReadMutation.mutate();
      } else {
        // Message in another conversation - just refresh conversations list
        refetchConversations();
      }
    };

    onMessage(handleNewMessage);

    return () => {
      offMessage(handleNewMessage);
    };
  }, [socket, selectedConversation, onMessage, offMessage]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = (content: string) => {
    if (selectedConversation && content.trim()) {
      sendMessageMutation.mutate(content);
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
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
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
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {(() => {
                  const otherParticipant = getOtherParticipant(selectedConversation);
                  if (!otherParticipant) return null;
                  return (
                    <>
                      {otherParticipant.profileImage ? (
                        <Image
                          src={otherParticipant.profileImage}
                          alt={otherParticipant.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                          {otherParticipant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{otherParticipant.name}</h3>
                        {selectedConversation.listing && (
                          <Link
                            href={`/listings/${selectedConversation.listing.id}`}
                            className="text-sm text-gray-500 hover:text-primary-600"
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
            />

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="px-4 py-2 text-sm text-gray-500 italic">
                {Array.from(typingUsers).join(', ')} typing...
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Select a conversation</p>
              <p className="text-gray-400 text-sm mt-2">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


