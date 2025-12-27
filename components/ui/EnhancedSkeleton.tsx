/**
 * Enhanced Skeleton Component
 * Phase 3: Advanced Features - Performance & Loading States
 * 
 * Provides better skeleton screens with shimmer effect
 */

'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function EnhancedSkeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'bg-grey-200',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

// Predefined Skeletons
export function ListingCardSkeletonEnhanced() {
  return (
    <div className="bg-white border border-grey-200 rounded-xl overflow-hidden shadow-soft">
      {/* Image */}
      <EnhancedSkeleton variant="rectangular" height={224} className="w-full" />
      
      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <EnhancedSkeleton variant="text" height={24} width="75%" />
        
        {/* Location */}
        <EnhancedSkeleton variant="text" height={16} width="50%" />
        
        {/* Amenities */}
        <div className="flex gap-2">
          <EnhancedSkeleton variant="rectangular" height={24} width={80} />
          <EnhancedSkeleton variant="rectangular" height={24} width={80} />
          <EnhancedSkeleton variant="rectangular" height={24} width={80} />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-grey-200">
          <EnhancedSkeleton variant="text" height={16} width={100} />
          <EnhancedSkeleton variant="text" height={16} width={80} />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <EnhancedSkeleton variant="text" height={16} width={80} />
        <EnhancedSkeleton variant="rectangular" height={44} className="w-full" />
      </div>
      <div className="space-y-2">
        <EnhancedSkeleton variant="text" height={16} width={100} />
        <EnhancedSkeleton variant="rectangular" height={44} className="w-full" />
      </div>
      <div className="space-y-2">
        <EnhancedSkeleton variant="text" height={16} width={120} />
        <EnhancedSkeleton variant="rectangular" height={100} className="w-full" />
      </div>
      <EnhancedSkeleton variant="rectangular" height={44} width={120} />
    </div>
  );
}

export function ProfileSkeletonEnhanced() {
  return (
    <div className="bg-white border border-grey-200 rounded-xl p-6 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <EnhancedSkeleton variant="circular" width={64} height={64} />
        <div className="space-y-2 flex-1">
          <EnhancedSkeleton variant="text" height={20} width="40%" />
          <EnhancedSkeleton variant="text" height={16} width="60%" />
        </div>
      </div>
      <div className="space-y-2">
        <EnhancedSkeleton variant="text" height={16} className="w-full" />
        <EnhancedSkeleton variant="text" height={16} width="85%" />
      </div>
    </div>
  );
}

















