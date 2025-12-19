'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { User, Review } from '@/types';
import { Header } from '@/components/layout/Header';
import { RatingDisplay } from '@/components/reviews/RatingDisplay';
import { ReviewList } from '@/components/reviews/ReviewList';
import { useAuth } from '@/lib/auth-context';
import { Mail, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user: currentUser } = useAuth();
  const userId = resolvedParams.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
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

  const isOwnProfile = currentUser?.id === userId;

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-border rounded-lg p-6">
                <div className="flex flex-col items-center mb-6">
                  {profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt={profile.name}
                      width={128}
                      height={128}
                      className="rounded-full mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl font-semibold">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="capitalize">{profile.role}</span>
                    {profile.verification?.emailVerified && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  {ratingData && ratingData.totalReviews > 0 && (
                    <RatingDisplay
                      rating={ratingData.averageRating}
                      totalReviews={ratingData.totalReviews}
                      size="large"
                    />
                  )}
                </div>

                {profile.bio && (
                  <div className="mb-6">
                    <h2 className="font-semibold mb-2">About</h2>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <Link
                      href="/profile/edit"
                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-center block"
                    >
                      Edit Profile
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                <ReviewList userId={userId} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

