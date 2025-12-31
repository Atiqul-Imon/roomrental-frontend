'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function ChatRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');

  useEffect(() => {
    // Redirect to /messages page
    const params = new URLSearchParams();
    if (conversationId) {
      params.set('conversationId', conversationId);
    }
    params.set('tab', 'chat');
    router.replace(`/messages?${params.toString()}`);
  }, [router, conversationId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50">
      <LoadingSpinner />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <LoadingSpinner />
      </div>
    }>
      <ChatRedirect />
    </Suspense>
  );
}

