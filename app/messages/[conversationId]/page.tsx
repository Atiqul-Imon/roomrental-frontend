'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { ChatSidebarContent } from '@/components/chat/ChatSidebarContent';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

function ChatContent() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/messages');
    }
  }, [mounted, isAuthenticated, authLoading, router]);

  if (!mounted || authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="h-[calc(100vh-4rem)] bg-white overflow-hidden md:hidden">
      {/* Mobile Header with Back Button */}
      <div className="bg-gradient-primary text-white px-4 py-3 flex items-center gap-3 border-b border-white/20 flex-shrink-0">
        <button
          onClick={() => router.push('/messages')}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-base">Messages</h2>
      </div>
      <ChatSidebarContent initialConversationId={conversationId} />
    </main>
  );
}

export default function ConversationPage() {
  return (
    <>
      <Header />
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



