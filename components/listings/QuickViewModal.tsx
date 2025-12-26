'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Heart, MapPin, BedDouble, Bath, Ruler, Calendar, Sparkles, ExternalLink, MessageSquare } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Listing } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { imageKitPresets } from '@/lib/imagekit';
import { highlightSearchTermsReact } from '@/lib/search-highlight';

interface QuickViewModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ listing, isOpen, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if listing is favorited
  useEffect(() => {
    if (listing && isAuthenticated) {
      api.get(`/favorites/check/${listing._id}`)
        .then((res) => {
          if (res.data.success) {
            setIsFavorite(res.data.data.isFavorite);
          }
        })
        .catch(() => {
          setIsFavorite(false);
        });
    }
  }, [listing, isAuthenticated]);

  // Reset image index when listing changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [listing?._id]);

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!listing) return;
      if (isFavorite) {
        await api.delete(`/favorites/${listing._id}`);
      } else {
        await api.post(`/favorites/${listing._id}`);
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (!listing) return null;

  const currentImage = listing.images?.[currentImageIndex] || listing.images?.[0] || '/placeholder-listing.jpg';
  const formattedDate = listing.availabilityDate
    ? new Date(listing.availabilityDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not specified';

  const handleViewFullDetails = () => {
    router.push(`/listings/${listing._id}`);
    onClose();
  };

  const handleContactLandlord = () => {
    router.push(`/chat?listingId=${listing._id}`);
    onClose();
  };

  const nextImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" ariaLabel={`Quick view: ${listing.title}`}>
      <div className="relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
          aria-label="Close quick view"
        >
          <X className="w-5 h-5 text-grey-700" />
        </button>

        {/* Image Gallery */}
        <div className="relative h-64 md:h-80 bg-grey-200 rounded-t-xl overflow-hidden group">
          {listing.images && listing.images.length > 0 ? (
            <>
              <img
                src={
                  currentImage.includes('ik.imagekit.io')
                    ? imageKitPresets.lightbox(currentImage)
                    : currentImage
                }
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <X className="w-5 h-5 text-grey-700 rotate-90" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <X className="w-5 h-5 text-grey-700 -rotate-90" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {listing.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-grey-400">
              <Sparkles className="w-16 h-16" />
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-4 left-4 bg-primary-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
            ${listing.price.toLocaleString()}/mo
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title and Location */}
          <div>
            <h2 className="text-2xl font-bold text-grey-900 mb-2">
              {searchQuery ? (
                <span>{highlightSearchTermsReact(listing.title, searchQuery)}</span>
              ) : (
                listing.title
              )}
            </h2>
            <div className="flex items-center gap-2 text-grey-600">
              <MapPin className="w-4 h-4" />
              <span>
                {searchQuery ? (
                  <>
                    {highlightSearchTermsReact(listing.location.city, searchQuery)},{' '}
                    {highlightSearchTermsReact(listing.location.state, searchQuery)}
                    {listing.location.zip && ` ${listing.location.zip}`}
                  </>
                ) : (
                  `${listing.location.city}, ${listing.location.state}${listing.location.zip ? ` ${listing.location.zip}` : ''}`
                )}
              </span>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-6 text-sm text-grey-600">
            {listing.bedrooms !== undefined && (
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4" />
                <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
              </div>
            )}
            {listing.bathrooms !== undefined && (
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4" />
                <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
              </div>
            )}
            {listing.squareFeet !== undefined && (
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                <span>{listing.squareFeet.toLocaleString()} sq ft</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-grey-700 line-clamp-3">
            {searchQuery ? (
              <span>{highlightSearchTermsReact(listing.description, searchQuery)}</span>
            ) : (
              listing.description
            )}
          </p>

          {/* Amenities Preview */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <div className="flex gap-2 flex-wrap">
                {listing.amenities.slice(0, 5).map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2 py-1 bg-grey-100 text-grey-700 text-xs rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
                {listing.amenities.length > 5 && (
                  <span className="px-2 py-1 bg-grey-100 text-grey-700 text-xs rounded-full">
                    +{listing.amenities.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center gap-2 text-sm text-grey-600">
            <Calendar className="w-4 h-4" />
            <span>Available: {formattedDate}</span>
          </div>

          {/* Distance (if available) */}
          {listing.distance !== undefined && (
            <div className="flex items-center gap-2 text-sm text-grey-600">
              <MapPin className="w-4 h-4 text-primary-400" />
              <span>{listing.distance.toFixed(1)} miles away</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-grey-200">
            <Button
              onClick={handleViewFullDetails}
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Details
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  onClick={() => toggleFavorite.mutate()}
                  variant="outline"
                  className="px-4"
                  disabled={toggleFavorite.isPending}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-grey-400'
                    }`}
                  />
                </Button>
                <Button
                  onClick={handleContactLandlord}
                  variant="outline"
                  className="px-4"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

