'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import dynamic from 'next/dynamic';
import { queryConfig } from '@/lib/query-config';
import { useState, useEffect } from 'react';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./MapView').then((mod) => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-xl bg-grey-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-grey-600">Loading map...</p>
      </div>
    </div>
  ),
});

export function MapViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapRadius, setMapRadius] = useState(10);

  // Get center from URL params or use default
  useEffect(() => {
    const lat = searchParams.get('latitude');
    const lng = searchParams.get('longitude');
    const radius = searchParams.get('radius');
    
    if (lat && lng) {
      setMapCenter([parseFloat(lat), parseFloat(lng)]);
    }
    if (radius) {
      setMapRadius(parseFloat(radius));
    }
  }, [searchParams]);

  // Build query params from URL
  const queryParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // Add geospatial params if center is set
  if (mapCenter) {
    queryParams.latitude = mapCenter[0].toString();
    queryParams.longitude = mapCenter[1].toString();
    queryParams.radius = mapRadius.toString();
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['listings', searchParams.toString(), mapCenter, mapRadius],
    ...queryConfig.listings,
    queryFn: async () => {
      const response = await api.get('/listings', { params: queryParams });
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
          propertyType: l.propertyType,
          petFriendly: l.petFriendly,
          smokingAllowed: l.smokingAllowed,
          genderPreference: l.genderPreference,
          parkingAvailable: l.parkingAvailable,
          walkabilityScore: l.walkabilityScore,
          nearbyUniversities: l.nearbyUniversities,
          nearbyTransit: l.nearbyTransit,
          viewCount: l.viewCount,
          distance: l.distance,
        })) as Listing[],
      };
    },
  });

  const handleRadiusChange = (newRadius: number) => {
    setMapRadius(newRadius);
    const params = new URLSearchParams(searchParams.toString());
    params.set('radius', newRadius.toString());
    if (mapCenter) {
      params.set('latitude', mapCenter[0].toString());
      params.set('longitude', mapCenter[1].toString());
    }
    router.push(`/listings?${params.toString()}`);
  };

  const handleCenterChange = (newCenter: [number, number]) => {
    setMapCenter(newCenter);
    const params = new URLSearchParams(searchParams.toString());
    params.set('latitude', newCenter[0].toString());
    params.set('longitude', newCenter[1].toString());
    params.set('radius', mapRadius.toString());
    router.push(`/listings?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[600px] rounded-xl bg-grey-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-grey-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] rounded-xl bg-grey-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading map</p>
          <p className="text-sm text-grey-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <MapView
      listings={data?.listings || []}
      center={mapCenter || undefined}
      radius={mapRadius}
      onRadiusChange={handleRadiusChange}
      onCenterChange={handleCenterChange}
    />
  );
}

