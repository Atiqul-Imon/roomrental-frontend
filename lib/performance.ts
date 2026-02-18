/**
 * Performance Monitoring Utilities
 * 
 * Provides comprehensive performance tracking for:
 * - Page load times
 * - API call durations
 * - Slow operations
 * - Web Vitals metrics
 */

import { logger } from './logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface PageLoadMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  timeToInteractive?: number;
  totalPageSize?: number;
}

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  SLOW_API_CALL: 1000, // 1 second
  SLOW_OPERATION: 500, // 500ms
  SLOW_PAGE_LOAD: 3000, // 3 seconds
};

/**
 * Request Animation Frame throttle
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T>;

  return function throttled(...args: Parameters<T>) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func(...lastArgs);
        rafId = null;
      });
    }
  };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Lazy load images
 */
export function lazyLoadImage(img: HTMLImageElement, src: string) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: '50px' }
  );

  observer.observe(img);
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Measure performance of a function
 */
export function measurePerformance(name: string, fn: () => void): void;
export function measurePerformance<T>(name: string, fn: () => T): T;
export function measurePerformance<T>(name: string, fn: () => T): T {
  if (typeof performance !== 'undefined' && performance.mark) {
    const startMark = `${name}-start-${Date.now()}`;
    const endMark = `${name}-end-${Date.now()}`;
    
    performance.mark(startMark);
    const result = fn();
    performance.mark(endMark);
    
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      
      if (measure) {
        const duration = measure.duration;
        logPerformanceMetric({
          name,
          value: duration,
          unit: 'ms',
          timestamp: new Date().toISOString(),
        });

        // Log slow operations
        if (duration > THRESHOLDS.SLOW_OPERATION) {
          logger.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
        }
      }
    } catch (error) {
      // Ignore measurement errors
    }
    
    return result;
  } else {
    return fn();
  }
}

/**
 * Measure async performance
 */
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    logPerformanceMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      context,
    });

    // Log slow operations
    if (duration > THRESHOLDS.SLOW_OPERATION) {
      logger.warn(`⚠️ Slow async operation: ${name} took ${duration.toFixed(2)}ms`, context);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logPerformanceMetric({
      name: `${name}-error`,
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      context: { ...context, error: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}

/**
 * Track API call performance
 */
export function trackApiCall(
  method: string,
  url: string,
  duration: number,
  statusCode?: number
): void {
  const metric: PerformanceMetric = {
    name: 'api_call',
    value: duration,
    unit: 'ms',
    timestamp: new Date().toISOString(),
    context: {
      method,
      url,
      statusCode,
    },
  };

  logPerformanceMetric(metric);

  // Log slow API calls
  if (duration > THRESHOLDS.SLOW_API_CALL) {
    logger.warn(`⚠️ Slow API call: ${method} ${url} took ${duration.toFixed(2)}ms`, {
      statusCode,
    });
  }
}

/**
 * Get page load metrics
 */
export function getPageLoadMetrics(): PageLoadMetrics | null {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return null;
  }

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find((entry) => entry.name === 'first-contentful-paint');
    const fp = paint.find((entry) => entry.name === 'first-paint');

    // Calculate Time to Interactive (TTI) approximation
    // TTI is when the page is fully interactive (all scripts loaded and executed)
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
    const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;

    // Get resource sizes
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const totalPageSize = resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);

    const metrics: PageLoadMetrics = {
      domContentLoaded,
      loadComplete,
      firstPaint: fp ? fp.startTime : undefined,
      firstContentfulPaint: fcp ? fcp.startTime : undefined,
      timeToInteractive: navigation.domInteractive
        ? navigation.domInteractive - navigation.fetchStart
        : undefined,
      totalPageSize,
    };

    // Log page load metrics
    logPageLoadMetrics(metrics);

    return metrics;
  } catch (error) {
    logger.error('Error getting page load metrics:', error);
    return null;
  }
}

/**
 * Log performance metric
 */
function logPerformanceMetric(metric: PerformanceMetric): void {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`📊 Performance: ${metric.name} = ${metric.value}${metric.unit}`, metric.context);
  }

  // In production, you could send to analytics service
  // Example: sendToAnalytics(metric);
}

/**
 * Log page load metrics
 */
function logPageLoadMetrics(metrics: PageLoadMetrics): void {
  if (process.env.NODE_ENV === 'development') {
    logger.log('📊 Page Load Metrics:', {
      domContentLoaded: `${metrics.domContentLoaded.toFixed(2)}ms`,
      loadComplete: `${metrics.loadComplete.toFixed(2)}ms`,
      firstPaint: metrics.firstPaint ? `${metrics.firstPaint.toFixed(2)}ms` : 'N/A',
      firstContentfulPaint: metrics.firstContentfulPaint
        ? `${metrics.firstContentfulPaint.toFixed(2)}ms`
        : 'N/A',
      timeToInteractive: metrics.timeToInteractive
        ? `${metrics.timeToInteractive.toFixed(2)}ms`
        : 'N/A',
      totalPageSize: metrics.totalPageSize
        ? `${(metrics.totalPageSize / 1024).toFixed(2)}KB`
        : 'N/A',
    });
  }

  // Log slow page loads
  if (metrics.loadComplete > THRESHOLDS.SLOW_PAGE_LOAD) {
    logger.warn(`⚠️ Slow page load detected: ${metrics.loadComplete.toFixed(2)}ms`);
  }
}

/**
 * Initialize performance monitoring
 * Call this once when the app loads
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Track page load metrics when page is fully loaded
  if (document.readyState === 'complete') {
    getPageLoadMetrics();
  } else {
    window.addEventListener('load', () => {
      // Small delay to ensure all metrics are available
      setTimeout(() => {
        getPageLoadMetrics();
      }, 100);
    });
  }

  // Monitor long tasks (blocking operations)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            // Log tasks longer than 50ms (can cause jank)
            logger.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`, {
              name: entry.name,
              startTime: entry.startTime,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      // Long task observer not supported
    }
  }
}

