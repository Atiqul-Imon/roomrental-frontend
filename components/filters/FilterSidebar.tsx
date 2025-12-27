'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { X, SlidersHorizontal, MapPin, DollarSign, Calendar, Sparkles, Check, Home, Users, Car, Heart, Cigarette } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PropertyType, GenderPreference } from '@/types';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amenities, setAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [filterCounts, setFilterCounts] = useState<{
    amenities?: Record<string, number>;
    features?: { petFriendly: number; smokingAllowed: number; parkingAvailable: number };
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Filter state from URL
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    amenities: searchParams.get('amenities')?.split(',') || [],
    availabilityDate: searchParams.get('availabilityDate') || '',
    // Advanced filters
    minBedrooms: searchParams.get('minBedrooms') || '',
    maxBedrooms: searchParams.get('maxBedrooms') || '',
    minBathrooms: searchParams.get('minBathrooms') || '',
    maxBathrooms: searchParams.get('maxBathrooms') || '',
    minSquareFeet: searchParams.get('minSquareFeet') || '',
    maxSquareFeet: searchParams.get('maxSquareFeet') || '',
    propertyType: searchParams.get('propertyType') || '',
    petFriendly: searchParams.get('petFriendly') === 'true',
    smokingAllowed: searchParams.get('smokingAllowed') === 'true',
    genderPreference: searchParams.get('genderPreference') || '',
    parkingAvailable: searchParams.get('parkingAvailable') === 'true',
    minWalkabilityScore: searchParams.get('minWalkabilityScore') || '',
  });

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [amenitiesRes, priceRes] = await Promise.all([
          api.get('/search/amenities'),
          api.get('/search/price-range'),
        ]);

        if (amenitiesRes.data.success) {
          // Handle nested response structure
          const amenitiesData = amenitiesRes.data.data;
          const amenitiesArray = Array.isArray(amenitiesData) 
            ? amenitiesData 
            : (amenitiesData?.data || amenitiesData || []);
          setAmenities(Array.isArray(amenitiesArray) ? amenitiesArray : []);
        }
        if (priceRes.data.success) {
          // Handle nested response structure
          const priceData = priceRes.data.data;
          const priceInfo = priceData?.data || priceData;
          setPriceRange({ 
            min: priceInfo?.min || 0, 
            max: priceInfo?.max || 10000 
          });
          if (!filters.minPrice && !filters.maxPrice) {
            setFilters((prev) => ({
              ...prev,
              minPrice: (priceInfo?.min || 0).toString(),
              maxPrice: (priceInfo?.max || 10000).toString(),
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

  // Fetch filter counts for faceted search
  useEffect(() => {
    const fetchFilterCounts = async () => {
      try {
        const params: Record<string, any> = {};
        searchParams.forEach((value, key) => {
          if (key !== 'page' && key !== 'sort') {
            params[key] = value;
          }
        });

        const response = await api.get('/listings/filters/counts', { params });
        if (response.data.success) {
          setFilterCounts(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching filter counts:', error);
      }
    };

    fetchFilterCounts();
  }, [searchParams]);

  const handleFilterChange = (key: string, value: string | string[] | boolean) => {
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
    const filterKeys = [
      'city', 'state', 'minPrice', 'maxPrice', 'amenities', 'availabilityDate',
      'minBedrooms', 'maxBedrooms', 'minBathrooms', 'maxBathrooms',
      'minSquareFeet', 'maxSquareFeet', 'propertyType', 'petFriendly',
      'smokingAllowed', 'genderPreference', 'parkingAvailable', 'minWalkabilityScore'
    ];
    filterKeys.forEach((key) => {
      params.delete(key);
    });

    // Set new filters
    if (filters.city) params.set('city', filters.city);
    if (filters.state) params.set('state', filters.state);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));
    if (filters.availabilityDate) params.set('availabilityDate', filters.availabilityDate);
    
    // Advanced filters
    if (filters.minBedrooms) params.set('minBedrooms', filters.minBedrooms);
    if (filters.maxBedrooms) params.set('maxBedrooms', filters.maxBedrooms);
    if (filters.minBathrooms) params.set('minBathrooms', filters.minBathrooms);
    if (filters.maxBathrooms) params.set('maxBathrooms', filters.maxBathrooms);
    if (filters.minSquareFeet) params.set('minSquareFeet', filters.minSquareFeet);
    if (filters.maxSquareFeet) params.set('maxSquareFeet', filters.maxSquareFeet);
    if (filters.propertyType) params.set('propertyType', filters.propertyType);
    if (filters.petFriendly) params.set('petFriendly', 'true');
    if (filters.smokingAllowed) params.set('smokingAllowed', 'true');
    if (filters.genderPreference && filters.genderPreference !== 'any') params.set('genderPreference', filters.genderPreference);
    if (filters.parkingAvailable) params.set('parkingAvailable', 'true');
    if (filters.minWalkabilityScore) params.set('minWalkabilityScore', filters.minWalkabilityScore);
    
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
      minBedrooms: '',
      maxBedrooms: '',
      minBathrooms: '',
      maxBathrooms: '',
      minSquareFeet: '',
      maxSquareFeet: '',
      propertyType: '',
      petFriendly: false,
      smokingAllowed: false,
      genderPreference: '',
      parkingAvailable: false,
      minWalkabilityScore: '',
    });
    
    const params = new URLSearchParams(searchParams.toString());
    const filterKeys = [
      'city', 'state', 'minPrice', 'maxPrice', 'amenities', 'availabilityDate',
      'minBedrooms', 'maxBedrooms', 'minBathrooms', 'maxBathrooms',
      'minSquareFeet', 'maxSquareFeet', 'propertyType', 'petFriendly',
      'smokingAllowed', 'genderPreference', 'parkingAvailable', 'minWalkabilityScore'
    ];
    filterKeys.forEach((key) => {
      params.delete(key);
    });
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  };


  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet (Mobile) / Sidebar (Desktop) */}
      <div className={`
        fixed bottom-0 left-0 right-0 md:right-auto md:top-0 md:left-auto
        h-[85vh] md:h-full
        w-full md:w-80 lg:w-72
        bg-white border-t md:border-l md:border-t-0 border-grey-200
        z-50 overflow-y-auto shadow-large
        md:static md:z-auto md:shadow-none
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
        ${isOpen ? 'block' : 'hidden md:block'}
        rounded-t-2xl md:rounded-none
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-grey-200 p-4 sm:p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-lg text-grey-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-grey-400 hover:text-grey-600 transition-colors p-1.5 rounded-full hover:bg-grey-100 touch-target"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag Handle (Mobile Only) */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-grey-300 rounded-full" />
        </div>

        <div className="p-4 sm:p-5 space-y-4 sm:space-y-6">
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

          {/* Property Details Section */}
          <div className="bg-grey-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-4 h-4 text-primary-600" />
              <h3 className="font-semibold text-grey-900">Property Details</h3>
            </div>
            
            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">Bedrooms</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={filters.minBedrooms}
                    onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
                    placeholder="Min"
                    min={0}
                    className="w-full px-3 py-2 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={filters.maxBedrooms}
                    onChange={(e) => handleFilterChange('maxBedrooms', e.target.value)}
                    placeholder="Max"
                    min={0}
                    className="w-full px-3 py-2 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">Bathrooms</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.5"
                    value={filters.minBathrooms}
                    onChange={(e) => handleFilterChange('minBathrooms', e.target.value)}
                    placeholder="Min"
                    min={0}
                    className="w-full px-3 py-2 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.5"
                    value={filters.maxBathrooms}
                    onChange={(e) => handleFilterChange('maxBathrooms', e.target.value)}
                    placeholder="Max"
                    min={0}
                    className="w-full px-3 py-2 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Square Feet */}
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">Square Feet</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={filters.minSquareFeet}
                    onChange={(e) => handleFilterChange('minSquareFeet', e.target.value)}
                    placeholder="Min"
                    min={0}
                    className="w-full px-3 py-2 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={filters.maxSquareFeet}
                    onChange={(e) => handleFilterChange('maxSquareFeet', e.target.value)}
                    placeholder="Max"
                    min={0}
                    className="w-full px-3 py-2 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="dorm">Dorm</option>
                <option value="studio">Studio</option>
                <option value="shared_room">Shared Room</option>
                <option value="private_room">Private Room</option>
              </select>
            </div>
          </div>

          {/* Lifestyle Filters */}
          <div className="bg-grey-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary-600" />
              <h3 className="font-semibold text-grey-900">Lifestyle</h3>
            </div>
            <div className="space-y-3">
              {/* Pet Friendly */}
              <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white transition-colors duration-200">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.petFriendly}
                    onChange={(e) => handleFilterChange('petFriendly', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      filters.petFriendly
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-grey-300 group-hover:border-primary-400'
                    }`}
                  >
                    {filters.petFriendly && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-grey-500" />
                  <span className="text-sm text-grey-700 font-medium group-hover:text-primary-600 transition-colors flex-1">
                    Pet Friendly
                  </span>
                  {filterCounts.features && (
                    <span className="text-xs text-grey-500 bg-grey-100 px-2 py-0.5 rounded-full">
                      {filterCounts.features.petFriendly}
                    </span>
                  )}
                </div>
              </label>

              {/* Smoking Allowed */}
              <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white transition-colors duration-200">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.smokingAllowed}
                    onChange={(e) => handleFilterChange('smokingAllowed', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      filters.smokingAllowed
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-grey-300 group-hover:border-primary-400'
                    }`}
                  >
                    {filters.smokingAllowed && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Cigarette className="w-4 h-4 text-grey-500" />
                  <span className="text-sm text-grey-700 font-medium group-hover:text-primary-600 transition-colors flex-1">
                    Smoking Allowed
                  </span>
                  {filterCounts.features && (
                    <span className="text-xs text-grey-500 bg-grey-100 px-2 py-0.5 rounded-full">
                      {filterCounts.features.smokingAllowed}
                    </span>
                  )}
                </div>
              </label>

              {/* Gender Preference */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">Gender Preference</label>
                <select
                  value={filters.genderPreference}
                  onChange={(e) => handleFilterChange('genderPreference', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                >
                  <option value="">Any</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                  <option value="coed">Co-ed</option>
                </select>
              </div>

              {/* Parking Available */}
              <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white transition-colors duration-200">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.parkingAvailable}
                    onChange={(e) => handleFilterChange('parkingAvailable', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      filters.parkingAvailable
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-grey-300 group-hover:border-primary-400'
                    }`}
                  >
                    {filters.parkingAvailable && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-grey-500" />
                  <span className="text-sm text-grey-700 font-medium group-hover:text-primary-600 transition-colors flex-1">
                    Parking Available
                  </span>
                  {filterCounts.features && (
                    <span className="text-xs text-grey-500 bg-grey-100 px-2 py-0.5 rounded-full">
                      {filterCounts.features.parkingAvailable}
                    </span>
                  )}
                </div>
              </label>

              {/* Walkability Score */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Walkability Score: {filters.minWalkabilityScore || 'Any'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minWalkabilityScore || 0}
                  onChange={(e) => handleFilterChange('minWalkabilityScore', e.target.value)}
                  className="w-full h-2 bg-grey-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-grey-500 mt-1">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          {!isLoading && (
            <div className="bg-grey-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <h3 className="font-semibold text-grey-900">Amenities</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto" role="group" aria-label="Amenities filter">
                {Array.isArray(amenities) && amenities.length > 0 ? amenities.map((amenity) => {
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
                          aria-label={`Filter by ${amenity} amenity`}
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
                      <span className="text-sm text-grey-700 font-medium group-hover:text-primary-600 transition-colors flex-1">
                        {amenity}
                      </span>
                      {filterCounts.amenities && filterCounts.amenities[amenity] !== undefined && (
                        <span className="text-xs text-grey-500 bg-grey-100 px-2 py-0.5 rounded-full">
                          {filterCounts.amenities[amenity]}
                        </span>
                      )}
                    </label>
                  );
                }) : (
                  <p className="text-sm text-grey-500 text-center py-4">No amenities available</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-grey-200 sticky bottom-0 bg-white -mx-4 sm:-mx-5 px-4 sm:px-5 pb-4 sm:pb-5 md:pb-5" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <Button
              onClick={applyFilters}
              variant="primary"
              className="flex-1 min-h-[44px]"
            >
              Apply Filters
            </Button>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="px-4 sm:px-6 min-h-[44px]"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

