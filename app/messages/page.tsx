'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
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

function MessagesContentWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <LoadingSpinner />
      </div>
    }>
      <MessagesContent />
    </Suspense>
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
    <div className="min-h-screen bg-grey-50 flex flex-col">
      {/* Header - Fixed at top */}
      <Header />
      
      {/* Main Layout with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Dashboard Sidebar */}
        <DashboardSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col overflow-hidden">
          {/* Tabs Bar */}
          <div className="border-b border-grey-200 bg-white flex-shrink-0">
            <div className="px-0">
              <div className="flex gap-1">
                <button
                  onClick={() => handleTabChange('chat')}
                  className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                    tab === 'chat'
                      ? 'border-primary-500 text-primary-600'
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
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-grey-600 hover:text-grey-900'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {tab === 'chat' ? (
              <>
                {/* Desktop: Show ChatWindow constrained to 50% viewport width */}
                <div className="hidden md:block h-full">
                  <div className="w-[50vw] h-full mx-auto">
                    <ChatWindow initialConversationId={conversationId || undefined} />
                  </div>
                </div>
                {/* Mobile: Show only conversation list */}
                <div className="md:hidden h-full overflow-hidden">
                  <ConversationListMobile conversationId={conversationId || undefined} />
                </div>
              </>
            ) : (
              <div className="h-full overflow-auto">
                <NotificationList />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return <MessagesContentWrapper />;
}

