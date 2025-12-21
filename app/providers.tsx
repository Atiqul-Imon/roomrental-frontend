'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ChatProvider } from '@/lib/chat-context';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { queryConfig } from '@/lib/query-config';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default: Use listings config (most common)
            ...queryConfig.listings,
            retry: 1,
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
        <ChatProvider>
          <ToastProvider>{children}</ToastProvider>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

