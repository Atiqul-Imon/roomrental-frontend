'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryConfig } from '@/lib/query-config';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  Heart, 
  Search, 
  Clock, 
  TrendingUp,
  Star,
  MapPin,
  Calendar,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { ListingCard } from '@/components/listings/ListingCard';
import { Listing } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListingCardSkeleton } from '@/components/LoadingSkeleton';

export function StudentDashboard() {
  const { user } = useAuth();

  // Fetch saved listings/favorites
  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', 'dashboard'],
    ...queryConfig.favorites,
    queryFn: async () => {
      const response = await api.get('/favorites', {
        params: { page: 1, limit: 6 },
      });
      const backendData = response.data.data;
      return {
        favorites: (backendData.favorites || []).map((favorite: any) => ({
          listingId: {
            _id: favorite.listing.id,
            landlordId: {
              _id: favorite.listing.landlord?.id || favorite.listing.landlordId,
              name: favorite.listing.landlord?.name || '',
              email: favorite.listing.landlord?.email || '',
              profileImage: favorite.listing.landlord?.profileImage,
            },
            title: favorite.listing.title,
            description: favorite.listing.description,
            price: favorite.listing.price,
            bedrooms: favorite.listing.bedrooms,
            bathrooms: favorite.listing.bathrooms,
            squareFeet: favorite.listing.squareFeet,
            location: {
              city: favorite.listing.city,
              state: favorite.listing.state,
              zip: favorite.listing.zip,
              address: favorite.listing.address,
              coordinates: favorite.listing.latitude && favorite.listing.longitude
                ? { lat: favorite.listing.latitude, lng: favorite.listing.longitude }
                : undefined,
            },
            images: favorite.listing.images || [],
            amenities: favorite.listing.amenities || [],
            availabilityDate: favorite.listing.availabilityDate,
            status: favorite.listing.status,
            createdAt: favorite.listing.createdAt,
            updatedAt: favorite.listing.updatedAt,
          } as Listing,
        })),
        total: backendData.pagination?.total || 0,
      };
    },
  });

  // Fetch search history
  const { data: searchHistory } = useQuery({
    queryKey: ['search-history', 'dashboard'],
    queryFn: async () => {
      try {
        const response = await api.get('/search-history', { params: { limit: 5 } });
        if (response.data.success) {
          return response.data.data || [];
        }
        return [];
      } catch (error) {
        // Silently fail if endpoint doesn't exist or user not authenticated
        return [];
      }
    },
    enabled: !!user,
  });

  // Fetch user rating/reviews
  const { data: ratingData } = useQuery({
    queryKey: ['rating', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await api.get(`/reviews/rating/${user.id}`);
      return response.data.data as { averageRating: number; totalReviews: number };
    },
    enabled: !!user?.id,
  });

  // Fetch unread messages count
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const response = await api.get('/chat/unread-count');
      return response.data.count || 0;
    },
  });

  const favorites = favoritesData?.favorites || [];
  const totalFavorites = favoritesData?.total || 0;
  const recentSearches = searchHistory || [];

  // Calculate statistics
  const stats = {
    savedListings: totalFavorites,
    searchHistory: recentSearches.length,
    reviews: ratingData?.totalReviews || 0,
    averageRating: ratingData?.averageRating || 0,
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-grey-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-grey-900 mb-2">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-grey-600">Here's your personalized dashboard</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <span className="text-2xl font-bold text-grey-900">{stats.savedListings}</span>
              </div>
              <p className="text-sm text-grey-600 font-medium">Saved Listings</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-grey-900">{stats.searchHistory}</span>
              </div>
              <p className="text-sm text-grey-600 font-medium">Recent Searches</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-grey-900">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                  </span>
                  {stats.reviews > 0 && (
                    <p className="text-xs text-grey-500 mt-1">{stats.reviews} reviews</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-grey-600 font-medium">Average Rating</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-grey-900">{stats.reviews}</span>
              </div>
              <p className="text-sm text-grey-600 font-medium">Total Reviews</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/listings"
              className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-medium hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Browse Listings</h3>
                  <p className="text-sm text-white/80">Find your perfect room</p>
                </div>
              </div>
            </Link>

            <Link
              href="/favorites"
              className="bg-white rounded-xl p-6 border border-grey-200 shadow-medium hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 text-grey-900">Saved Listings</h3>
                  <p className="text-sm text-grey-600">
                    {totalFavorites > 0 ? `${totalFavorites} saved` : 'View your favorites'}
                  </p>
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

          {/* Saved Listings Section */}
          <div className="bg-white rounded-xl shadow-medium border border-grey-200 mb-8">
            <div className="p-6 border-b border-grey-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-grey-900">Saved Listings</h2>
              {totalFavorites > 0 && (
                <Link
                  href="/favorites"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All
                </Link>
              )}
            </div>
            <div className="p-6">
              {favoritesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <ListingCardSkeleton key={i} />
                  ))}
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((favorite: { listingId: Listing }) => (
                    <ListingCard key={favorite.listingId._id} listing={favorite.listingId} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="heart"
                  title="No saved listings yet"
                  message="Start exploring and save your favorite rooms to view them here later."
                  actionLabel="Browse Listings"
                  actionHref="/listings"
                />
              )}
            </div>
          </div>

          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="bg-white rounded-xl shadow-medium border border-grey-200">
              <div className="p-6 border-b border-grey-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-grey-900">Recent Searches</h2>
                <Link
                  href="/listings"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Search Again
                </Link>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {recentSearches.map((search: any, index: number) => (
                    <Link
                      key={search.id || index}
                      href={`/listings?${new URLSearchParams({
                        search: search.searchQuery || '',
                        ...(search.filters || {}),
                      }).toString()}`}
                      className="flex items-center gap-4 p-4 border border-grey-200 rounded-lg hover:bg-grey-50 transition-colors group"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-grey-900 group-hover:text-primary-600 transition-colors">
                          {search.searchQuery || 'Recent search'}
                        </p>
                        <p className="text-sm text-grey-500">
                          {search.resultsCount || 0} results • {search.createdAt ? format(new Date(search.createdAt), 'MMM dd, yyyy') : 'Recently'}
                        </p>
                      </div>
                      <Search className="w-5 h-5 text-grey-400 group-hover:text-primary-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

