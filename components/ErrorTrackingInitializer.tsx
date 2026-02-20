'use client';

import { useEffect } from 'react';
import { initializeErrorTracking } from '@/lib/error-handler';

/**
 * Client component to initialize error tracking
 * Must be a client component because it uses window
 */
export function ErrorTrackingInitializer() {
  useEffect(() => {
    initializeErrorTracking();
  }, []);

  return null;
}


