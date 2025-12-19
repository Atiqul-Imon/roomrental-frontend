'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { BodySmall } from './Typography';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  variant?: 'default' | 'dots' | 'pulse';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text,
  variant = 'default',
}: LoadingSpinnerProps) {
  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-primary-500 rounded-full animate-pulse',
                size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        {text && <BodySmall className="text-grey-600">{text}</BodySmall>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div
          className={cn(
            'bg-primary-500 rounded-full animate-pulse',
            sizeClasses[size],
            className
          )}
        />
        {text && <BodySmall className="text-grey-600">{text}</BodySmall>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={cn(
          'animate-spin text-primary-500',
          sizeClasses[size],
          className
        )}
      />
      {text && <BodySmall className="text-grey-600">{text}</BodySmall>}
    </div>
  );
}

