'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { ListingCard } from './ListingCard';
import { Pagination } from './Pagination';
import { SortDropdown } from './SortDropdown';
import { ListingCardSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { queryConfig } from '@/lib/query-config';
import { Loader2 } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';

export function ListingList() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  
  // Build query params from URL
  const queryParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // Pull-to-refresh functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current !== null && window.scrollY === 0) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - touchStartY.current;
        
        if (distance > 0 && distance < 100) {
          setPullDistance(distance);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (touchStartY.current !== null && pullDistance > 50) {
        setIsRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: ['listings', searchParams.toString()] });
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
      touchStartY.current = null;
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, queryClient, searchParams]);

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
          // Advanced search fields
          propertyType: l.propertyType,
          petFriendly: l.petFriendly,
          smokingAllowed: l.smokingAllowed,
          genderPreference: l.genderPreference,
          parkingAvailable: l.parkingAvailable,
          walkabilityScore: l.walkabilityScore,
          nearbyUniversities: l.nearbyUniversities,
          nearbyTransit: l.nearbyTransit,
          viewCount: l.viewCount,
          distance: l.distance, // Distance in miles (for geospatial search)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="status" aria-label="Loading listings">
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
    <div ref={containerRef} className="relative">
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="flex items-center justify-center py-2 text-grey-600 text-sm transition-opacity"
          style={{ 
            opacity: Math.min(pullDistance / 50, 1),
            transform: `translateY(${Math.min(pullDistance, 50)}px)`
          }}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Refreshing...</span>
            </>
          ) : (
            <span>Pull to refresh</span>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="text-xs sm:text-sm text-muted-foreground">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {data.listings.map((listing, index) => (
              <div key={listing._id} className="stagger-item fade-in-up-delayed" style={{ animationDelay: `${index * 0.05}s` }}>
                <ListingCard 
                  listing={listing} 
                  onQuickView={(listing) => setSelectedListing(listing)}
                />
              </div>
            ))}
          </div>
          {/* Single modal for all listings */}
          <QuickViewModal
            listing={selectedListing}
            isOpen={!!selectedListing}
            onClose={() => setSelectedListing(null)}
          />
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            total={data.total}
            limit={data.limit}
          />
        </>
      )}
    </div>
  );
}

