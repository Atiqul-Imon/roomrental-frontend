'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Paperclip } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  currentUserId: string;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
}

export function MessageList({
  messages,
  isLoading,
  currentUserId,
  hasMore,
  isFetchingMore,
  onLoadMore,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);

  // Scroll to bottom on new messages (but not when loading older messages)
  useEffect(() => {
    if (!isFetchingMore && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isFetchingMore]);

  // Maintain scroll position when loading older messages
  useEffect(() => {
    if (isFetchingMore && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const currentScrollHeight = container.scrollHeight;
      const scrollTop = container.scrollTop;
      const scrollDifference = currentScrollHeight - previousScrollHeight.current;

      if (scrollDifference > 0) {
        container.scrollTop = scrollTop + scrollDifference;
      }
      previousScrollHeight.current = currentScrollHeight;
    }
  }, [messages, isFetchingMore]);

  // Handle infinite scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasMore || isFetchingMore) return;

    const handleScroll = () => {
      const { scrollTop } = container;
      // Load more when scrolled to top 200px
      if (scrollTop < 200 && onLoadMore) {
        previousScrollHeight.current = container.scrollHeight;
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isFetchingMore, onLoadMore]);

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
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messageGroups.map((group, groupIndex) => (
        <div key={group.date}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-6">
            <div className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-200">
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
                      className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      {/* Message Content */}
                      {message.messageType === 'text' ? (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      ) : message.messageType === 'image' ? (
                        <div className="space-y-2">
                          {message.content && message.content !== '📎' && (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          )}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="grid gap-2" style={{
                              gridTemplateColumns: `repeat(${Math.min(message.attachments.length, 3)}, 1fr)`
                            }}>
                              {message.attachments.map((url, idx) => (
                                <div
                                  key={idx}
                                  className="relative group cursor-pointer rounded-lg overflow-hidden"
                                  onClick={() => window.open(url, '_blank')}
                                >
                                  <Image
                                    src={url}
                                    alt={`Image ${idx + 1}`}
                                    width={200}
                                    height={200}
                                    className="w-full h-auto max-w-xs rounded-lg object-cover hover:opacity-90 transition-opacity"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : message.messageType === 'file' ? (
                        <div className="space-y-2">
                          {message.content && message.content !== '📎' && (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          )}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="space-y-2">
                              {message.attachments.map((url, idx) => {
                                const fileName = url.split('/').pop() || `File ${idx + 1}`;
                                return (
                                  <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors"
                                  >
                                    <Paperclip className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm truncate flex-1">{fileName}</span>
                                    <span className="text-xs opacity-75">Open</span>
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span
                          className={`text-xs ${
                            isOwnMessage ? 'text-white/80' : 'text-gray-500'
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {isOwnMessage && (
                          <div className="flex items-center">
                            {message.readAt ? (
                              <span className="text-xs text-blue-300" title="Read">
                                ✓✓
                              </span>
                            ) : message.deliveredAt ? (
                              <span className="text-xs text-white/70" title="Delivered">
                                ✓
                              </span>
                            ) : (
                              <span className="text-xs text-white/50" title="Sending">
                                ⏱
                              </span>
                            )}
                          </div>
                        )}
                      </div>
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

      {/* Loading more messages indicator */}
      {isFetchingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
        </div>
      )}

      {/* Load more button */}
      {hasMore && !isFetchingMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Load older messages
          </button>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}


