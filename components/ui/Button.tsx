'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  // Phase 1: Enhanced button styles with design system
  // Phase 4: Accessibility - Enhanced focus indicators
  const baseStyles = 'inline-flex items-center justify-center font-ui font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed btn-hover';
  
  const variants = {
    primary: 'bg-gradient-primary text-white hover:bg-gradient-primary-hover focus:ring-accent-500 shadow-medium hover:shadow-hover-medium active:shadow-soft color-transition',
    secondary: 'bg-accent-50 text-accent-600 border-2 border-accent-200 hover:bg-accent-100 hover:border-accent-300 focus:ring-accent-500 color-transition',
    ghost: 'bg-transparent hover:bg-accent-50 text-grey-700 hover:text-accent-700 focus:ring-accent-300 color-transition',
    outline: 'border-2 border-refined border-accent-200 text-grey-700 hover:bg-accent-50 hover:border-accent-400 hover:text-accent-600 focus:ring-accent-500 color-transition',
    danger: 'bg-error-50 text-error-600 border-2 border-error-200 hover:bg-error-100 hover:border-error-300 focus:ring-error-500 color-transition',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-9 min-h-[44px] md:min-h-0',
    md: 'px-4 py-2 text-base h-11 min-h-[44px]',
    lg: 'px-6 py-3 text-lg h-12 min-h-[44px]',
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  );
}

