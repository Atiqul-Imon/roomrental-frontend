'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { ListingCard } from '@/components/listings/ListingCard';
import { Listing } from '@/types';
import { Pagination } from '@/components/listings/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListingCardSkeleton } from '@/components/LoadingSkeleton';

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['favorites', page],
    queryFn: async () => {
      const response = await api.get('/favorites', {
        params: { page, limit: 12 },
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
        page: backendData.pagination?.page || 1,
        limit: backendData.pagination?.limit || 12,
        totalPages: backendData.pagination?.totalPages || 0,
      };
    },
    enabled: isAuthenticated,
  });

  const changePage = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-grey-50">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-grey-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-grey-900">My Favorites</h1>

          {data && data.favorites.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.favorites.map((favorite: { listingId: Listing }) => (
                  <ListingCard key={favorite.listingId._id} listing={favorite.listingId} />
                ))}
              </div>
              <Pagination
                currentPage={data.page}
                totalPages={data.totalPages}
                total={data.total}
                limit={data.limit}
              />
            </>
          ) : (
            <EmptyState
              icon="heart"
              title="No favorites yet"
              message="Start exploring and save your favorite rooms to view them here later."
              actionLabel="Browse Listings"
              actionHref="/listings"
            />
          )}
        </div>
      </main>
    </>
  );
}

