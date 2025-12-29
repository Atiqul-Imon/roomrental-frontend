'use client';

import { Home, Heart, Star, TrendingUp, Eye, DollarSign, Search, MessageSquare } from 'lucide-react';

interface ProfileStatsProps {
  role: string;
  stats: {
    reviews?: number;
    averageRating?: number;
    listings?: number;
    activeListings?: number;
    savedListings?: number;
    searchHistory?: number;
    totalViews?: number;
    revenue?: number;
  };
}

export function ProfileStats({ role, stats }: ProfileStatsProps) {
  if (role === 'landlord') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-accent-100 hover:border-accent-200 transition-all hover:shadow-large">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-accent-100 rounded-lg">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-grey-900">{stats.listings || 0}</span>
          </div>
          <p className="text-xs sm:text-sm text-grey-600 font-medium">Total Listings</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-accent-100 hover:border-accent-200 transition-all hover:shadow-large">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-accent-100 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-grey-900">{stats.activeListings || 0}</span>
          </div>
          <p className="text-xs sm:text-sm text-grey-600 font-medium">Active Listings</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-accent-100 hover:border-accent-200 transition-all hover:shadow-large">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-primary-100 rounded-lg">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-grey-900">{stats.totalViews || 0}</span>
          </div>
          <p className="text-xs sm:text-sm text-grey-600 font-medium">Total Views</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-accent-100 hover:border-accent-200 transition-all hover:shadow-large">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-coral-100 rounded-lg">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-coral-600" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-grey-900">
              ${(stats.revenue || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-grey-600 font-medium">Revenue</p>
        </div>
      </div>
    );
  }

  // Student stats
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-accent-100 hover:border-accent-200 transition-all hover:shadow-large">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-coral-100 rounded-lg">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-coral-600" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-grey-900">{stats.savedListings || 0}</span>
        </div>
        <p className="text-xs sm:text-sm text-grey-600 font-medium">Saved Listings</p>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-accent-100 hover:border-accent-200 transition-all hover:shadow-large">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-primary-100 rounded-lg">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-grey-900">{stats.searchHistory || 0}</span>
        </div>
        <p className="text-xs sm:text-sm text-grey-600 font-medium">Recent Searches</p>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-accent-100 hover:border-accent-200 transition-all hover:shadow-large">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-accent-100 rounded-lg">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" />
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-grey-900">
              {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
            </span>
            {stats.reviews && stats.reviews > 0 && (
              <p className="text-xs text-grey-500 mt-0.5 sm:mt-1">{stats.reviews} reviews</p>
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-grey-600 font-medium">Average Rating</p>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-accent-100 hover:border-accent-200 transition-all hover:shadow-large">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-accent-100 rounded-lg">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-grey-900">{stats.reviews || 0}</span>
        </div>
        <p className="text-xs sm:text-sm text-grey-600 font-medium">Total Reviews</p>
      </div>
    </div>
  );
}

