'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryConfig } from '@/lib/query-config';
import { ListingCard } from '@/components/listings/ListingCard';
import { Listing } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListingCardSkeleton } from '@/components/LoadingSkeleton';
import Link from 'next/link';
import { format } from 'date-fns';

interface UserListingsProps {
  userId: string;
  isOwnProfile: boolean;
}

export function UserListings({ userId, isOwnProfile }: UserListingsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-listings', userId],
    ...queryConfig.dashboard,
    queryFn: async () => {
      const response = await api.get('/listings', {
        params: { landlordId: userId, page: 1, limit: 12 },
      });
      const backendData = response.data.data;
      return {
        listings: (backendData.listings || []).map((l: any) => ({
          _id: l.id,
          landlordId: {
            _id: l.landlord?.id || l.landlordId,
            name: l.landlord?.name || '',
            email: l.landlord?.email || '',
            profileImage: l.landlord?.profileImage,
          },
          title: l.title,
          description: l.description,
          price: l.price,
          bedrooms: l.bedrooms,
          bathrooms: l.bathrooms,
          squareFeet: l.squareFeet,
          location: {
            city: l.city,
            state: l.state,
            zip: l.zip,
            address: l.address,
            coordinates: l.latitude && l.longitude
              ? { lat: l.latitude, lng: l.longitude }
              : undefined,
          },
          images: l.images || [],
          amenities: l.amenities || [],
          availabilityDate: l.availabilityDate,
          status: l.status,
          viewCount: l.viewCount || 0,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        })) as Listing[],
        total: backendData.pagination?.total || 0,
      };
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const listings = data?.listings || [];
  const total = data?.total || 0;

  if (listings.length === 0) {
    return (
      <EmptyState
        icon="home"
        title="No listings yet"
        message={isOwnProfile 
          ? "You haven't created any listings yet. Start by creating your first property listing."
          : "This user hasn't created any listings yet."}
        actionLabel={isOwnProfile ? "Create Listing" : undefined}
        actionHref={isOwnProfile ? "/listings/create" : undefined}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-grey-900">
          {total} {total === 1 ? 'Listing' : 'Listings'}
        </h3>
        {isOwnProfile && (
          <Link
            href="/landlord/listings"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Manage All
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing._id} className="relative">
            <ListingCard listing={listing} />
            {listing.viewCount !== undefined && listing.viewCount > 0 && (
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {listing.viewCount} views
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

