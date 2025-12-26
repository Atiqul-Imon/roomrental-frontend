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
    student: 'bg-blue-100 text-blue-700',
    landlord: 'bg-primary-100 text-primary-700',
    admin: 'bg-purple-100 text-purple-700',
    staff: 'bg-amber-100 text-amber-700',
    super_admin: 'bg-red-100 text-red-700',
  };

  const roleColor = roleColors[profile.role] || roleColors.student;

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-t-xl overflow-hidden">
        {/* You can add a custom cover image here later */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-primary-800/40" />
      </div>

      {/* Profile Content */}
      <div className="relative -mt-20 px-6 pb-6">
        <div className="bg-white rounded-xl shadow-large border border-grey-200 p-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {profile.profileImage ? (
                <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-medium overflow-hidden">
                  <Image
                    src={profile.profileImage}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-medium bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Verification Badge */}
              {profile.verification?.emailVerified && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-medium">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}
            </div>

            {/* Name and Role */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-grey-900 mb-2">{profile.name}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${roleColor}`}>
                      <UserIcon className="w-4 h-4" />
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </span>
                    {profile.verification?.idVerified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                    {profile.createdAt && (
                      <span className="inline-flex items-center gap-1 text-sm text-grey-500">
                        <Calendar className="w-4 h-4" />
                        Member since {format(new Date(profile.createdAt), 'MMM yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold text-sm"
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
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-grey-600">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-grey-600">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-grey-200">
              <h2 className="font-semibold text-grey-900 mb-2">About</h2>
              <p className="text-grey-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

