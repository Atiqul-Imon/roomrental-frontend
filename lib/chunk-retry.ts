/**
 * Chunk Loading Retry Utility
 * Handles failed chunk loads with automatic retry mechanism
 */

interface ChunkLoadError extends Error {
  type: 'chunkLoadError';
  chunkName?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Check if error is a chunk loading error
 */
export function isChunkLoadError(error: any): boolean {
  return (
    error?.message?.includes('Failed to load chunk') ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('Loading CSS chunk') ||
    error?.name === 'ChunkLoadError' ||
    error?.type === 'chunkLoadError'
  );
}

/**
 * Extract chunk name from error message
 */
export function extractChunkName(error: Error): string | null {
  const match = error.message.match(/chunks\/([a-f0-9]+)\.js/);
  return match ? match[1] : null;
}

/**
 * Retry chunk loading with exponential backoff
 */
export async function retryChunkLoad(
  chunkName: string,
  retryCount: number = 0
): Promise<void> {
  if (retryCount >= MAX_RETRIES) {
    throw new Error(`Failed to load chunk after ${MAX_RETRIES} retries`);
  }

  const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Force reload the chunk by clearing cache and reloading
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            if (cacheName.includes('next')) {
              caches.delete(cacheName);
            }
          });
        });
      }

      // Retry by reloading the page if it's the last retry
      if (retryCount === MAX_RETRIES - 1) {
        window.location.reload();
      } else {
        resolve();
      }
    }, delay);
  });
}

/**
 * Handle chunk load error with retry
 */
export async function handleChunkLoadError(
  error: Error,
  onRetry?: () => void
): Promise<void> {
  if (!isChunkLoadError(error)) {
    throw error; // Not a chunk error, rethrow
  }

  const chunkName = extractChunkName(error);
  console.warn(`Chunk load error detected: ${chunkName || 'unknown'}`);

  try {
    await retryChunkLoad(chunkName || 'unknown');
    if (onRetry) {
      onRetry();
    }
  } catch (retryError) {
    console.error('Chunk retry failed:', retryError);
    // Final fallback: reload the page
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
}






