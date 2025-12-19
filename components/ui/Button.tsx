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
  const baseStyles = 'inline-flex items-center justify-center font-ui font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-primary text-white hover:bg-gradient-primary-hover focus:ring-primary-500 shadow-medium hover:shadow-large active:shadow-soft',
    secondary: 'bg-primary-50 text-primary-600 border-2 border-primary-200 hover:bg-primary-100 hover:border-primary-300 focus:ring-primary-500',
    ghost: 'bg-transparent hover:bg-grey-100 text-grey-700 hover:text-grey-900 focus:ring-grey-300',
    outline: 'border-2 border-grey-300 text-grey-700 hover:bg-grey-50 hover:border-primary-400 hover:text-primary-600 focus:ring-primary-500',
    danger: 'bg-error-50 text-error-600 border-2 border-error-200 hover:bg-error-100 hover:border-error-300 focus:ring-error-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-9',
    md: 'px-4 py-2 text-base h-11',
    lg: 'px-6 py-3 text-lg h-12',
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

