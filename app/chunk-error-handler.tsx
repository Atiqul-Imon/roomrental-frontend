'use client';

import { useEffect } from 'react';
import { isChunkLoadError, handleChunkLoadError } from '@/lib/chunk-retry';

/**
 * Global chunk loading error handler
 * Catches chunk loading errors that occur outside of React error boundaries
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error)) {
        event.preventDefault(); // Prevent default error handling
        console.warn('Chunk loading error detected, attempting retry...');
        handleChunkLoadError(event.error);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        event.preventDefault(); // Prevent default error handling
        console.warn('Chunk loading promise rejection detected, attempting retry...');
        handleChunkLoadError(event.reason);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}









