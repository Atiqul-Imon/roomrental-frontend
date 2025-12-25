'use client';

export const dynamic = 'force-dynamic';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryConfig } from '@/lib/query-config';
import { 
  Home, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function LandlordDashboardPage() {
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['my-listings', 'all', 1],
    ...queryConfig.dashboard,
    queryFn: async () => {
      const response = await api.get('/listings/my/listings', { 
        params: { page: 1, limit: 100 } 
      });
      const backendData = response.data.data;
      return {
        listings: backendData.listings || [],
        total: backendData.total || 0,
      };
    },
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const response = await api.get('/chat/unread-count');
      return response.data.count || 0;
    },
  });

  const listings = listingsData?.listings || [];
  
  // Calculate statistics
  const stats = {
    total: listingsData?.total || 0,
    active: listings.filter((l: any) => l.status === 'available' || l.status === 'active').length,
    pending: listings.filter((l: any) => l.status === 'pending').length,
    rented: listings.filter((l: any) => l.status === 'rented').length,
    totalViews: listings.reduce((sum: number, l: any) => sum + (l.views || 0), 0),
    totalRevenue: listings
      .filter((l: any) => l.status === 'rented')
      .reduce((sum: number, l: any) => sum + (l.price || 0), 0),
  };

  const recentListings = listings.slice(0, 5);

  if (listingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-grey-900 mb-2">Dashboard</h1>
        <p className="text-grey-600">Welcome back! Here's an overview of your listings</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Home className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-2xl font-bold text-grey-900">{stats.total}</span>
          </div>
          <p className="text-sm text-grey-600 font-medium">Total Listings</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-grey-900">{stats.active}</span>
          </div>
          <p className="text-sm text-grey-600 font-medium">Active Listings</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-grey-900">{stats.totalViews}</span>
          </div>
          <p className="text-sm text-grey-600 font-medium">Total Views</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-grey-900">
              ${stats.totalRevenue.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-grey-600 font-medium">Monthly Revenue</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/listings/create"
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-medium hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Create Listing</h3>
              <p className="text-sm text-white/80">Add a new property</p>
            </div>
          </div>
        </Link>

        <Link
          href="/landlord/listings"
          className="bg-white rounded-xl p-6 border border-grey-200 shadow-medium hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Home className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-grey-900">Manage Listings</h3>
              <p className="text-sm text-grey-600">View and edit your listings</p>
            </div>
          </div>
        </Link>

        <Link
          href="/chat"
          className="bg-white rounded-xl p-6 border border-grey-200 shadow-medium hover:shadow-lg transition-all duration-200 relative"
        >
          {unreadCount && unreadCount > 0 && (
            <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-grey-900">Messages</h3>
              <p className="text-sm text-grey-600">
                {unreadCount ? `${unreadCount} unread messages` : 'View messages'}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Listings */}
      <div className="bg-white rounded-xl shadow-medium border border-grey-200">
        <div className="p-6 border-b border-grey-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-grey-900">Recent Listings</h2>
          <Link
            href="/landlord/listings"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </Link>
        </div>
        <div className="p-6">
          {recentListings.length > 0 ? (
            <div className="space-y-4">
              {recentListings.map((listing: any) => (
                <div
                  key={listing.id}
                  className="flex items-center gap-4 p-4 border border-grey-200 rounded-lg hover:bg-grey-50 transition-colors"
                >
                  {listing.images && listing.images[0] && (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-grey-900">{listing.title}</h3>
                    <p className="text-sm text-grey-600">
                      {listing.city}, {listing.state} • ${listing.price}/month
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        listing.status === 'available' || listing.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : listing.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-grey-100 text-grey-700'
                      }`}
                    >
                      {listing.status}
                    </span>
                    <p className="text-xs text-grey-500 mt-1">
                      {listing.createdAt
                        ? format(new Date(listing.createdAt), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-grey-300 mx-auto mb-4" />
              <p className="text-grey-600 mb-4">No listings yet</p>
              <Link
                href="/listings/create"
                className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
              >
                Create Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

