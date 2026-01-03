'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { SocketProvider } from '@/lib/socket-context';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ChatProvider } from '@/lib/chat-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutes (increased from 1 minute)
            gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Only refetch if stale (changed from true)
            retry: 1,
            structuralSharing: true, // Enable request deduplication
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <ToastProvider>{children}</ToastProvider>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

