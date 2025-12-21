'use client';

import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/chat-api';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useAuth();
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(),
  });

  const conversation = conversations?.find((c) => c.id === conversationId);

  useEffect(() => {
    // Mark messages as read when viewing
    if (conversationId) {
      chatApi.markAsRead(conversationId).catch(console.error);
    }
  }, [conversationId]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-grey-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const otherUser =
    conversation.participant1.id === user?.id
      ? conversation.participant2
      : conversation.participant1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-grey-200 p-4 bg-white flex items-center gap-3">
        <Link href="/chat" className="lg:hidden">
          <ArrowLeft className="w-5 h-5 text-grey-600 hover:text-grey-900" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          {otherUser.profileImage ? (
            <img
              src={otherUser.profileImage}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-primary-600 font-semibold">
              {otherUser.name?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-grey-900 truncate">{otherUser.name}</h2>
          {conversation.listing && (
            <p className="text-sm text-grey-600 truncate">{conversation.listing.title}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList conversationId={conversationId} />

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}


