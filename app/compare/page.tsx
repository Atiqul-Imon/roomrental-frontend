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
  Trophy,
  Star,
  TrendingDown,
  Award,
  Zap,
  Heart,
  Shield,
} from 'lucide-react';
import { imageKitPresets } from '@/lib/imagekit';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function ComparePage() {
  const router = useRouter();
  const { listings, removeListing, clearAll } = useComparisonStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && listings.length === 0) {
      router.push('/listings');
    }
  }, [isClient, listings.length, router]);

  // Calculate best value (lowest price per square foot)
  const bestValue = useMemo(() => {
    if (listings.length === 0) return null;
    const withSqft = listings.filter((l) => l.squareFeet && l.squareFeet > 0);
    if (withSqft.length === 0) return null;
    const cheapest = listings.reduce((min, l) => (l.price < min.price ? l : min));
    const bestValueListing = withSqft.reduce((best, l) => {
      const bestValue = best.price / (best.squareFeet || 1);
      const currentValue = l.price / (l.squareFeet || 1);
      return currentValue < bestValue ? l : best;
    });
    return { cheapest: cheapest._id, bestValue: bestValueListing._id };
  }, [listings]);

  // Get all unique amenities
  const allAmenities = useMemo(() => {
    const amenities = new Set<string>();
    listings.forEach((listing) => {
      listing.amenities?.forEach((amenity) => amenities.add(amenity));
    });
    return Array.from(amenities);
  }, [listings]);

  if (!isClient || listings.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-grey-50 via-primary-50/20 to-secondary-50/20 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl p-8 shadow-xl border border-grey-200">
            <Sparkles className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <p className="text-grey-600 mb-4 text-lg">No listings to compare</p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
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

  const getPricePerSqft = (listing: Listing) => {
    if (!listing.squareFeet || listing.squareFeet === 0) return null;
    return (listing.price / listing.squareFeet).toFixed(2);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-grey-50 via-primary-50/20 to-secondary-50/20 pb-20 md:pb-8">
        {/* Premium Header with Gradient */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white">
          <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 sm:mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Listings</span>
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold">
                    Compare {listings.length} {listings.length === 1 ? 'Listing' : 'Listings'}
                  </h1>
                </div>
                <p className="text-white/90 text-sm sm:text-base md:text-lg">
                  Smart comparison to help you find your perfect room 🎓
                </p>
              </div>
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10">
          {/* Quick Summary Cards - Desktop Only */}
          <div className="hidden lg:grid grid-cols-3 gap-4 mb-8">
            {listings.map((listing) => {
              const pricePerSqft = getPricePerSqft(listing);
              const isCheapest = bestValue?.cheapest === listing._id;
              const isBestValue = bestValue?.bestValue === listing._id;

              return (
                <div
                  key={listing._id}
                  className={`bg-white rounded-xl p-5 shadow-large border-2 transition-all hover:shadow-xl ${
                    isBestValue
                      ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-white'
                      : isCheapest
                      ? 'border-secondary-500 bg-gradient-to-br from-secondary-50 to-white'
                      : 'border-grey-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading font-bold text-lg text-grey-900 line-clamp-1">
                      {listing.title}
                    </h3>
                    {isBestValue && (
                      <div className="flex items-center gap-1 bg-primary-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        <Award className="w-3 h-3" />
                        Best Value
                      </div>
                    )}
                    {isCheapest && !isBestValue && (
                      <div className="flex items-center gap-1 bg-secondary-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        <TrendingDown className="w-3 h-3" />
                        Cheapest
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-grey-600">Price</span>
                      <span className="text-xl font-bold text-primary-600">
                        ${listing.price.toLocaleString()}/mo
                      </span>
                    </div>
                    {pricePerSqft && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-grey-600">Per sq ft</span>
                        <span className="text-sm font-semibold text-grey-900">
                          ${pricePerSqft}/sqft
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-grey-600">
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-4 h-4" />
                        {listing.bedrooms || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {listing.bathrooms || 'N/A'}
                      </span>
                      {listing.squareFeet && (
                        <span className="flex items-center gap-1">
                          <Ruler className="w-4 h-4" />
                          {listing.squareFeet.toLocaleString()} sqft
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile View: Premium Stacked Cards */}
          <div className="md:hidden space-y-5">
            {listings.map((listing, index) => {
              const pricePerSqft = getPricePerSqft(listing);
              const isCheapest = bestValue?.cheapest === listing._id;
              const isBestValue = bestValue?.bestValue === listing._id;

              return (
                <div
                  key={listing._id}
                  className={`bg-white rounded-2xl shadow-xl border-2 overflow-hidden transition-all ${
                    isBestValue
                      ? 'border-primary-500 ring-4 ring-primary-100'
                      : isCheapest
                      ? 'border-secondary-500 ring-4 ring-secondary-100'
                      : 'border-grey-200'
                  }`}
                  style={{
                    animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Premium Image Header */}
                  <div className="relative">
                    <div className="relative w-full h-56 bg-gradient-to-br from-grey-200 to-grey-300 overflow-hidden">
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
                          <Sparkles className="w-20 h-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {isBestValue && (
                        <div className="flex items-center gap-1.5 bg-primary-500 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
                          <Award className="w-4 h-4" />
                          <span className="font-bold text-sm">Best Value</span>
                        </div>
                      )}
                      {isCheapest && !isBestValue && (
                        <div className="flex items-center gap-1.5 bg-secondary-500 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
                          <TrendingDown className="w-4 h-4" />
                          <span className="font-bold text-sm">Cheapest</span>
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
                      className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl hover:bg-white transition-all hover:scale-110"
                      aria-label="Remove from comparison"
                    >
                      <X className="w-5 h-5 text-grey-700" />
                    </button>

                    {/* Price Badge */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-xl">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <p className="text-xs text-grey-600 mb-0.5">Monthly Rent</p>
                            <p className="text-2xl font-bold text-primary-600">
                              ${listing.price.toLocaleString()}
                            </p>
                          </div>
                          {pricePerSqft && (
                            <div className="text-right">
                              <p className="text-xs text-grey-600 mb-0.5">Per sq ft</p>
                              <p className="text-sm font-bold text-grey-900">${pricePerSqft}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium Card Content */}
                  <div className="p-5 space-y-5">
                    {/* Title & Location */}
                    <div>
                      <h3 className="font-heading text-xl font-bold text-grey-900 mb-2">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-2 text-grey-600">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span className="text-sm">
                          {listing.location.city}, {listing.location.state}
                          {listing.location.zip && ` ${listing.location.zip}`}
                        </span>
                      </div>
                    </div>

                    {/* Quick Stats - Premium Design */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-3 text-center border border-primary-200/50">
                        <BedDouble className="w-5 h-5 text-primary-600 mx-auto mb-1.5" />
                        <p className="text-xs text-grey-600 mb-0.5">Bedrooms</p>
                        <p className="text-lg font-bold text-grey-900">
                          {listing.bedrooms !== undefined ? listing.bedrooms : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-secondary-50 to-secondary-100/50 rounded-xl p-3 text-center border border-secondary-200/50">
                        <Bath className="w-5 h-5 text-secondary-600 mx-auto mb-1.5" />
                        <p className="text-xs text-grey-600 mb-0.5">Bathrooms</p>
                        <p className="text-lg font-bold text-grey-900">
                          {listing.bathrooms !== undefined ? listing.bathrooms : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-3 text-center border border-green-200/50">
                        <Ruler className="w-5 h-5 text-green-600 mx-auto mb-1.5" />
                        <p className="text-xs text-grey-600 mb-0.5">Size</p>
                        <p className="text-lg font-bold text-grey-900">
                          {listing.squareFeet ? `${listing.squareFeet.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="bg-grey-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-grey-700">Property Type</span>
                        <span className="text-sm font-bold text-grey-900 capitalize px-3 py-1 bg-white rounded-lg">
                          {listing.propertyType || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-grey-700 flex items-center gap-1.5">
                          <Heart className="w-4 h-4" />
                          Pet Friendly
                        </span>
                        {listing.petFriendly ? (
                          <span className="flex items-center gap-1.5 text-green-600 font-bold">
                            <Check className="w-5 h-5" />
                            Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-grey-400">
                            <XIcon className="w-5 h-5" />
                            No
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-grey-700 flex items-center gap-1.5">
                          <Zap className="w-4 h-4" />
                          Parking
                        </span>
                        {listing.parkingAvailable ? (
                          <span className="flex items-center gap-1.5 text-green-600 font-bold">
                            <Check className="w-5 h-5" />
                            Available
                          </span>
                        ) : (
                          <span className="text-grey-400">Not Available</span>
                        )}
                      </div>
                    </div>

                    {/* Amenities - Premium Tags */}
                    {listing.amenities && listing.amenities.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary-500" />
                          Amenities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {listing.amenities.map((amenity) => (
                            <span
                              key={amenity}
                              className="px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-xs font-semibold shadow-md"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button - Premium */}
                    <Button
                      onClick={() => handleViewListing(listing._id)}
                      variant="primary"
                      className="w-full py-3 text-base font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      View Full Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Premium Table Layout */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-2xl border border-grey-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary-600 to-primary-500 text-white">
                      <th className="p-5 text-left text-sm font-bold sticky left-0 bg-primary-600 z-20 min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Feature
                        </div>
                      </th>
                      {listings.map((listing) => {
                        const isCheapest = bestValue?.cheapest === listing._id;
                        const isBestValue = bestValue?.bestValue === listing._id;

                        return (
                          <th
                            key={listing._id}
                            className={`p-5 text-left min-w-[300px] ${
                              isBestValue
                                ? 'bg-gradient-to-b from-primary-50 to-white'
                                : isCheapest
                                ? 'bg-gradient-to-b from-secondary-50 to-white'
                                : 'bg-white'
                            }`}
                          >
                            <div className="space-y-4">
                              {/* Badge */}
                              <div className="flex items-start justify-between gap-2">
                                {isBestValue && (
                                  <div className="flex items-center gap-1.5 bg-primary-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                                    <Award className="w-3.5 h-3.5" />
                                    Best Value
                                  </div>
                                )}
                                {isCheapest && !isBestValue && (
                                  <div className="flex items-center gap-1.5 bg-secondary-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                                    <TrendingDown className="w-3.5 h-3.5" />
                                    Cheapest
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    removeListing(listing._id);
                                    if (listings.length === 1) {
                                      router.push('/listings');
                                    }
                                  }}
                                  className="p-1.5 hover:bg-grey-100 rounded-lg transition-colors ml-auto"
                                  aria-label="Remove from comparison"
                                >
                                  <Trash2 className="w-4 h-4 text-grey-600" />
                                </button>
                              </div>

                              {/* Image */}
                              <div className="relative w-full h-56 bg-grey-200 rounded-xl overflow-hidden shadow-lg group">
                                {listing.images?.[0] ? (
                                  <img
                                    src={
                                      listing.images[0].includes('ik.imagekit.io')
                                        ? imageKitPresets.card(listing.images[0])
                                        : listing.images[0]
                                    }
                                    alt={listing.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-grey-400">
                                    <Sparkles className="w-20 h-20" />
                                  </div>
                                )}
                              </div>

                              {/* Title */}
                              <h3 className="font-heading font-bold text-lg text-grey-900 line-clamp-2">
                                {listing.title}
                              </h3>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Price - Highlighted */}
                    <tr className="border-b-2 border-grey-200 bg-gradient-to-r from-grey-50 to-white hover:from-primary-50/30 hover:to-white transition-colors">
                      <td className="p-5 font-bold text-base text-grey-900 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-primary-600" />
                          Price
                        </div>
                      </td>
                      {listings.map((listing) => {
                        const pricePerSqft = getPricePerSqft(listing);
                        const isCheapest = bestValue?.cheapest === listing._id;

                        return (
                          <td key={listing._id} className="p-5">
                            <div className="space-y-1">
                              <span className="text-2xl font-bold text-primary-600">
                                ${listing.price.toLocaleString()}/mo
                              </span>
                              {pricePerSqft && (
                                <p className="text-sm text-grey-600">
                                  ${pricePerSqft}/sqft
                                  {isCheapest && (
                                    <span className="ml-2 text-xs bg-secondary-100 text-secondary-700 px-2 py-0.5 rounded-full font-semibold">
                                      Best Price
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Location */}
                    <tr className="border-b border-grey-100 hover:bg-grey-50/50 transition-colors">
                      <td className="p-5 font-semibold text-grey-900 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary-600" />
                          Location
                        </div>
                      </td>
                      {listings.map((listing) => (
                        <td key={listing._id} className="p-5 text-grey-700">
                          {listing.location.city}, {listing.location.state}
                          {listing.location.zip && ` ${listing.location.zip}`}
                        </td>
                      ))}
                    </tr>

                    {/* Bedrooms */}
                    <tr className="border-b border-grey-100 hover:bg-grey-50/50 transition-colors">
                      <td className="p-5 font-semibold text-grey-900 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <BedDouble className="w-5 h-5 text-primary-600" />
                          Bedrooms
                        </div>
                      </td>
                      {listings.map((listing) => (
                        <td key={listing._id} className="p-5 text-grey-700 font-medium">
                          {listing.bedrooms !== undefined ? listing.bedrooms : 'N/A'}
                        </td>
                      ))}
                    </tr>

                    {/* Bathrooms */}
                    <tr className="border-b border-grey-100 hover:bg-grey-50/50 transition-colors">
                      <td className="p-5 font-semibold text-grey-900 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <Bath className="w-5 h-5 text-primary-600" />
                          Bathrooms
                        </div>
                      </td>
                      {listings.map((listing) => (
                        <td key={listing._id} className="p-5 text-grey-700 font-medium">
                          {listing.bathrooms !== undefined ? listing.bathrooms : 'N/A'}
                        </td>
                      ))}
                    </tr>

                    {/* Square Feet */}
                    <tr className="border-b border-grey-100 hover:bg-grey-50/50 transition-colors">
                      <td className="p-5 font-semibold text-grey-900 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <Ruler className="w-5 h-5 text-primary-600" />
                          Square Feet
                        </div>
                      </td>
                      {listings.map((listing) => (
                        <td key={listing._id} className="p-5 text-grey-700 font-medium">
                          {listing.squareFeet ? `${listing.squareFeet.toLocaleString()} sq ft` : 'N/A'}
                        </td>
                      ))}
                    </tr>

                    {/* Property Type */}
                    <tr className="border-b border-grey-100 hover:bg-grey-50/50 transition-colors">
                      <td className="p-5 font-semibold text-grey-900 sticky left-0 bg-white z-10">
                        Property Type
                      </td>
                      {listings.map((listing) => (
                        <td key={listing._id} className="p-5">
                          <span className="px-3 py-1.5 bg-grey-100 text-grey-900 rounded-lg text-sm font-semibold capitalize">
                            {listing.propertyType || 'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Pet Friendly */}
                    <tr className="border-b border-grey-100 hover:bg-grey-50/50 transition-colors">
                      <td className="p-5 font-semibold text-grey-900 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-primary-600" />
                          Pet Friendly
                        </div>
                      </td>
                      {listings.map((listing) => (
                        <td key={listing._id} className="p-5">
                          {listing.petFriendly ? (
                            <span className="inline-flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg">
                              <Check className="w-5 h-5" />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-grey-400 bg-grey-50 px-3 py-1.5 rounded-lg">
                              <XIcon className="w-5 h-5" />
                              No
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Parking */}
                    <tr className="border-b border-grey-100 hover:bg-grey-50/50 transition-colors">
                      <td className="p-5 font-semibold text-grey-900 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-primary-600" />
                          Parking
                        </div>
                      </td>
                      {listings.map((listing) => (
                        <td key={listing._id} className="p-5">
                          {listing.parkingAvailable ? (
                            <span className="inline-flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg">
                              <Check className="w-5 h-5" />
                              Available
                            </span>
                          ) : (
                            <span className="text-grey-400 bg-grey-50 px-3 py-1.5 rounded-lg">
                              Not Available
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Amenities */}
                    {allAmenities.map((amenity) => (
                      <tr key={amenity} className="border-b border-grey-100 hover:bg-grey-50/50 transition-colors">
                        <td className="p-5 font-semibold text-grey-900 sticky left-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary-600" />
                            {amenity}
                          </div>
                        </td>
                        {listings.map((listing) => (
                          <td key={listing._id} className="p-5">
                            {listing.amenities?.includes(amenity) ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-lg font-bold text-lg">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-grey-100 text-grey-300 rounded-lg text-lg">
                                —
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Actions */}
                    <tr className="bg-gradient-to-r from-grey-50 to-white">
                      <td className="p-5 font-semibold text-grey-900 sticky left-0 bg-white z-10">
                        Actions
                      </td>
                      {listings.map((listing) => (
                        <td key={listing._id} className="p-5">
                          <Button
                            onClick={() => handleViewListing(listing._id)}
                            variant="primary"
                            size="sm"
                            className="w-full shadow-md hover:shadow-lg transition-all"
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
        </div>
      </main>
      <Footer />
    </>
  );
}
