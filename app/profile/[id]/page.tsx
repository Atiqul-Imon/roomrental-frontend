'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryConfig } from '@/lib/query-config';
import { api } from '@/lib/api';
import { User } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReviewList } from '@/components/reviews/ReviewList';
import { useAuth } from '@/lib/auth-context';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { SavedListings } from '@/components/profile/SavedListings';
import { UserListings } from '@/components/profile/UserListings';
import { Home, Star, Activity, User as UserIcon, Heart, Search, List } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user: currentUser } = useAuth();
  const userId = resolvedParams.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    ...queryConfig.userProfile,
    queryFn: async () => {
      const response = await api.get(`/profile/${userId}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch profile');
      }
      const backendData = response.data.data;
      return {
        id: backendData.user.id,
        email: backendData.user.email,
        name: backendData.user.name || '',
        role: backendData.user.role,
        profileImage: backendData.user.profileImage,
        bio: backendData.user.bio,
        phone: backendData.user.phone,
        preferences: backendData.user.preferences as any,
        verification: backendData.user.verification
          ? {
              emailVerified: backendData.user.emailVerified || false,
              phoneVerified: false,
              idVerified: backendData.user.verification === 'verified',
            }
          : undefined,
        createdAt: backendData.user.createdAt,
        updatedAt: backendData.user.updatedAt,
      } as User;
    },
  });

  const { data: ratingData } = useQuery({
    queryKey: ['rating', userId],
    queryFn: async () => {
      const response = await api.get(`/reviews/rating/${userId}`);
      return response.data.data as { averageRating: number; totalReviews: number };
    },
    enabled: !!profile,
  });

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      try {
        // For landlords - get listing stats
        if (profile?.role === 'landlord') {
          const listingsResponse = await api.get('/listings', {
            params: { landlordId: userId, page: 1, limit: 100 },
          });
          const listings = listingsResponse.data.data.listings || [];
          return {
            listings: listings.length,
            activeListings: listings.filter((l: any) => 
              l.status === 'available' || l.status === 'active'
            ).length,
            totalViews: listings.reduce((sum: number, l: any) => 
              sum + (l.viewCount || 0), 0
            ),
            revenue: listings
              .filter((l: any) => l.status === 'rented')
              .reduce((sum: number, l: any) => sum + (l.price || 0), 0),
          };
        }
        // For students - get saved listings and search history
        if (profile?.role === 'student' && currentUser?.id === userId) {
          const [favoritesResponse, searchHistoryResponse] = await Promise.all([
            api.get('/favorites', { params: { page: 1, limit: 1 } }).catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
            api.get('/search-history', { params: { limit: 1 } }).catch(() => ({ data: { data: [] } })),
          ]);
          return {
            savedListings: favoritesResponse.data.data?.pagination?.total || 0,
            searchHistory: searchHistoryResponse.data.data?.length || 0,
          };
        }
        return {};
      } catch (error) {
        return {};
      }
    },
    enabled: !!profile,
  });

  const isOwnProfile = currentUser?.id === userId;

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-grey-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </main>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-grey-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
              <p className="text-grey-600 mb-6">The profile you're looking for doesn't exist.</p>
              <Link
                href="/listings"
                className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
              >
                Browse Listings
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Prepare stats for ProfileStats component
  const stats = {
    reviews: ratingData?.totalReviews || 0,
    averageRating: ratingData?.averageRating || 0,
    ...(userStats || {}),
  };

  // Prepare tabs based on role
  const tabs = profile.role === 'landlord' 
    ? [
        {
          id: 'overview',
          label: 'Overview',
          icon: Home,
          content: (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-grey-900 mb-4">Recent Listings</h3>
                <UserListings userId={userId} isOwnProfile={isOwnProfile} />
              </div>
            </div>
          ),
        },
        {
          id: 'listings',
          label: 'Listings',
          icon: List,
          content: <UserListings userId={userId} isOwnProfile={isOwnProfile} />,
        },
        {
          id: 'reviews',
          label: 'Reviews',
          icon: Star,
          content: <ReviewList userId={userId} />,
        },
        {
          id: 'activity',
          label: 'Activity',
          icon: Activity,
          content: (
            <div className="text-center py-12 text-grey-500">
              <p>Activity timeline coming soon</p>
            </div>
          ),
        },
      ]
    : [
        {
          id: 'overview',
          label: 'Overview',
          icon: Home,
          content: (
            <div className="space-y-6">
              {isOwnProfile && (
                <div>
                  <h3 className="text-lg font-semibold text-grey-900 mb-4">Saved Listings</h3>
                  <SavedListings userId={userId} isOwnProfile={isOwnProfile} />
                </div>
              )}
            </div>
          ),
        },
        ...(isOwnProfile ? [{
          id: 'saved',
          label: 'Saved',
          icon: Heart,
          content: <SavedListings userId={userId} isOwnProfile={isOwnProfile} />,
        }] : []),
        {
          id: 'reviews',
          label: 'Reviews',
          icon: Star,
          content: <ReviewList userId={userId} />,
        },
        {
          id: 'activity',
          label: 'Activity',
          icon: Activity,
          content: (
            <div className="text-center py-12 text-grey-500">
              <p>Activity timeline coming soon</p>
            </div>
          ),
        },
      ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-grey-50">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Hero */}
          <ProfileHero 
            profile={profile} 
            ratingData={ratingData}
            isOwnProfile={isOwnProfile}
          />

          {/* Statistics */}
          <div className="mt-8 mb-8">
            <ProfileStats role={profile.role} stats={stats} />
          </div>

          {/* Tabs */}
          <ProfileTabs 
            role={profile.role}
            userId={userId}
            isOwnProfile={isOwnProfile}
            tabs={tabs}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
