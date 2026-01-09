/**
 * Filter Presets Component
 * Phase 2: User Experience - Search & Discovery
 * 
 * Provides quick filter presets for common searches
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, TrendingUp, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BodySmall, Caption } from '@/components/ui/Typography';

interface FilterPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  filters: {
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
  };
  description?: string;
}

const presets: FilterPreset[] = [
  {
    id: 'student-budget',
    name: 'Student Budget',
    icon: <DollarSign className="w-4 h-4" />,
    filters: {
      maxPrice: 800,
    },
    description: 'Under $800/month',
  },
  {
    id: 'furnished',
    name: 'Furnished',
    icon: <Sparkles className="w-4 h-4" />,
    filters: {
      amenities: ['Furnished'],
    },
    description: 'Fully furnished rooms',
  },
  {
    id: 'pet-friendly',
    name: 'Pet Friendly',
    icon: <Sparkles className="w-4 h-4" />,
    filters: {
      amenities: ['Pet Friendly'],
    },
    description: 'Pet-friendly listings',
  },
  {
    id: 'near-campus',
    name: 'Near Campus',
    icon: <MapPin className="w-4 h-4" />,
    filters: {
      // This would typically use location/radius, but for now just a placeholder
    },
    description: 'Close to universities',
  },
  {
    id: 'popular',
    name: 'Popular',
    icon: <TrendingUp className="w-4 h-4" />,
    filters: {},
    description: 'Most viewed listings',
  },
];

export function FilterPresets() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const applyPreset = (preset: FilterPreset) => {
    const params = new URLSearchParams();
    
    // Apply preset filters
    if (preset.filters.city) params.set('city', preset.filters.city);
    if (preset.filters.state) params.set('state', preset.filters.state);
    if (preset.filters.minPrice) params.set('minPrice', preset.filters.minPrice.toString());
    if (preset.filters.maxPrice) params.set('maxPrice', preset.filters.maxPrice.toString());
    if (preset.filters.amenities && preset.filters.amenities.length > 0) {
      params.set('amenities', preset.filters.amenities.join(','));
    }
    
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  };

  const isPresetActive = (preset: FilterPreset): boolean => {
    const currentCity = searchParams.get('city');
    const currentState = searchParams.get('state');
    const currentMinPrice = searchParams.get('minPrice');
    const currentMaxPrice = searchParams.get('maxPrice');
    const currentAmenities = searchParams.get('amenities')?.split(',') || [];

    if (preset.filters.city && currentCity !== preset.filters.city) return false;
    if (preset.filters.state && currentState !== preset.filters.state) return false;
    if (preset.filters.minPrice && currentMinPrice !== preset.filters.minPrice.toString()) return false;
    if (preset.filters.maxPrice && currentMaxPrice !== preset.filters.maxPrice.toString()) return false;
    if (preset.filters.amenities) {
      const matches = preset.filters.amenities.every(a => currentAmenities.includes(a));
      if (!matches) return false;
    }

    return true;
  };

  return (
    <div className="mb-6">
      <Caption className="mb-3">Quick Filters</Caption>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = isPresetActive(preset);
          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg
                transition-all duration-200
                border-2
                ${
                  active
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-grey-300 text-grey-700 hover:border-primary-400 hover:bg-primary-50/50'
                }
              `}
            >
              <span className={active ? 'text-primary-600' : 'text-grey-500'}>
                {preset.icon}
              </span>
              <div className="text-left">
                <BodySmall className="font-medium">{preset.name}</BodySmall>
                {preset.description && (
                  <Caption className="text-xs">{preset.description}</Caption>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

































