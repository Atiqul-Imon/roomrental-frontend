'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';

/**
 * Web Vitals Tracking Component
 * Tracks Core Web Vitals and sends them to analytics
 * 
 * Core Web Vitals:
 * - CLS (Cumulative Layout Shift): < 0.1 (good)
 * - FID (First Input Delay): < 100ms (good)
 * - LCP (Largest Contentful Paint): < 2.5s (good)
 * 
 * Other Important Metrics:
 * - FCP (First Contentful Paint): < 1.8s (good)
 * - TTFB (Time to First Byte): < 600ms (good)
 * - INP (Interaction to Next Paint): < 200ms (good)
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      });
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating,
        });
      }

      // Custom analytics endpoint (if you have one)
      // fetch('/api/analytics/web-vitals', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: metric.name,
      //     value: metric.value,
      //     rating: metric.rating,
      //     delta: metric.delta,
      //     id: metric.id,
      //     url: window.location.href,
      //     timestamp: new Date().toISOString(),
      //   }),
      // }).catch(console.error);
    }
  });

  // Performance observer for additional metrics
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Track long tasks (> 50ms)
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('[Performance] Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });

      return () => {
        longTaskObserver.disconnect();
      };
    } catch (error) {
      // Long task observer not supported
      console.debug('Long task observer not supported');
    }
  }, []);

  return null;
}
