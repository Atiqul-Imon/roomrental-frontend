'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { NotificationPermissionPrompt } from '@/components/chat/NotificationPermissionPrompt';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function ChatContent() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/chat');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-50">
      <ChatWindow initialConversationId={conversationId || undefined} />
    </main>
  );
}

export default function ChatPage() {
  return (
    <>
      <Header />
      <NotificationPermissionPrompt />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-grey-50">
          <LoadingSpinner />
        </div>
      }>
        <ChatContent />
      </Suspense>
    </>
  );
}

