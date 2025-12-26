/**
 * Container Component
 * Phase 1: Foundation - Layout & Spacing
 * 
 * Provides consistent container widths and padding
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[1400px]',
  full: 'max-w-full',
};

const paddingClasses = {
  none: 'px-0',
  sm: 'px-4',
  md: 'px-4 md:px-6',
  lg: 'px-4 md:px-6 lg:px-8',
  xl: 'px-4 md:px-6 lg:px-8 xl:px-12',
};

export function Container({
  children,
  className,
  size = 'xl',
  padding = 'md',
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// Section Component for consistent section spacing
interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: 'default' | 'muted' | 'primary' | 'secondary';
}

const spacingClasses = {
  none: 'py-0',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-24',
  xl: 'py-24 md:py-32',
  '2xl': 'py-32 md:py-40',
};

const backgroundClasses = {
  default: 'bg-white',
  muted: 'bg-grey-50',
  primary: 'bg-primary-50',
  secondary: 'bg-secondary-50',
};

export function Section({
  children,
  className,
  spacing = 'md',
  background = 'default',
}: SectionProps) {
  return (
    <section
      className={cn(
        spacingClasses[spacing],
        backgroundClasses[background],
        className
      )}
    >
      {children}
    </section>
  );
}













