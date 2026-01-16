'use client';

// Force dynamic rendering - this page should never be statically generated
export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // Use edge runtime to prevent static generation

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ChatPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Get conversationId from URL if needed
    const params = new URLSearchParams(window.location.search);
    const conversationId = params.get('conversationId');
    
    // Redirect to /messages page
    if (conversationId) {
      router.replace(`/messages?conversationId=${conversationId}&tab=chat`);
    } else {
      router.replace('/messages?tab=chat');
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50">
      <LoadingSpinner />
    </div>
  );
}

