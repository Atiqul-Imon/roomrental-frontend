'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayChildren(children);
      return;
    }

    // Fade out
    setIsVisible(false);
    
    // After fade out, update content and fade in
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div
      className={cn(
        'transition-opacity duration-150 ease-out',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {displayChildren}
    </div>
  );
}












