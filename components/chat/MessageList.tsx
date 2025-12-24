'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  currentUserId: string;
}

export function MessageList({ messages, isLoading, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'HH:mm')}`;
    } else {
      return format(messageDate, 'MMM d, HH:mm');
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentGroup: Message[] = [];
    let currentDate = '';

    messages.forEach((message, index) => {
      const messageDate = format(new Date(message.createdAt), 'yyyy-MM-dd');
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const prevDate = prevMessage ? format(new Date(prevMessage.createdAt), 'yyyy-MM-dd') : '';

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentGroup = [message];
        currentDate = messageDate;
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const formatGroupDate = (date: string) => {
    const groupDate = new Date(date);
    if (isToday(groupDate)) {
      return 'Today';
    } else if (isYesterday(groupDate)) {
      return 'Yesterday';
    } else {
      return format(groupDate, 'MMMM d, yyyy');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm">No messages yet</p>
          <p className="text-gray-400 text-xs mt-2">Start the conversation!</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messageGroups.map((group, groupIndex) => (
        <div key={group.date}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatGroupDate(group.date)}
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {group.messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUserId;
              const prevMessage = index > 0 ? group.messages[index - 1] : null;
              const showAvatar =
                !prevMessage ||
                prevMessage.senderId !== message.senderId ||
                new Date(message.createdAt).getTime() -
                  new Date(prevMessage.createdAt).getTime() >
                  300000; // 5 minutes

              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        message.sender.profileImage ? (
                          <Image
                            src={message.sender.profileImage}
                            alt={message.sender.name}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold">
                            {message.sender.name.charAt(0).toUpperCase()}
                          </div>
                        )
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}

                  <div
                    className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}
                  >
                    {showAvatar && !isOwnMessage && (
                      <span className="text-xs text-gray-600 mb-1 px-2">
                        {message.sender.name}
                      </span>
                    )}

                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.messageType === 'text' ? (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      ) : message.messageType === 'image' ? (
                        <div className="space-y-2">
                          <p className="text-sm">{message.content}</p>
                          {message.attachments.map((url, idx) => (
                            <Image
                              key={idx}
                              src={url}
                              alt={`Image ${idx + 1}`}
                              width={200}
                              height={200}
                              className="rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}

                      <span
                        className={`text-xs mt-1 block ${
                          isOwnMessage ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                        {isOwnMessage && message.readAt && (
                          <span className="ml-1">✓✓</span>
                        )}
                        {isOwnMessage && !message.readAt && message.deliveredAt && (
                          <span className="ml-1">✓</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {isOwnMessage && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        <div className="w-8" />
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}


