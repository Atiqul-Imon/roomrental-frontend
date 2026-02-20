'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  measureAsyncPerformance,
  trackApiCall,
  getPageLoadMetrics,
  PerformanceMetric,
} from '@/lib/performance';
import { logger } from '@/lib/logger';

/**
 * React Hook for Performance Monitoring
 * 
 * Tracks:
 * - Page navigation times
 * - Component render times
 * - API call durations
 * - Custom performance metrics
 */
export function usePerformance() {
  const pathname = usePathname();
  const pageStartTime = useRef<number>(Date.now());
  const previousPathname = useRef<string | null>(null);

  // Track page navigation
  useEffect(() => {
    if (previousPathname.current !== null && previousPathname.current !== pathname) {
      const navigationTime = Date.now() - pageStartTime.current;
      
      if (navigationTime > 0) {
        logger.debug(`📊 Page navigation: ${previousPathname.current} → ${pathname} (${navigationTime}ms)`);
      }
    }

    previousPathname.current = pathname;
    pageStartTime.current = Date.now();

    // Track page load metrics after navigation
    const timer = setTimeout(() => {
      getPageLoadMetrics();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  /**
   * Measure async operation performance
   */
  const measureAsync = useCallback(
    <T,>(
      name: string,
      fn: () => Promise<T>,
      context?: Record<string, unknown>
    ): Promise<T> => {
      return measureAsyncPerformance(name, fn, context);
    },
    []
  );

  /**
   * Track API call
   */
  const trackApi = useCallback(
    (method: string, url: string, duration: number, statusCode?: number) => {
      trackApiCall(method, url, duration, statusCode);
    },
    []
  );

  /**
   * Get current page metrics
   */
  const getMetrics = useCallback(() => {
    return getPageLoadMetrics();
  }, []);

  return {
    measureAsync,
    trackApi,
    getMetrics,
  };
}

/**
 * Hook to measure component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      if (renderTime > 16) {
        // Log renders longer than one frame (16ms at 60fps)
        logger.debug(`📊 ${componentName} render: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
      }
    };
  });
}


