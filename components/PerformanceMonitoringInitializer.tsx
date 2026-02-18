'use client';

import { useEffect } from 'react';
import { initializePerformanceMonitoring } from '@/lib/performance';

/**
 * Client component to initialize performance monitoring
 * Must be a client component because it uses window and performance APIs
 */
export function PerformanceMonitoringInitializer() {
  useEffect(() => {
    initializePerformanceMonitoring();
  }, []);

  return null;
}

