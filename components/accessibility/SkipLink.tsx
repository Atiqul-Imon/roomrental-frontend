/**
 * Skip Link Component
 * Phase 4: Accessibility - Keyboard Navigation
 * 
 * Provides skip navigation for keyboard users
 */

'use client';

import Link from 'next/link';

export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-large focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      Skip to main content
    </Link>
  );
}




























