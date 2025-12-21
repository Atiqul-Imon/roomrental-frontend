'use client';

import { useQuery } from '@tanstack/react-query';
import { chatApi, Conversation } from '@/lib/chat-api';
import { useAuth } from '@/lib/auth-context';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export function ConversationList() {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(),
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-12 h-12 rounded-full bg-grey-200" />
            <div className="flex-1">
              <div className="h-4 bg-grey-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-grey-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-8 text-center text-grey-600">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-grey-400" />
        <p className="font-medium">No conversations yet</p>
        <p className="text-sm mt-1">Start a conversation by messaging a landlord or student</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-grey-200">
      {conversations.map((conv) => {
        const otherUser = conv.participant1.id === user?.id 
          ? conv.participant2 
          : conv.participant1;
        const lastMessage = conv.messages?.[0];

        return (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className="block p-4 hover:bg-grey-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                {otherUser.profileImage ? (
                  <img
                    src={otherUser.profileImage}
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary-600 font-semibold text-lg">
                    {otherUser.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-grey-900 truncate">
                    {otherUser.name}
                  </h3>
                  {conv.lastMessageAt && (
                    <span className="text-xs text-grey-500 flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-sm text-grey-600 truncate">
                    {lastMessage.content}
                  </p>
                )}
                {conv.listing && (
                  <p className="text-xs text-grey-500 mt-1 truncate">
                    {conv.listing.title}
                  </p>
                )}
                {conv.unreadCount > 0 && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-white bg-primary-600 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}


