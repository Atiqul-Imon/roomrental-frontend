'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClasses = {
  default: 'bg-grey-100 text-grey-700 border-grey-300',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  danger: 'bg-error-50 text-error-700 border-error-200',
  info: 'bg-info-50 text-info-700 border-info-200',
  outline: 'bg-transparent text-grey-700 border-grey-300',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}

