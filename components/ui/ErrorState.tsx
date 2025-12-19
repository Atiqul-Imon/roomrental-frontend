'use client';

import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from './Button';
import { H3, Body } from './Typography';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'error' | 'offline' | 'network';
  className?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function ErrorState({ 
  title, 
  message, 
  onRetry,
  variant = 'error',
  className,
  actionHref,
  actionLabel,
}: ErrorStateProps) {
  const defaultTitles = {
    error: 'Something went wrong',
    offline: 'You\'re offline',
    network: 'Connection error',
  };

  const icons = {
    error: AlertCircle,
    offline: WifiOff,
    network: WifiOff,
  };

  const iconColors = {
    error: 'text-error-500 bg-error-50',
    offline: 'text-warning-500 bg-warning-50',
    network: 'text-error-500 bg-error-50',
  };

  const IconComponent = icons[variant];
  const displayTitle = title || defaultTitles[variant];

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className={cn('mb-6 p-4 rounded-full', iconColors[variant])}>
        <IconComponent className="w-12 h-12" />
      </div>
      <H3 className="mb-3">{displayTitle}</H3>
      <Body className="text-grey-600 mb-6 max-w-md">{message}</Body>
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button 
            variant="primary" 
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
        {actionHref && actionLabel && (
          <Link href={actionHref}>
            <Button variant="outline" className="flex items-center gap-2">
              {actionLabel}
            </Button>
          </Link>
        )}
      </div>
      {variant === 'offline' && (
        <Body className="text-sm text-grey-500 mt-4">
          Check your internet connection and try again
        </Body>
      )}
    </div>
  );
}

