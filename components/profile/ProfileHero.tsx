'use client';

import Image from 'next/image';
import { User as UserIcon, CheckCircle, Mail, Phone, Calendar } from 'lucide-react';
import { User as UserType } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { RatingDisplay } from '@/components/reviews/RatingDisplay';

interface ProfileHeroProps {
  profile: UserType;
  ratingData?: { averageRating: number; totalReviews: number };
  isOwnProfile: boolean;
}

export function ProfileHero({ profile, ratingData, isOwnProfile }: ProfileHeroProps) {
  const roleColors = {
    student: 'bg-accent-100 text-accent-700',
    landlord: 'bg-coral-100 text-coral-700',
    admin: 'bg-purple-100 text-purple-700',
    staff: 'bg-amber-100 text-amber-700',
    super_admin: 'bg-red-100 text-red-700',
  };

  const roleColor = roleColors[profile.role] || roleColors.student;

  return (
    <div className="relative">
      {/* Profile Content */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="bg-white rounded-xl shadow-large border-refined border-accent-100 p-5 sm:p-6 md:p-8 relative overflow-hidden">
          {/* Warm decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-100/20 rounded-full blur-3xl -z-0"></div>
          <div className="relative z-10">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative mx-auto md:mx-0">
              {profile.profileImage ? (
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-accent-200 shadow-medium overflow-hidden">
                  <Image
                    src={profile.profileImage}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-accent-200 shadow-medium bg-gradient-primary flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Verification Badge */}
              {profile.verification?.emailVerified && (
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-white rounded-full p-1.5 sm:p-2 shadow-medium border-2 border-accent-200 hover:border-accent-300 transition-colors" title="Email Verified">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600 fill-accent-50" />
                </div>
              )}
            </div>

            {/* Name and Role */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-grey-900 mb-2">{profile.name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${roleColor}`}>
                      <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </span>
                    {profile.verification?.idVerified && (
                      <span className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-soft hover:shadow-medium transition-all duration-200" title="ID Verified - Trusted Member">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-100" />
                        Verified
                      </span>
                    )}
                    {profile.createdAt && (
                      <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-grey-500">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Member since </span>
                        {format(new Date(profile.createdAt), 'MMM yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="px-3 sm:px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all font-semibold text-xs sm:text-sm whitespace-nowrap shadow-soft hover:shadow-medium"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>

              {/* Rating */}
              {ratingData && ratingData.totalReviews > 0 && (
                <div className="mb-4">
                  <RatingDisplay
                    rating={ratingData.averageRating}
                    totalReviews={ratingData.totalReviews}
                    size="large"
                  />
                </div>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 text-grey-600">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="break-all">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-grey-600">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-accent-100">
              <h2 className="font-semibold text-grey-900 mb-2 text-sm sm:text-base">About</h2>
              <p className="text-grey-700 leading-relaxed text-sm sm:text-base">{profile.bio}</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

