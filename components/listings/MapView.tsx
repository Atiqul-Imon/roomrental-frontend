'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Listing } from '@/types';
import { MapPin, DollarSign, Navigation } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { imageKitPresets } from '@/lib/imagekit';

// Fix for default marker icons in Next.js
// Use direct paths to avoid Next.js image optimization issues
const DefaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Set default icon globally to prevent errors
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  });
}

interface MapViewProps {
  listings: Listing[];
  center?: [number, number];
  radius?: number;
  onRadiusChange?: (radius: number) => void;
  onCenterChange?: (center: [number, number]) => void;
}

// Component to handle map center updates and track map moves
function MapCenterHandler({ 
  center, 
  onCenterChange 
}: { 
  center: [number, number];
  onCenterChange?: (center: [number, number]) => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  useEffect(() => {
    if (!onCenterChange) return;
    
    const handleMoveEnd = () => {
      const newCenter = map.getCenter();
      const newCenterArray: [number, number] = [newCenter.lat, newCenter.lng];
      onCenterChange(newCenterArray);
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onCenterChange]);

  return null;
}

export function MapView({ listings, center, radius = 10, onRadiusChange, onCenterChange }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    center || [39.8283, -98.5795] // Default to center of USA
  );
  const [mapRadius, setMapRadius] = useState(radius);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Ensure Leaflet default icon is set before rendering markers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      // Ensure default icon is properly configured
      if (!L.Icon.Default.prototype._getIconUrl) {
        L.Icon.Default.prototype._getIconUrl = function (name: string) {
          return `https://unpkg.com/leaflet@1.9.4/dist/images/${name}`;
        };
      }
      setIsMapReady(true);
    }
  }, []);

  // Update center from props
  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  // Update radius from props
  useEffect(() => {
    if (radius) {
      setMapRadius(radius);
    }
  }, [radius]);

  // Calculate center from listings if no center provided
  useEffect(() => {
    if (!center && listings.length > 0) {
      const listingsWithCoords = listings.filter(
        (l) => l.location.coordinates?.lat && l.location.coordinates?.lng
      );
      if (listingsWithCoords.length > 0) {
        const avgLat =
          listingsWithCoords.reduce((sum, l) => sum + (l.location.coordinates?.lat || 0), 0) /
          listingsWithCoords.length;
        const avgLng =
          listingsWithCoords.reduce((sum, l) => sum + (l.location.coordinates?.lng || 0), 0) /
          listingsWithCoords.length;
        setMapCenter([avgLat, avgLng]);
      }
    }
  }, [listings, center]);

  const handleRadiusChange = (newRadius: number) => {
    setMapRadius(newRadius);
    onRadiusChange?.(newRadius);
  };

  // Convert radius from miles to meters for Leaflet Circle
  const radiusInMeters = mapRadius * 1609.34;

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-grey-200 shadow-large">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 space-y-3 min-w-[200px]">
        <div>
          <label className="block text-sm font-medium text-grey-700 mb-2">
            Search Radius: {mapRadius} miles
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={mapRadius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-full h-2 bg-grey-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-xs text-grey-500 mt-1">
            <span>1 mi</span>
            <span>50 mi</span>
          </div>
        </div>
        <div className="text-xs text-grey-600">
          <p className="font-medium mb-1">Listings: {listings.length}</p>
          {listings.length > 0 && (
            <p className="text-grey-500">
              {listings.filter((l) => l.location.coordinates).length} with location
            </p>
          )}
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Center Handler */}
        <MapCenterHandler center={mapCenter} onCenterChange={onCenterChange} />

        {/* Radius Circle */}
        {mapCenter && (
          <Circle
            center={mapCenter}
            radius={radiusInMeters}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        )}

        {/* Listings Markers */}
        {isMapReady && listings
          .filter((listing) => listing.location.coordinates?.lat && listing.location.coordinates?.lng)
          .map((listing) => {
            const position: [number, number] = [
              listing.location.coordinates!.lat,
              listing.location.coordinates!.lng,
            ];
            const imageUrl = listing.images[0]
              ? listing.images[0].includes('ik.imagekit.io')
                ? imageKitPresets.card(listing.images[0])
                : listing.images[0]
              : '/placeholder-room.jpg';

            return (
              <Marker
                key={listing._id}
                position={position}
                icon={DefaultIcon}
                eventHandlers={{
                  click: () => setSelectedListing(listing),
                }}
              >
                <Popup className="custom-popup" maxWidth={300}>
                  <div className="p-2">
                    <Link
                      href={`/listings/${listing._id}`}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      {listing.images[0] && (
                        <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 300px) 100vw, 300px"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-sm text-grey-900 mb-1 line-clamp-1">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-grey-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {listing.location.city}, {listing.location.state}
                        </span>
                        {listing.distance !== undefined && (
                          <>
                            <span className="mx-1">•</span>
                            <Navigation className="w-3 h-3" />
                            <span>{listing.distance.toFixed(1)} mi</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-primary-600 font-bold">
                        <DollarSign className="w-4 h-4" />
                        <span>${listing.price}</span>
                        <span className="text-xs font-normal text-grey-600">/mo</span>
                      </div>
                      {listing.bedrooms && (
                        <p className="text-xs text-grey-500 mt-1">
                          {listing.bedrooms} bed • {listing.bathrooms} bath
                          {listing.squareFeet && ` • ${listing.squareFeet} sq ft`}
                        </p>
                      )}
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Selected Listing Card (Desktop) */}
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] lg:right-auto lg:w-80">
          <div className="bg-white rounded-lg shadow-xl border border-grey-200 p-4">
            <Link
              href={`/listings/${selectedListing._id}`}
              className="block hover:opacity-80 transition-opacity"
            >
              {selectedListing.images[0] && (
                <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={
                      selectedListing.images[0].includes('ik.imagekit.io')
                        ? imageKitPresets.card(selectedListing.images[0])
                        : selectedListing.images[0]
                    }
                    alt={selectedListing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 320px) 100vw, 320px"
                  />
                </div>
              )}
              <h3 className="font-semibold text-base text-grey-900 mb-2 line-clamp-1">
                {selectedListing.title}
              </h3>
              <div className="flex items-center gap-1 text-sm text-grey-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>
                  {selectedListing.location.city}, {selectedListing.location.state}
                </span>
                {selectedListing.distance !== undefined && (
                  <>
                    <span className="mx-1">•</span>
                    <Navigation className="w-4 h-4" />
                    <span>{selectedListing.distance.toFixed(1)} mi</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 text-primary-600 font-bold text-lg mb-2">
                <DollarSign className="w-5 h-5" />
                <span>${selectedListing.price}</span>
                <span className="text-sm font-normal text-grey-600">/mo</span>
              </div>
              {selectedListing.bedrooms && (
                <p className="text-sm text-grey-500">
                  {selectedListing.bedrooms} bed • {selectedListing.bathrooms} bath
                  {selectedListing.squareFeet && ` • ${selectedListing.squareFeet} sq ft`}
                </p>
              )}
            </Link>
            <button
              onClick={() => setSelectedListing(null)}
              className="mt-3 w-full px-4 py-2 bg-grey-100 text-grey-700 rounded-lg hover:bg-grey-200 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

