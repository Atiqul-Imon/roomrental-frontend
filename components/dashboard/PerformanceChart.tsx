'use client';

import { useMemo } from 'react';

interface Listing {
  id: string;
  title: string;
  views?: number;
  viewCount?: number;
  price: number;
  status: string;
}

interface PerformanceChartProps {
  listings: Listing[];
  maxItems?: number;
}

export function PerformanceChart({ listings, maxItems = 5 }: PerformanceChartProps) {
  const topPerformers = useMemo(() => {
    return listings
      .filter(l => l.status === 'available' || l.status === 'active')
      .map(l => ({
        id: l.id,
        title: l.title,
        views: l.views || l.viewCount || 0,
        price: l.price,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, maxItems);
  }, [listings, maxItems]);

  const maxViews = topPerformers.length > 0 
    ? Math.max(...topPerformers.map(l => l.views))
    : 1;

  if (topPerformers.length === 0) {
    return (
      <div className="text-center py-8 text-grey-500">
        <p>No active listings to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topPerformers.map((listing, index) => {
        const percentage = maxViews > 0 ? (listing.views / maxViews) * 100 : 0;
        return (
          <div key={listing.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-grey-900 truncate">
                  {index + 1}. {listing.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-grey-600">{listing.views} views</span>
                  <span className="text-xs text-grey-400">•</span>
                  <span className="text-xs text-grey-600">${listing.price.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-grey-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}














