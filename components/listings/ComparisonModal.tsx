'use client';

import { useRouter } from 'next/navigation';
import { useComparisonStore } from '@/lib/comparison-store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Listing } from '@/types';
import { X, MapPin, BedDouble, Bath, Ruler, DollarSign, Sparkles, ExternalLink, Trash2 } from 'lucide-react';
import { imageKitPresets } from '@/lib/imagekit';
import { useState, useEffect } from 'react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComparisonModal({ isOpen, onClose }: ComparisonModalProps) {
  const router = useRouter();
  const { listings, removeListing, clearAll } = useComparisonStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleOpenComparison = () => {
      // Modal will be opened by parent component
    };
    window.addEventListener('openComparison', handleOpenComparison);
    return () => window.removeEventListener('openComparison', handleOpenComparison);
  }, []);

  if (!isClient || listings.length === 0) {
    return null;
  }

  const handleViewListing = (listingId: string) => {
    router.push(`/listings/${listingId}`);
    onClose();
  };

  const allAmenities = new Set<string>();
  listings.forEach((listing) => {
    listing.amenities?.forEach((amenity) => allAmenities.add(amenity));
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" ariaLabel="Compare listings">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-grey-900">
            Compare {listings.length} {listings.length === 1 ? 'Listing' : 'Listings'}
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={clearAll} variant="outline" size="sm">
              Clear All
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5 text-grey-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-grey-200">
                <th className="p-4 text-left text-sm font-semibold text-grey-700 sticky left-0 bg-white z-10">
                  Feature
                </th>
                {listings.map((listing) => (
                  <th key={listing._id} className="p-4 text-left min-w-[280px]">
                    <div className="space-y-3">
                      {/* Image */}
                      <div className="relative w-full h-40 bg-grey-200 rounded-lg overflow-hidden">
                        {listing.images?.[0] ? (
                          <img
                            src={
                              listing.images[0].includes('ik.imagekit.io')
                                ? imageKitPresets.thumbnail(listing.images[0])
                                : listing.images[0]
                            }
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-grey-400">
                            <Sparkles className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      {/* Title */}
                      <h3 className="font-semibold text-grey-900 line-clamp-2">{listing.title}</h3>
                      {/* Remove button */}
                      <Button
                        onClick={() => {
                          removeListing(listing._id);
                          if (listings.length === 1) {
                            onClose();
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <tr className="border-b border-grey-100">
                <td className="p-4 font-medium text-grey-700 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price
                  </div>
                </td>
                {listings.map((listing) => (
                  <td key={listing._id} className="p-4">
                    <span className="text-lg font-bold text-primary-600">
                      ${listing.price.toLocaleString()}/mo
                    </span>
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr className="border-b border-grey-100">
                <td className="p-4 font-medium text-grey-700 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </div>
                </td>
                {listings.map((listing) => (
                  <td key={listing._id} className="p-4 text-grey-600">
                    {listing.location.city}, {listing.location.state}
                    {listing.location.zip && ` ${listing.location.zip}`}
                  </td>
                ))}
              </tr>

              {/* Bedrooms */}
              <tr className="border-b border-grey-100">
                <td className="p-4 font-medium text-grey-700 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4" />
                    Bedrooms
                  </div>
                </td>
                {listings.map((listing) => (
                  <td key={listing._id} className="p-4 text-grey-600">
                    {listing.bedrooms !== undefined ? listing.bedrooms : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Bathrooms */}
              <tr className="border-b border-grey-100">
                <td className="p-4 font-medium text-grey-700 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4" />
                    Bathrooms
                  </div>
                </td>
                {listings.map((listing) => (
                  <td key={listing._id} className="p-4 text-grey-600">
                    {listing.bathrooms !== undefined ? listing.bathrooms : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Square Feet */}
              <tr className="border-b border-grey-100">
                <td className="p-4 font-medium text-grey-700 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Square Feet
                  </div>
                </td>
                {listings.map((listing) => (
                  <td key={listing._id} className="p-4 text-grey-600">
                    {listing.squareFeet ? `${listing.squareFeet.toLocaleString()} sq ft` : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Property Type */}
              <tr className="border-b border-grey-100">
                <td className="p-4 font-medium text-grey-700 sticky left-0 bg-white z-10">
                  Property Type
                </td>
                {listings.map((listing) => (
                  <td key={listing._id} className="p-4 text-grey-600 capitalize">
                    {listing.propertyType || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Pet Friendly */}
              <tr className="border-b border-grey-100">
                <td className="p-4 font-medium text-grey-700 sticky left-0 bg-white z-10">
                  Pet Friendly
                </td>
                {listings.map((listing) => (
                  <td key={listing._id} className="p-4">
                    {listing.petFriendly ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-grey-400">No</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Parking */}
              <tr className="border-b border-grey-100">
                <td className="p-4 font-medium text-grey-700 sticky left-0 bg-white z-10">
                  Parking
                </td>
                {listings.map((listing) => (
                  <td key={listing._id} className="p-4">
                    {listing.parkingAvailable ? (
                      <span className="text-green-600 font-medium">Available</span>
                    ) : (
                      <span className="text-grey-400">Not Available</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Amenities */}
              {Array.from(allAmenities).map((amenity) => (
                <tr key={amenity} className="border-b border-grey-100">
                  <td className="p-4 font-medium text-grey-700 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {amenity}
                    </div>
                  </td>
                  {listings.map((listing) => (
                    <td key={listing._id} className="p-4">
                      {listing.amenities?.includes(amenity) ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-grey-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Actions */}
              <tr>
                <td className="p-4 font-medium text-grey-700 sticky left-0 bg-white z-10">
                  Actions
                </td>
                {listings.map((listing) => (
                  <td key={listing._id} className="p-4">
                    <Button
                      onClick={() => handleViewListing(listing._id)}
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

