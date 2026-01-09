/**
 * Micro-Interactions Component Library
 * Phase 3: Advanced Features - Micro-interactions & Animations
 * 
 * Provides reusable micro-interaction components
 */

'use client';

import { ReactNode, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Ripple Effect Component
interface RippleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function RippleButton({ children, onClick, className, disabled }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn('relative overflow-hidden', className)}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
        />
      ))}
    </button>
  );
}

// Success Animation Component
interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({ show, message, onComplete }: SuccessAnimationProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onComplete}
    >
      <div
        className="bg-white rounded-2xl p-8 shadow-2xl text-center animate-scale-in max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <CheckCircle className="w-16 h-16 text-success-500 animate-scale-in" />
            <div className="absolute inset-0 bg-success-500/20 rounded-full animate-ping" />
          </div>
        </div>
        {message && (
          <p className="text-lg font-semibold text-grey-900">{message}</p>
        )}
      </div>
    </div>
  );
}

// Loading Button Component
interface LoadingButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  success?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function LoadingButton({
  children,
  isLoading,
  success,
  onClick,
  className,
  disabled,
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center',
        'transition-all duration-300',
        isLoading && 'cursor-wait',
        success && 'bg-success-500',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span>Loading...</span>
        </>
      ) : success ? (
        <>
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Success!</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Hover Lift Component
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  intensity?: 'sm' | 'md' | 'lg';
}

export function HoverLift({ children, className, intensity = 'md' }: HoverLiftProps) {
  const liftClasses = {
    sm: 'hover:-translate-y-1',
    md: 'hover:-translate-y-2',
    lg: 'hover:-translate-y-3',
  };

  return (
    <div
      className={cn(
        'transition-transform duration-300 ease-out',
        liftClasses[intensity],
        className
      )}
    >
      {children}
    </div>
  );
}

// Pulse Animation Component
interface PulseProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
}

export function Pulse({ children, className, active = true }: PulseProps) {
  return (
    <div
      className={cn(
        active && 'animate-pulse',
        className
      )}
    >
      {children}
    </div>
  );
}

// Shimmer Loading Component
export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-grey-200 rounded',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent',
        'before:animate-shimmer',
        className
      )}
    />
  );
}

































