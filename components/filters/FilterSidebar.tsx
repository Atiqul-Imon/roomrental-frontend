'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { X, SlidersHorizontal, MapPin, DollarSign, Calendar, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amenities, setAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter state from URL
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    amenities: searchParams.get('amenities')?.split(',') || [],
    availabilityDate: searchParams.get('availabilityDate') || '',
  });

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [amenitiesRes, priceRes] = await Promise.all([
          api.get('/search/amenities'),
          api.get('/search/price-range'),
        ]);

        if (amenitiesRes.data.success) {
          setAmenities(amenitiesRes.data.data.amenities);
        }
        if (priceRes.data.success) {
          setPriceRange(priceRes.data.data);
          if (!filters.minPrice && !filters.maxPrice) {
            setFilters((prev) => ({
              ...prev,
              minPrice: priceRes.data.data.min.toString(),
              maxPrice: priceRes.data.data.max.toString(),
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = Array.isArray(filters.amenities) ? filters.amenities : [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Clear existing filters
    ['city', 'state', 'minPrice', 'maxPrice', 'amenities', 'availabilityDate'].forEach((key) => {
      params.delete(key);
    });

    // Set new filters
    if (filters.city) params.set('city', filters.city);
    if (filters.state) params.set('state', filters.state);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));
    if (filters.availabilityDate) params.set('availabilityDate', filters.availabilityDate);
    
    params.set('page', '1'); // Reset to first page
    router.push(`/listings?${params.toString()}`);
    onClose();
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      state: '',
      minPrice: priceRange.min.toString(),
      maxPrice: priceRange.max.toString(),
      amenities: [],
      availabilityDate: '',
    });
    
    const params = new URLSearchParams(searchParams.toString());
    ['city', 'state', 'minPrice', 'maxPrice', 'amenities', 'availabilityDate'].forEach((key) => {
      params.delete(key);
    });
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  };


  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-grey-200 z-50 overflow-y-auto shadow-large lg:static lg:z-auto lg:w-72 lg:shadow-none transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      } ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-grey-200 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-lg text-grey-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-grey-400 hover:text-grey-600 transition-colors p-1 rounded-full hover:bg-grey-100"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Location Section */}
          <div className="bg-grey-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary-600" />
              <h3 className="font-semibold text-grey-900">Location</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Enter city"
                className="w-full px-4 py-2.5 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">State</label>
              <input
                type="text"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                placeholder="Enter state"
                className="w-full px-4 py-2.5 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Price Range Section */}
          <div className="bg-grey-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-primary-600" />
              <h3 className="font-semibold text-grey-900">Price Range</h3>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-grey-600 mb-1">Min</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  min={0}
                  className="w-full px-3 py-2 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-grey-600 mb-1">Max</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="10000"
                  min={0}
                  className="w-full px-3 py-2 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Availability Date Section */}
          <div className="bg-grey-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary-600" />
              <h3 className="font-semibold text-grey-900">Availability</h3>
            </div>
            <input
              type="date"
              value={filters.availabilityDate}
              onChange={(e) => handleFilterChange('availabilityDate', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
          </div>

          {/* Amenities Section */}
          {!isLoading && (
            <div className="bg-grey-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <h3 className="font-semibold text-grey-900">Amenities</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {amenities.map((amenity) => {
                  const isChecked = Array.isArray(filters.amenities) && filters.amenities.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white transition-colors duration-200"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            isChecked
                              ? 'bg-primary-500 border-primary-500'
                              : 'bg-white border-grey-300 group-hover:border-primary-400'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                      <span className="text-sm text-grey-700 font-medium group-hover:text-primary-600 transition-colors">
                        {amenity}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-grey-200 sticky bottom-0 bg-white -mx-5 px-5 pb-5">
            <Button
              onClick={applyFilters}
              variant="primary"
              className="flex-1"
            >
              Apply Filters
            </Button>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="px-6"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

