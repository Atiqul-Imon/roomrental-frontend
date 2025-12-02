'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

export function FilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilters: { key: string; label: string; value: string }[] = [];

  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const amenities = searchParams.get('amenities');
  const availabilityDate = searchParams.get('availabilityDate');
  const search = searchParams.get('search');

  if (city) activeFilters.push({ key: 'city', label: 'City', value: city });
  if (state) activeFilters.push({ key: 'state', label: 'State', value: state });
  if (minPrice) activeFilters.push({ key: 'minPrice', label: 'Min Price', value: `$${minPrice}` });
  if (maxPrice) activeFilters.push({ key: 'maxPrice', label: 'Max Price', value: `$${maxPrice}` });
  if (amenities) {
    const amenityList = amenities.split(',');
    amenityList.forEach((amenity) => {
      activeFilters.push({ key: `amenity-${amenity}`, label: 'Amenity', value: amenity });
    });
  }
  if (availabilityDate) {
    activeFilters.push({
      key: 'availabilityDate',
      label: 'Available',
      value: new Date(availabilityDate).toLocaleDateString(),
    });
  }
  if (search) activeFilters.push({ key: 'search', label: 'Search', value: search });

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

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {activeFilters.map((filter) => (
        <div
          key={filter.key}
          className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          <span>{filter.value}</span>
          <button
            onClick={() => removeFilter(filter.key, filter.value)}
            className="ml-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      {activeFilters.length > 0 && (
        <button
          onClick={clearAllFilters}
          className="text-sm text-primary hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

