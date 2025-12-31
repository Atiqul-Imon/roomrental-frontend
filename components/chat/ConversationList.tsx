'use client';

import { useState } from 'react';
import { Conversation } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { MessageSquare, Circle } from 'lucide-react';
import Image from 'next/image';
import { useSocket } from '@/lib/socket-context';

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
  const { isUserOnline } = useSocket();

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-grey-400 mx-auto mb-4" />
          <p className="text-grey-700 text-sm font-medium">No conversations yet</p>
          <p className="text-grey-500 text-xs mt-2">Start a conversation from a listing</p>
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
                  ? 'bg-gradient-primary text-white shadow-md'
                  : 'bg-white hover:bg-grey-50 border border-transparent hover:border-grey-200'
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
                        isSelected ? 'bg-white/20 text-white' : 'bg-gradient-primary text-white'
                      }`}
                    >
                      {otherParticipant.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Online Status Indicator */}
                  {isUserOnline(otherParticipant.id) && (
                    <div className={`absolute bottom-0 right-0 w-3 h-3 bg-accent-500 border-2 ${isSelected ? 'border-white' : 'border-white'} rounded-full`}></div>
                  )}
                  {unreadCount > 0 && (
                    <div className={`absolute -top-1 -right-1 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold ${
                      isSelected ? 'bg-white/30 backdrop-blur-sm text-white' : 'bg-red-500 text-white'
                    }`}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-semibold text-sm truncate ${
                        isSelected ? 'text-white' : 'text-grey-900'
                      }`}
                    >
                      {otherParticipant.name}
                    </h3>
                    {conversation.lastMessageAt && (
                      <span
                        className={`text-xs flex-shrink-0 ml-2 ${
                          isSelected ? 'text-white/90' : 'text-grey-500'
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
                        isSelected ? 'text-white/90' : 'text-grey-600'
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
                            ? 'text-grey-900 font-semibold'
                            : 'text-grey-600'
                      }`}
                    >
                      {lastMessage.senderId === currentUserId && 'You: '}
                      {lastMessage.content}
                    </p>
                  ) : (
                    <p
                      className={`text-sm italic ${
                        isSelected ? 'text-white/80' : 'text-grey-500'
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


