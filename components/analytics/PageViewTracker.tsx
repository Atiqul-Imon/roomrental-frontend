'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Internal component that uses useSearchParams - must be wrapped in Suspense
 */
function PageViewTrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Build full URL with search params
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    
    // Track page view
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Tracks page views for client-side navigation in Next.js App Router
 * This is necessary because Next.js doesn't automatically track route changes
 */
export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerContent />
    </Suspense>
  );
}

