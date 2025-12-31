'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { NotificationList } from '@/components/notifications/NotificationList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MessageCircle, Bell } from 'lucide-react';

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
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    if (newTab === 'chat' && conversationId) {
      params.set('conversationId', conversationId);
    } else if (newTab === 'notifications') {
      params.delete('conversationId');
    }
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
          <ChatWindow initialConversationId={conversationId || undefined} />
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

