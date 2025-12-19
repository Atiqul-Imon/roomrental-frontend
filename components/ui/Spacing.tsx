/**
 * Spacing Utilities
 * Phase 1: Foundation - Layout & Spacing
 * 
 * Provides consistent spacing components following the 4px base unit system
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SpacingProps {
  children?: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

// Vertical Spacing
export function VStack({ children, className, size = 'md' }: SpacingProps) {
  const sizeClasses = {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
    '2xl': 'space-y-12',
    '3xl': 'space-y-16',
  };

  return (
    <div className={cn('flex flex-col', sizeClasses[size], className)}>
      {children}
    </div>
  );
}

// Horizontal Spacing
export function HStack({ children, className, size = 'md' }: SpacingProps) {
  const sizeClasses = {
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
    '2xl': 'space-x-12',
    '3xl': 'space-x-16',
  };

  return (
    <div className={cn('flex flex-row items-center', sizeClasses[size], className)}>
      {children}
    </div>
  );
}

// Spacer Component
interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  axis?: 'vertical' | 'horizontal';
}

export function Spacer({ size = 'md', axis = 'vertical' }: SpacerProps) {
  const sizeClasses = {
    xs: axis === 'vertical' ? 'h-1' : 'w-1',
    sm: axis === 'vertical' ? 'h-2' : 'w-2',
    md: axis === 'vertical' ? 'h-4' : 'w-4',
    lg: axis === 'vertical' ? 'h-6' : 'w-6',
    xl: axis === 'vertical' ? 'h-8' : 'w-8',
    '2xl': axis === 'vertical' ? 'h-12' : 'w-12',
    '3xl': axis === 'vertical' ? 'h-16' : 'w-16',
  };

  return <div className={sizeClasses[size]} aria-hidden="true" />;
}

// Padding Component
interface PaddingProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  vertical?: boolean;
  horizontal?: boolean;
}

export function Padding({
  children,
  className,
  size = 'md',
  vertical = true,
  horizontal = true,
}: PaddingProps) {
  const paddingMap = {
    xs: {
      vertical: vertical ? 'py-1' : '',
      horizontal: horizontal ? 'px-1' : '',
    },
    sm: {
      vertical: vertical ? 'py-2' : '',
      horizontal: horizontal ? 'px-2' : '',
    },
    md: {
      vertical: vertical ? 'py-4' : '',
      horizontal: horizontal ? 'px-4' : '',
    },
    lg: {
      vertical: vertical ? 'py-6' : '',
      horizontal: horizontal ? 'px-6' : '',
    },
    xl: {
      vertical: vertical ? 'py-8' : '',
      horizontal: horizontal ? 'px-8' : '',
    },
    '2xl': {
      vertical: vertical ? 'py-12' : '',
      horizontal: horizontal ? 'px-12' : '',
    },
    '3xl': {
      vertical: vertical ? 'py-16' : '',
      horizontal: horizontal ? 'px-16' : '',
    },
  };

  const paddingClasses = [
    paddingMap[size].vertical,
    paddingMap[size].horizontal,
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(paddingClasses, className)}>
      {children}
    </div>
  );
}

// Margin Component
interface MarginProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  vertical?: boolean;
  horizontal?: boolean;
}

export function Margin({
  children,
  className,
  size = 'md',
  vertical = true,
  horizontal = true,
}: MarginProps) {
  const marginMap = {
    xs: {
      vertical: vertical ? 'my-1' : '',
      horizontal: horizontal ? 'mx-1' : '',
    },
    sm: {
      vertical: vertical ? 'my-2' : '',
      horizontal: horizontal ? 'mx-2' : '',
    },
    md: {
      vertical: vertical ? 'my-4' : '',
      horizontal: horizontal ? 'mx-4' : '',
    },
    lg: {
      vertical: vertical ? 'my-6' : '',
      horizontal: horizontal ? 'mx-6' : '',
    },
    xl: {
      vertical: vertical ? 'my-8' : '',
      horizontal: horizontal ? 'mx-8' : '',
    },
    '2xl': {
      vertical: vertical ? 'my-12' : '',
      horizontal: horizontal ? 'mx-12' : '',
    },
    '3xl': {
      vertical: vertical ? 'my-16' : '',
      horizontal: horizontal ? 'mx-16' : '',
    },
  };

  const marginClasses = [
    marginMap[size].vertical,
    marginMap[size].horizontal,
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(marginClasses, className)}>
      {children}
    </div>
  );
}

