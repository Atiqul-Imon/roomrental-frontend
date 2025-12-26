'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Listing {
  id: string;
  status: string;
  price: number;
  views?: number;
  viewCount?: number;
  createdAt: string;
}

interface LandlordAnalyticsProps {
  listings: Listing[];
}

export function LandlordAnalytics({ listings }: LandlordAnalyticsProps) {
  const analytics = useMemo(() => {
    const activeListings = listings.filter(l => 
      l.status === 'available' || l.status === 'active'
    );
    const rentedListings = listings.filter(l => l.status === 'rented');
    const totalViews = listings.reduce((sum, l) => sum + (l.views || l.viewCount || 0), 0);
    const totalRevenue = rentedListings.reduce((sum, l) => sum + (l.price || 0), 0);
    const avgViewsPerListing = activeListings.length > 0 
      ? Math.round(totalViews / activeListings.length) 
      : 0;
    const conversionRate = activeListings.length > 0
      ? ((rentedListings.length / listings.length) * 100).toFixed(1)
      : '0.0';
    const avgPrice = listings.length > 0
      ? Math.round(listings.reduce((sum, l) => sum + (l.price || 0), 0) / listings.length)
      : 0;

    // Calculate trends (comparing recent vs older listings)
    const recentListings = listings
      .filter(l => {
        if (!l.createdAt) return false;
        const created = new Date(l.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return created >= thirtyDaysAgo;
      });
    
    const olderListings = listings.filter(l => {
      if (!l.createdAt) return false;
      const created = new Date(l.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return created < thirtyDaysAgo;
    });

    const recentViews = recentListings.reduce((sum, l) => sum + (l.views || l.viewCount || 0), 0);
    const olderViews = olderListings.reduce((sum, l) => sum + (l.views || l.viewCount || 0), 0);
    const recentAvgViews = recentListings.length > 0 ? recentViews / recentListings.length : 0;
    const olderAvgViews = olderListings.length > 0 ? olderViews / olderListings.length : 0;
    
    const viewsTrend: 'up' | 'down' | 'neutral' = recentAvgViews > olderAvgViews ? 'up' : 
                      recentAvgViews < olderAvgViews ? 'down' : 'neutral';
    const viewsChange = olderAvgViews > 0 
      ? Math.abs(((recentAvgViews - olderAvgViews) / olderAvgViews) * 100).toFixed(1)
      : '0';

    return {
      totalListings: listings.length,
      activeListings: activeListings.length,
      rentedListings: rentedListings.length,
      totalViews,
      totalRevenue,
      avgViewsPerListing,
      conversionRate,
      avgPrice,
      viewsTrend,
      viewsChange,
    };
  }, [listings]);

  const TrendIndicator = ({ trend, change }: { trend: 'up' | 'down' | 'neutral'; change: string }) => {
    if (trend === 'neutral') {
      return (
        <div className="flex items-center gap-1 text-grey-500">
          <Minus className="w-4 h-4" />
          <span className="text-xs">No change</span>
        </div>
      );
    }
    const isPositive = trend === 'up';
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span className="text-xs font-semibold">{change}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Performance Metrics */}
      <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-grey-600 font-medium mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-grey-900">{analytics.conversionRate}%</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <p className="text-xs text-grey-500">
          {analytics.rentedListings} of {analytics.totalListings} listings rented
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-grey-600 font-medium mb-1">Avg Views/Listing</p>
            <p className="text-2xl font-bold text-grey-900">{analytics.avgViewsPerListing}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <TrendIndicator trend={analytics.viewsTrend} change={analytics.viewsChange} />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-grey-600 font-medium mb-1">Average Price</p>
            <p className="text-2xl font-bold text-grey-900">${analytics.avgPrice.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-amber-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <p className="text-xs text-grey-500">Per month across all listings</p>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200 md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-semibold text-grey-900 mb-4">Listing Status Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700 mb-1">{analytics.activeListings}</p>
            <p className="text-sm text-grey-600">Active</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700 mb-1">{analytics.rentedListings}</p>
            <p className="text-sm text-grey-600">Rented</p>
          </div>
          <div className="text-center p-4 bg-grey-50 rounded-lg">
            <p className="text-2xl font-bold text-grey-700 mb-1">
              {analytics.totalListings - analytics.activeListings - analytics.rentedListings}
            </p>
            <p className="text-sm text-grey-600">Other</p>
          </div>
        </div>
      </div>
    </div>
  );
}

