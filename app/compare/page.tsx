'use client';

import { useRouter } from 'next/navigation';
import { useComparisonStore } from '@/lib/comparison-store';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Listing } from '@/types';
import {
  X,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  DollarSign,
  Sparkles,
  ExternalLink,
  Trash2,
  ArrowLeft,
  Check,
  X as XIcon,
} from 'lucide-react';
import { imageKitPresets } from '@/lib/imagekit';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ComparePage() {
  const router = useRouter();
  const { listings, removeListing, clearAll } = useComparisonStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Redirect if no listings to compare
    if (isClient && listings.length === 0) {
      router.push('/listings');
    }
  }, [isClient, listings.length, router]);

  if (!isClient || listings.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-grey-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-grey-600 mb-4">No listings to compare</p>
            <Link href="/listings" className="text-primary-600 hover:underline">
              Browse Listings
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleViewListing = (listingId: string) => {
    router.push(`/listings/${listingId}`);
  };

  const allAmenities = new Set<string>();
  listings.forEach((listing) => {
    listing.amenities?.forEach((amenity) => allAmenities.add(amenity));
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-grey-50 pb-20 md:pb-8">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 text-grey-600 hover:text-primary-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Listings</span>
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-grey-900 mb-2">
                  Compare {listings.length} {listings.length === 1 ? 'Listing' : 'Listings'}
                </h1>
                <p className="text-sm sm:text-base text-grey-600">
                  Side-by-side comparison to help you make the best choice
                </p>
              </div>
              <Button onClick={clearAll} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Mobile View: Stacked Cards */}
          <div className="md:hidden space-y-4">
            {listings.map((listing, index) => (
              <div
                key={listing._id}
                className="bg-white rounded-xl shadow-large border border-grey-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="relative">
                  <div className="relative w-full h-48 bg-grey-200">
                    {listing.images?.[0] ? (
                      <img
                        src={
                          listing.images[0].includes('ik.imagekit.io')
                            ? imageKitPresets.card(listing.images[0])
                            : listing.images[0]
                        }
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-grey-400">
                        <Sparkles className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      removeListing(listing._id);
                      if (listings.length === 1) {
                        router.push('/listings');
                      }
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-medium hover:bg-white transition-colors"
                    aria-label="Remove from comparison"
                  >
                    <X className="w-4 h-4 text-grey-600" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-primary-500 text-white px-3 py-1.5 rounded-lg font-bold text-lg shadow-lg">
                    ${listing.price.toLocaleString()}/mo
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-grey-900 mb-1">{listing.title}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-grey-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {listing.location.city}, {listing.location.state}
                        {listing.location.zip && ` ${listing.location.zip}`}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 py-3 border-y border-grey-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-grey-600 mb-1">
                        <BedDouble className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-grey-500">Bedrooms</p>
                      <p className="text-sm font-semibold text-grey-900">
                        {listing.bedrooms !== undefined ? listing.bedrooms : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-grey-600 mb-1">
                        <Bath className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-grey-500">Bathrooms</p>
                      <p className="text-sm font-semibold text-grey-900">
                        {listing.bathrooms !== undefined ? listing.bathrooms : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-grey-600 mb-1">
                        <Ruler className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-grey-500">Size</p>
                      <p className="text-sm font-semibold text-grey-900">
                        {listing.squareFeet ? `${listing.squareFeet.toLocaleString()} sq ft` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-grey-600">Property Type</span>
                      <span className="font-medium text-grey-900 capitalize">
                        {listing.propertyType || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-grey-600">Pet Friendly</span>
                      {listing.petFriendly ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-grey-400 flex items-center gap-1">
                          <XIcon className="w-4 h-4" />
                          No
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-grey-600">Parking</span>
                      {listing.parkingAvailable ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Available
                        </span>
                      ) : (
                        <span className="text-grey-400">Not Available</span>
                      )}
                    </div>
                  </div>

                  {/* Amenities */}
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-grey-700 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Amenities
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleViewListing(listing._id)}
                    variant="primary"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table Layout */}
          <div className="hidden md:block bg-white rounded-xl shadow-large border border-grey-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-grey-200 bg-grey-50">
                    <th className="p-4 text-left text-sm font-semibold text-grey-700 sticky left-0 bg-grey-50 z-10 min-w-[200px]">
                      Feature
                    </th>
                    {listings.map((listing) => (
                      <th key={listing._id} className="p-4 text-left min-w-[280px] bg-white">
                        <div className="space-y-3">
                          {/* Image */}
                          <div className="relative w-full h-48 bg-grey-200 rounded-lg overflow-hidden">
                            {listing.images?.[0] ? (
                              <img
                                src={
                                  listing.images[0].includes('ik.imagekit.io')
                                    ? imageKitPresets.card(listing.images[0])
                                    : listing.images[0]
                                }
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-grey-400">
                                <Sparkles className="w-16 h-16" />
                              </div>
                            )}
                          </div>
                          {/* Title */}
                          <h3 className="font-semibold text-base text-grey-900 line-clamp-2">
                            {listing.title}
                          </h3>
                          {/* Remove button */}
                          <Button
                            onClick={() => {
                              removeListing(listing._id);
                              if (listings.length === 1) {
                                router.push('/listings');
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
                  <tr className="border-b border-grey-100 hover:bg-grey-50/50">
                    <td className="p-4 font-medium text-sm text-grey-700 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Price
                      </div>
                    </td>
                    {listings.map((listing) => (
                      <td key={listing._id} className="p-4">
                        <span className="text-xl font-bold text-primary-600">
                          ${listing.price.toLocaleString()}/mo
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Location */}
                  <tr className="border-b border-grey-100 hover:bg-grey-50/50">
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
                  <tr className="border-b border-grey-100 hover:bg-grey-50/50">
                    <td className="p-4 font-medium text-sm text-grey-700 sticky left-0 bg-white z-10">
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
                  <tr className="border-b border-grey-100 hover:bg-grey-50/50">
                    <td className="p-4 font-medium text-sm text-grey-700 sticky left-0 bg-white z-10">
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
                  <tr className="border-b border-grey-100 hover:bg-grey-50/50">
                    <td className="p-4 font-medium text-sm text-grey-700 sticky left-0 bg-white z-10">
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
                  <tr className="border-b border-grey-100 hover:bg-grey-50/50">
                    <td className="p-4 font-medium text-sm text-grey-700 sticky left-0 bg-white z-10">
                      Property Type
                    </td>
                    {listings.map((listing) => (
                      <td key={listing._id} className="p-4 text-grey-600 capitalize">
                        {listing.propertyType || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  {/* Pet Friendly */}
                  <tr className="border-b border-grey-100 hover:bg-grey-50/50">
                    <td className="p-4 font-medium text-sm text-grey-700 sticky left-0 bg-white z-10">
                      Pet Friendly
                    </td>
                    {listings.map((listing) => (
                      <td key={listing._id} className="p-4">
                        {listing.petFriendly ? (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-grey-400 flex items-center gap-1">
                            <XIcon className="w-4 h-4" />
                            No
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Parking */}
                  <tr className="border-b border-grey-100 hover:bg-grey-50/50">
                    <td className="p-4 font-medium text-sm text-grey-700 sticky left-0 bg-white z-10">
                      Parking
                    </td>
                    {listings.map((listing) => (
                      <td key={listing._id} className="p-4">
                        {listing.parkingAvailable ? (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Available
                          </span>
                        ) : (
                          <span className="text-grey-400">Not Available</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Amenities */}
                  {Array.from(allAmenities).map((amenity) => (
                    <tr key={amenity} className="border-b border-grey-100 hover:bg-grey-50/50">
                      <td className="p-4 font-medium text-sm text-grey-700 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {amenity}
                        </div>
                      </td>
                      {listings.map((listing) => (
                        <td key={listing._id} className="p-4">
                          {listing.amenities?.includes(amenity) ? (
                            <span className="text-green-600 text-lg font-bold">✓</span>
                          ) : (
                            <span className="text-grey-300 text-lg">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Actions */}
                  <tr>
                    <td className="p-4 font-medium text-sm text-grey-700 sticky left-0 bg-white z-10">
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
        </div>
      </main>
      <Footer />
    </>
  );
}

