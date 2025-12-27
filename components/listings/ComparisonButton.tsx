'use client';

import { useComparisonStore } from '@/lib/comparison-store';
import { Button } from '@/components/ui/Button';
import { GitCompare, X } from 'lucide-react';

export function ComparisonButton() {
  const { listings, clearAll } = useComparisonStore();

  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[60]">
      <div className="bg-white rounded-xl shadow-xl border border-grey-200 p-3 md:p-4 flex flex-col sm:flex-row items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
          <span className="font-semibold text-sm md:text-base text-grey-900">
            {listings.length} {listings.length === 1 ? 'listing' : 'listings'} selected
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => {
              // Will be handled by ComparisonModal
              const event = new CustomEvent('openComparison');
              window.dispatchEvent(event);
            }}
            variant="primary"
            size="sm"
          >
            Compare
          </Button>
          <Button
            onClick={clearAll}
            variant="outline"
            size="sm"
            className="px-3"
            aria-label="Clear comparison"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}





