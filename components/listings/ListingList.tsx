'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { ListingCard } from './ListingCard';
import { Pagination } from './Pagination';
import { SortDropdown } from './SortDropdown';
import { ListingCardSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { queryConfig } from '@/lib/query-config';

export function ListingList() {
  const searchParams = useSearchParams();
  
  // Build query params from URL
  const queryParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['listings', searchParams.toString()],
    ...queryConfig.listings,
    queryFn: async () => {
      const response = await api.get('/listings', { params: queryParams });
      // Handle nested response structure
      let backendData = response.data.data;
      if (backendData?.data) {
        backendData = backendData.data;
      }
      return {
        listings: (backendData?.listings || []).map((l: any) => ({
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
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        })) as Listing[],
        total: backendData?.pagination?.total || backendData?.total || 0,
        page: backendData?.pagination?.page || backendData?.page || 1,
        limit: backendData?.pagination?.limit || backendData?.limit || 12,
        totalPages: backendData?.pagination?.totalPages || backendData?.totalPages || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading listings">
        {[...Array(6)].map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load listings"
        message="We couldn't load the listings. Please check your connection and try again."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!data || data.listings.length === 0) {
    return (
      <EmptyState
        icon="home"
        title="No listings found"
        message="We couldn't find any listings matching your criteria. Try adjusting your filters or search terms."
        actionLabel="Browse All Listings"
        actionHref="/listings"
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted-foreground">
          {data.total > 0 ? (
            <>Found {data.total} {data.total === 1 ? 'listing' : 'listings'}</>
          ) : (
            'No listings found'
          )}
        </div>
        <SortDropdown />
      </div>

      {data.listings.length === 0 ? (
        <EmptyState
          icon="search"
          title="No matches found"
          message="No listings match your current filters. Try adjusting your search criteria to see more results."
          actionLabel="Clear Filters"
          actionHref="/listings"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.listings.map((listing, index) => (
              <div key={listing._id} className="stagger-item">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            total={data.total}
            limit={data.limit}
          />
        </>
      )}
    </>
  );
}

