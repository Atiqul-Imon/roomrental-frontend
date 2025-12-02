'use client';

import { memo, ReactNode } from 'react';

/**
 * Higher-order component for memoizing expensive components
 */
export function withMemo<T extends object>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return memo(Component, areEqual);
}

/**
 * Memo wrapper for functional components
 */
export const Memoized = memo;

