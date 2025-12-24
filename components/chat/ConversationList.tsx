'use client';

import { useState } from 'react';
import { Conversation } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { MessageSquare, Circle } from 'lucide-react';
import Image from 'next/image';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId: string;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
  isLoading,
}: ConversationListProps) {
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participant1Id === currentUserId
      ? conversation.participant2
      : conversation.participant1;
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      return conversation.messages[0];
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No conversations yet</p>
          <p className="text-gray-400 text-xs mt-2">Start a conversation from a listing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 space-y-1">
        {conversations.map((conversation) => {
          const otherParticipant = getOtherParticipant(conversation);
          const lastMessage = getLastMessage(conversation);
          const isSelected = selectedConversationId === conversation.id;
          const unreadCount = conversation.unreadCount || 0;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full p-3 rounded-lg transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {otherParticipant.profileImage ? (
                    <Image
                      src={otherParticipant.profileImage}
                      alt={otherParticipant.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isSelected ? 'bg-white text-primary-500' : 'bg-primary-100 text-primary-600'
                      }`}
                    >
                      {otherParticipant.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-semibold text-sm truncate ${
                        isSelected ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {otherParticipant.name}
                    </h3>
                    {conversation.lastMessageAt && (
                      <span
                        className={`text-xs flex-shrink-0 ml-2 ${
                          isSelected ? 'text-white/80' : 'text-gray-500'
                        }`}
                      >
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                          addSuffix: false,
                        })}
                      </span>
                    )}
                  </div>

                  {conversation.listing && (
                    <p
                      className={`text-xs mb-1 truncate ${
                        isSelected ? 'text-white/80' : 'text-gray-600'
                      }`}
                    >
                      {conversation.listing.title}
                    </p>
                  )}

                  {lastMessage ? (
                    <p
                      className={`text-sm truncate ${
                        isSelected
                          ? 'text-white/90'
                          : unreadCount > 0
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-600'
                      }`}
                    >
                      {lastMessage.senderId === currentUserId && 'You: '}
                      {lastMessage.content}
                    </p>
                  ) : (
                    <p
                      className={`text-sm italic ${
                        isSelected ? 'text-white/70' : 'text-gray-400'
                      }`}
                    >
                      No messages yet
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


