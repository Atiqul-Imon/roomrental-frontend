/**
 * Live Region Component
 * Phase 4: Accessibility - Screen Reader Support
 * 
 * Provides announcements for screen readers
 */

'use client';

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearOnUnmount?: boolean;
}

export function LiveRegion({ message, priority = 'polite', clearOnUnmount = true }: LiveRegionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && message) {
      // Clear previous message
      ref.current.textContent = '';
      // Small delay to ensure screen reader picks up the change
      setTimeout(() => {
        if (ref.current) {
          ref.current.textContent = message;
        }
      }, 100);
    }

    if (clearOnUnmount) {
      return () => {
        if (ref.current) {
          ref.current.textContent = '';
        }
      };
    }
  }, [message, clearOnUnmount]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

// Hook for easy live region announcements
export function useLiveRegion() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = '';
      setTimeout(() => {
        if (liveRegion) {
          liveRegion.textContent = message;
          liveRegion.setAttribute('aria-live', priority);
        }
      }, 100);
    }
  };

  return { announce };
}




























