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
    <div className={cn('flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4 text-center fade-in-up-delayed', className)}>
      <div className={cn('mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl shadow-soft', iconColors[variant])}>
        <IconComponent className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
      </div>
      <H3 className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl leading-tight">{displayTitle}</H3>
      <Body className="text-grey-600 mb-6 sm:mb-8 max-w-md text-sm sm:text-base leading-relaxed">{message}</Body>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {onRetry && (
          <Button 
            variant="primary" 
            onClick={onRetry}
            className="flex items-center gap-2 min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
        {actionHref && actionLabel && (
          <Link href={actionHref}>
            <Button variant="outline" className="flex items-center gap-2 min-h-[44px]">
              {actionLabel}
            </Button>
          </Link>
        )}
      </div>
      {variant === 'offline' && (
        <Body className="text-sm text-grey-500 mt-4 sm:mt-6 leading-relaxed">
          Check your internet connection and try again
        </Body>
      )}
    </div>
  );
}

