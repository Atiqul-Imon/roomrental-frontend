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
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-xl shadow-xl border border-grey-200 p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary-500" />
          <span className="font-semibold text-grey-900">
            {listings.length} {listings.length === 1 ? 'listing' : 'listings'} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
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



