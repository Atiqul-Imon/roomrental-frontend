'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryConfig } from '@/lib/query-config';
import { api } from '@/lib/api';
import { User } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/auth-context';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { SavedListings } from '@/components/profile/SavedListings';
import { UserListings } from '@/components/profile/UserListings';
import { Home, Heart, Search, List, Clock, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { SearchHistoryTab } from '@/components/profile/SearchHistoryTab';

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user: currentUser } = useAuth();
  const userId = resolvedParams.id;

  // Use batch endpoint to fetch profile, ratings, and stats in one call
  const { data: fullProfileData, isLoading } = useQuery({
    queryKey: ['full-profile', userId],
    ...queryConfig.userProfile,
    queryFn: async () => {
      const response = await api.get(`/profile/${userId}/full`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch profile');
      }
      return response.data.data;
    },
  });

  // Extract data from batch response
  const profile = fullProfileData?.user
    ? {
        id: fullProfileData.user.id,
        email: fullProfileData.user.email,
        name: fullProfileData.user.name || '',
        role: fullProfileData.user.role,
        profileImage: fullProfileData.user.profileImage,
        bio: fullProfileData.user.bio,
        phone: fullProfileData.user.phone,
        preferences: fullProfileData.user.preferences as any,
        verification: fullProfileData.user.verification
          ? {
              emailVerified: fullProfileData.user.emailVerified || false,
              phoneVerified: false,
              idVerified: fullProfileData.user.verification === 'verified',
            }
          : undefined,
        createdAt: fullProfileData.user.createdAt,
        updatedAt: fullProfileData.user.updatedAt,
      } as User
    : undefined;

  const ratingData = fullProfileData?.rating
    ? {
        averageRating: fullProfileData.rating.averageRating,
        totalReviews: fullProfileData.rating.totalReviews,
      }
    : undefined;

  const userStats = fullProfileData?.stats || {};

  const isOwnProfile = currentUser?.id === userId;

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-comfort">
          <div className="container mx-auto px-4 py-8">
            <div className="relative animate-pulse">
              <div className="bg-white rounded-xl shadow-large border border-accent-100 p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="w-32 h-32 rounded-full bg-accent-100 border-2 border-accent-200" />
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-accent-100 rounded w-48" />
                    <div className="h-6 bg-accent-100 rounded w-32" />
                    <div className="h-4 bg-accent-100 rounded w-64" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-medium border border-accent-100">
                  <div className="h-20 bg-accent-50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-comfort">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
              <p className="text-grey-600 mb-6">The profile you're looking for doesn't exist.</p>
              <Link
                href="/listings"
                className="inline-block px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-soft hover:shadow-medium"
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
        ...(isOwnProfile ? [
          {
            id: 'saved',
            label: 'Saved',
            icon: Heart,
            content: <SavedListings userId={userId} isOwnProfile={isOwnProfile} />,
          },
          {
            id: 'history',
            label: 'Search History',
            icon: Clock,
            content: <SearchHistoryTab />,
          },
        ] : []),
      ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-grey-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
          {/* Profile Hero */}
          <ProfileHero 
            profile={profile} 
            ratingData={ratingData}
            isOwnProfile={isOwnProfile}
          />

          {/* Mobile Dashboard Button - Only for Landlords viewing their own profile */}
          {isOwnProfile && profile.role === 'landlord' && (
            <div className="lg:hidden mt-4 sm:mt-6">
              <Link
                href="/landlord/dashboard"
                className="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 bg-gradient-primary text-white rounded-xl font-semibold text-sm sm:text-base shadow-medium hover:shadow-lg transition-all duration-200 active:scale-98"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </Link>
            </div>
          )}

          {/* Statistics */}
          <div className="mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-6 md:mb-8">
            <ProfileStats role={profile.role} stats={stats} />
          </div>

          {/* Tabs */}
          <div className="mt-4 sm:mt-6 md:mt-8">
            <ProfileTabs 
              role={profile.role}
              userId={userId}
              isOwnProfile={isOwnProfile}
              tabs={tabs}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
