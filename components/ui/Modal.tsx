'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocusTrap, useEscapeKey } from '@/components/accessibility/KeyboardNavigation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  ariaLabel,
  ariaDescribedBy,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useFocusTrap(isOpen);

  useEscapeKey(onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus modal when it opens
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={cn(
        'fixed z-[100] flex justify-center',
        // Mobile: Start below header (h-14 = 3.5rem), Desktop: Full viewport
        'top-14 md:top-0',
        'left-0 right-0 bottom-0',
        // Mobile: Align to bottom (bottom sheet), Desktop: Center vertically
        'items-end md:items-center',
        // Padding: None on mobile, padding on desktop
        'p-0 md:p-2 lg:p-4'
      )}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      onAnimationEnd={() => {
        if (!isOpen) setIsAnimating(false);
      }}
    >
      {/* Backdrop - Full viewport coverage */}
      <div
        className={cn(
          "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content - Bottom Sheet on Mobile, Centered on Desktop */}
      <div
        ref={(node) => {
          if (node) {
            containerRef.current = node;
            modalRef.current = node;
          }
        }}
        className={cn(
          'relative w-full bg-white shadow-2xl border border-grey-200',
          'flex flex-col',
          // Mobile: Bottom sheet with rounded top corners
          'rounded-t-2xl md:rounded-xl',
          // Mobile: Full width, Desktop: Sized
          'md:w-auto',
          // Mobile: Slide up animation, Desktop: Scale animation
          isOpen 
            ? 'modal-slide-up md:modal-scale-in' 
            : 'translate-y-full md:scale-95 opacity-0',
          sizeClasses[size],
          // Height constraints
          // Mobile: Available space below header, Desktop: 90vh max
          'max-h-[calc(100vh-3.5rem-env(safe-area-inset-bottom,0px))]',
          'md:max-h-[90vh]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle (Mobile Only) */}
        <div className="md:hidden flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-12 h-1 bg-grey-300 rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-grey-200 flex-shrink-0">
            {title && (
              <h2 id="modal-title" className="text-lg md:text-xl font-bold text-grey-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-grey-400 hover:text-grey-600 hover:bg-grey-100 rounded-lg transition-colors z-20 touch-target focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:outline-none"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body - Scrollable */}
        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
