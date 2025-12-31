'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ConversationList } from '@/components/chat/ConversationList';
import { NotificationList } from '@/components/notifications/NotificationList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MessageCircle, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/chat-api';

function ConversationListMobile({ conversationId }: { conversationId?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(1, 50),
    enabled: !!user,
  });

  const handleSelectConversation = (conversation: any) => {
    router.push(`/messages/${conversation.id}`);
  };

  return (
    <div className="md:hidden h-full bg-white flex flex-col">
      <div className="p-4 border-b border-grey-200 bg-white flex-shrink-0">
        <h2 className="text-xl font-bold text-grey-900">Messages</h2>
      </div>
      <ConversationList
        conversations={conversationsData?.conversations || []}
        selectedConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        currentUserId={user?.id || ''}
        isLoading={conversationsLoading}
      />
    </div>
  );
}

function MessagesContent() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  const tab = searchParams.get('tab') || 'chat';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/messages');
    }
  }, [mounted, isAuthenticated, authLoading, router]);

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted || authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <LoadingSpinner />
      </div>
    );
  }

  const handleTabChange = (newTab: 'chat' | 'notifications') => {
    const params = new URLSearchParams();
    params.set('tab', newTab);
    router.push(`/messages?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Tabs */}
      <div className="border-b border-grey-200 bg-white sticky top-16 md:top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex gap-1">
            <button
              onClick={() => handleTabChange('chat')}
              className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                tab === 'chat'
                  ? 'border-accent-500 text-accent-600'
                  : 'border-transparent text-grey-600 hover:text-grey-900'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Chat
            </button>
            <button
              onClick={() => handleTabChange('notifications')}
              className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                tab === 'notifications'
                  ? 'border-accent-500 text-accent-600'
                  : 'border-transparent text-grey-600 hover:text-grey-900'
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] overflow-hidden">
        {tab === 'chat' ? (
          <>
            {/* Desktop: Show ChatWindow with side-by-side layout */}
            <div className="hidden md:block h-full">
              <ChatWindow initialConversationId={conversationId || undefined} />
            </div>
            {/* Mobile: Show only conversation list, navigate to separate page for chat */}
            <ConversationListMobile conversationId={conversationId || undefined} />
          </>
        ) : (
          <NotificationList />
        )}
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-grey-50">
          <LoadingSpinner />
        </div>
      }>
        <MessagesContent />
      </Suspense>
    </>
  );
}

