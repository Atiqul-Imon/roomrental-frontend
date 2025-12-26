/**
 * Bottom Sheet Component
 * Phase 3: Advanced Features - Mobile Experience
 * 
 * Provides mobile-friendly bottom sheet for filters and modals
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  maxHeight?: 'sm' | 'md' | 'lg' | 'full';
}

const maxHeightClasses = {
  sm: 'max-h-[50vh]',
  md: 'max-h-[70vh]',
  lg: 'max-h-[85vh]',
  full: 'max-h-[95vh]',
};

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxHeight = 'md',
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-modal',
          'bg-white rounded-t-3xl shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          maxHeightClasses[maxHeight],
          className
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-grey-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-grey-200">
            <h2 className="text-xl font-semibold text-grey-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-grey-400 hover:text-grey-600 transition-colors rounded-full hover:bg-grey-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );

  if (typeof window !== 'undefined') {
    return createPortal(content, document.body);
  }

  return null;
}













