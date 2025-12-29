'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryConfig } from '@/lib/query-config';
import { ListingCard } from '@/components/listings/ListingCard';
import { Listing } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListingCardSkeleton } from '@/components/LoadingSkeleton';
import Link from 'next/link';

interface SavedListingsProps {
  userId: string;
  isOwnProfile: boolean;
}

export function SavedListings({ userId, isOwnProfile }: SavedListingsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['favorites', 'profile', userId],
    ...queryConfig.favorites,
    queryFn: async () => {
      const response = await api.get('/favorites', {
        params: { page: 1, limit: 12 },
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
    enabled: isOwnProfile, // Only show saved listings for own profile
  });

  if (!isOwnProfile) {
    return (
      <div className="text-center py-12 text-grey-500">
        <p>Saved listings are private and only visible to the profile owner.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const favorites = data?.favorites || [];
  const total = data?.total || 0;

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon="heart"
        title="No saved listings yet"
        message="Start exploring and save your favorite rooms to view them here."
        actionLabel="Browse Listings"
        actionHref="/listings"
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-grey-900">
          {total} Saved {total === 1 ? 'Listing' : 'Listings'}
        </h3>
        <Link
          href="/favorites"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite: { listingId: Listing }) => (
          <ListingCard key={favorite.listingId._id} listing={favorite.listingId} />
        ))}
      </div>
    </div>
  );
}







