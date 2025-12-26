/**
 * Accessible Button Component
 * Phase 4: Accessibility - ARIA & Semantic HTML
 * 
 * Provides accessible button with proper ARIA attributes
 */

'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaControls,
  className,
  ...props
}: AccessibleButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      isLoading={isLoading}
      className={className}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="sr-only">Loading</span>
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}













