/**
 * Typography Component System
 * Phase 1: Foundation - Design System
 * 
 * Provides consistent typography components following the design system
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

// Heading Components
export function H1({ children, className, as: Component = 'h1' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-heading text-5xl md:text-6xl font-bold leading-tight tracking-tight text-grey-900',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function H2({ children, className, as: Component = 'h2' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-heading text-4xl md:text-5xl font-bold leading-tight tracking-tight text-grey-900',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function H3({ children, className, as: Component = 'h3' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-grey-900',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function H4({ children, className, as: Component = 'h4' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-heading text-2xl md:text-3xl font-semibold leading-snug tracking-tight text-grey-900',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function H5({ children, className, as: Component = 'h5' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-heading text-xl md:text-2xl font-semibold leading-snug text-grey-900',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function H6({ children, className, as: Component = 'h6' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-heading text-lg md:text-xl font-semibold leading-snug text-grey-900',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Body Text Components
export function Body({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-body text-base leading-relaxed text-grey-700',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function BodyLarge({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-body text-lg leading-relaxed text-grey-700',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function BodySmall({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-body text-sm leading-relaxed text-grey-600',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Specialized Text Components
export function Lead({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-body text-xl md:text-2xl leading-relaxed text-grey-700 font-light',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Caption({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component
      className={cn(
        'font-ui text-xs leading-tight text-grey-500 uppercase tracking-wider',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Label({ children, className, ...props }: { children: ReactNode; className?: string } & React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'font-ui text-sm font-medium leading-tight text-grey-700',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

// Link Components
export function Link({ children, className, href, ...props }: TypographyProps & { href?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'font-body text-base text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

// Utility Classes Export
export const typography = {
  h1: 'font-heading text-5xl md:text-6xl font-bold leading-tight tracking-tight text-grey-900',
  h2: 'font-heading text-4xl md:text-5xl font-bold leading-tight tracking-tight text-grey-900',
  h3: 'font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-grey-900',
  h4: 'font-heading text-2xl md:text-3xl font-semibold leading-snug tracking-tight text-grey-900',
  h5: 'font-heading text-xl md:text-2xl font-semibold leading-snug text-grey-900',
  h6: 'font-heading text-lg md:text-xl font-semibold leading-snug text-grey-900',
  body: 'font-body text-base leading-relaxed text-grey-700',
  bodyLarge: 'font-body text-lg leading-relaxed text-grey-700',
  bodySmall: 'font-body text-sm leading-relaxed text-grey-600',
  lead: 'font-body text-xl md:text-2xl leading-relaxed text-grey-700 font-light',
  caption: 'font-ui text-xs leading-tight text-grey-500 uppercase tracking-wider',
  label: 'font-ui text-sm font-medium leading-tight text-grey-700',
};

