'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  actionHref,
  actionLabel,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 p-4 bg-red-50 rounded-full">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-grey-900 mb-2">{title}</h3>
      <p className="text-grey-600 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </Button>
      )}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="px-6 py-3 btn-gradient text-white rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-medium inline-flex items-center gap-2"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

