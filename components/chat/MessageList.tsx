'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatApi, Message } from '@/lib/chat-api';
import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { format } from 'date-fns';

interface MessageListProps {
  conversationId: string;
}

export function MessageList({ conversationId }: MessageListProps) {
  const { user } = useAuth();
  const { onMessage, joinConversation, leaveConversation } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], refetch } = useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: () => chatApi.getMessages(conversationId),
  });

  useEffect(() => {
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
  }, [conversationId, joinConversation, leaveConversation]);

  useEffect(() => {
    const unsubscribe = onMessage((newMessage) => {
      if (newMessage.conversationId === conversationId) {
        refetch();
      }
    });

    return unsubscribe;
  }, [conversationId, onMessage, refetch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-grey-500 p-8">
        <div className="text-center">
          <p className="font-medium">No messages yet</p>
          <p className="text-sm mt-1">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isOwn = message.senderId === user?.id;
        const prevMessage = messages[index - 1];
        const showDateSeparator = 
          !prevMessage || 
          new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();

        return (
          <div key={message.id}>
            {showDateSeparator && (
              <div className="text-center my-4">
                <span className="text-xs text-grey-500 bg-grey-100 px-3 py-1 rounded-full">
                  {format(new Date(message.createdAt), 'MMMM dd, yyyy')}
                </span>
              </div>
            )}
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-primary-600 text-white'
                    : 'bg-grey-200 text-grey-900'
                }`}
              >
                {!isOwn && (
                  <div className="text-xs font-semibold mb-1 opacity-90">
                    {message.sender.name}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <div
                  className={`text-xs mt-1 ${
                    isOwn ? 'text-primary-100' : 'text-grey-500'
                  }`}
                >
                  {format(new Date(message.createdAt), 'HH:mm')}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}


