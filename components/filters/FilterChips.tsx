'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { BodySmall } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function FilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilters: { key: string; label: string; value: string; type?: string }[] = [];

  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const amenities = searchParams.get('amenities');
  const availabilityDate = searchParams.get('availabilityDate');
  const search = searchParams.get('search');

  if (city) activeFilters.push({ key: 'city', label: 'City', value: city, type: 'location' });
  if (state) activeFilters.push({ key: 'state', label: 'State', value: state, type: 'location' });
  if (minPrice) activeFilters.push({ key: 'minPrice', label: 'Min Price', value: `$${minPrice}`, type: 'price' });
  if (maxPrice) activeFilters.push({ key: 'maxPrice', label: 'Max Price', value: `$${maxPrice}`, type: 'price' });
  if (amenities) {
    const amenityList = amenities.split(',');
    amenityList.forEach((amenity) => {
      activeFilters.push({ key: `amenity-${amenity}`, label: 'Amenity', value: amenity, type: 'amenity' });
    });
  }
  if (availabilityDate) {
    activeFilters.push({
      key: 'availabilityDate',
      label: 'Available',
      value: new Date(availabilityDate).toLocaleDateString(),
      type: 'date',
    });
  }
  if (search) activeFilters.push({ key: 'search', label: 'Search', value: search, type: 'search' });

  if (activeFilters.length === 0) return null;

  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key.startsWith('amenity-')) {
      // Handle amenity removal
      const amenityToRemove = key.replace('amenity-', '');
      const currentAmenities = params.get('amenities')?.split(',') || [];
      const newAmenities = currentAmenities.filter((a) => a !== amenityToRemove);
      if (newAmenities.length > 0) {
        params.set('amenities', newAmenities.join(','));
      } else {
        params.delete('amenities');
      }
    } else {
      params.delete(key);
    }

    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    // Keep only page and sort if needed
    const sort = searchParams.get('sort');
    if (sort) params.set('sort', sort);
    router.push(`/listings?${params.toString()}`);
  };

  // Group filters by type for better organization
  const filterGroups = {
    search: activeFilters.filter(f => f.type === 'search'),
    location: activeFilters.filter(f => f.type === 'location'),
    price: activeFilters.filter(f => f.type === 'price'),
    amenity: activeFilters.filter(f => f.type === 'amenity'),
    date: activeFilters.filter(f => f.type === 'date'),
  };

  const hasMultipleGroups = Object.values(filterGroups).filter(g => g.length > 0).length > 1;

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {/* Filter Count Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-grey-500" />
          <BodySmall className="text-xs sm:text-sm text-grey-600 font-medium">
            {activeFilters.length} {activeFilters.length === 1 ? 'filter' : 'filters'} active
          </BodySmall>
        </div>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs sm:text-sm text-grey-600 hover:text-grey-900 min-h-[32px] sm:min-h-0"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {activeFilters.map((filter) => {
          const typeColors = {
            search: 'bg-primary-50 text-primary-700 border-primary-200',
            location: 'bg-info-50 text-info-700 border-info-200',
            price: 'bg-success-50 text-success-700 border-success-200',
            amenity: 'bg-secondary-50 text-secondary-700 border-secondary-200',
            date: 'bg-warning-50 text-warning-700 border-warning-200',
          };

          return (
            <Badge
              key={filter.key}
              variant="outline"
              className={cn(
                'flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-2',
                'transition-all duration-200 hover:shadow-sm text-xs sm:text-sm',
                typeColors[filter.type as keyof typeof typeColors] || 'bg-grey-50 text-grey-700 border-grey-200'
              )}
            >
              <span className="font-medium truncate max-w-[120px] sm:max-w-none">{filter.value}</span>
              <button
                onClick={() => removeFilter(filter.key, filter.value)}
                className="ml-0.5 sm:ml-1 p-1 sm:p-0.5 rounded-full hover:bg-white/50 transition-colors touch-target flex-shrink-0"
                aria-label={`Remove ${filter.label} filter`}
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

