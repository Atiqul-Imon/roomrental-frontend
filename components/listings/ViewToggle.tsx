/**
 * View Toggle Component
 * Phase 3: Advanced Features - Search & Discovery
 * 
 * Provides map/list view toggle
 */

'use client';

import { Map, List } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'map';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
  showLabel?: boolean;
}

export function ViewToggle({ view, onViewChange, className, showLabel = true }: ViewToggleProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && (
        <span className="text-sm text-grey-600 font-medium mr-2">View:</span>
      )}
      <div className="inline-flex rounded-lg border-2 border-grey-200 p-1 bg-white">
        <button
          onClick={() => onViewChange('list')}
          className={cn(
            'px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2',
            view === 'list'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-grey-600 hover:bg-grey-50'
          )}
          aria-label="List view"
        >
          <List className="w-4 h-4" />
          {showLabel && <span className="text-sm font-medium">List</span>}
        </button>
        <button
          onClick={() => onViewChange('map')}
          className={cn(
            'px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2',
            view === 'map'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-grey-600 hover:bg-grey-50'
          )}
          aria-label="Map view"
        >
          <Map className="w-4 h-4" />
          {showLabel && <span className="text-sm font-medium">Map</span>}
        </button>
      </div>
    </div>
  );
}






