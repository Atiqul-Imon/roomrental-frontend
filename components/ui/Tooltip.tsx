/**
 * Tooltip Component
 * Phase 2: User Experience - Help & Tooltips
 * 
 * Provides contextual help and information
 */

'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BodySmall } from './Typography';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'info' | 'warning' | 'success';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  variant = 'default',
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const variantStyles = {
    default: 'bg-grey-900 text-white',
    info: 'bg-info-500 text-white',
    warning: 'bg-warning-500 text-white',
    success: 'bg-success-500 text-white',
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-grey-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-grey-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-grey-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-grey-900',
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-tooltip px-3 py-2 rounded-lg shadow-large',
            'pointer-events-none animate-scale-in',
            positionClasses[position],
            variantStyles[variant]
          )}
          role="tooltip"
        >
          <BodySmall className="text-white whitespace-nowrap">
            {content}
          </BodySmall>
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
}

// Help Icon Component
interface HelpIconProps {
  content: ReactNode;
  className?: string;
}

export function HelpIcon({ content, className }: HelpIconProps) {
  return (
    <Tooltip content={content} position="top">
      <HelpCircle className={cn('w-4 h-4 text-grey-400 hover:text-grey-600 cursor-help', className)} />
    </Tooltip>
  );
}

// Info Badge Component
interface InfoBadgeProps {
  content: ReactNode;
  variant?: 'info' | 'warning' | 'success';
  className?: string;
}

const infoIcons = {
  info: Info,
  warning: AlertCircle,
  success: CheckCircle,
};

export function InfoBadge({ content, variant = 'info', className }: InfoBadgeProps) {
  const IconComponent = infoIcons[variant];
  const variantStyles = {
    info: 'bg-info-50 text-info-700 border-info-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    success: 'bg-success-50 text-success-700 border-success-200',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-3 rounded-lg border',
        variantStyles[variant],
        className
      )}
    >
      <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <BodySmall>{content}</BodySmall>
    </div>
  );
}
