'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Heart, MapPin, BedDouble, Bath, Ruler, Calendar, Sparkles, ExternalLink, MessageSquare, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Listing } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { chatApi } from '@/lib/chat-api';
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
  const { isAuthenticated, user } = useAuth();
  const { openChat } = useChat();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isContacting, setIsContacting] = useState(false);

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

  // Reset loading state when modal closes or listing changes
  useEffect(() => {
    if (!isOpen) {
      setIsNavigating(false);
    }
  }, [isOpen]);

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

  const contactMutation = useMutation({
    mutationFn: async () => {
      if (!listing) {
        throw new Error('Listing not available');
      }

      if (!isAuthenticated || !user) {
        router.push(`/auth/login?redirect=/listings/${listing._id}`);
        return null;
      }

      const landlordId = listing.landlordId._id;

      // Don't allow contacting yourself
      if (user.id === landlordId) {
        throw new Error("You can't contact yourself");
      }

      // Create or get conversation
      const conversation = await chatApi.createOrGetConversation(landlordId, listing._id);
      return conversation;
    },
    onSuccess: (conversation) => {
      if (conversation) {
        // Check if desktop or mobile
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
          // Desktop: Open chat sidebar (Facebook-style)
          openChat(conversation.id);
        } else {
          // Mobile: Navigate to conversation page
          router.push(`/messages/${conversation.id}`);
        }
        onClose();
        setIsContacting(false);
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || error.message || 'Failed to start conversation');
      setIsContacting(false);
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
    setIsNavigating(true);
    // Close modal first, then navigate
    onClose();
    // Use setTimeout to ensure modal closes before navigation
    setTimeout(() => {
      router.push(`/listings/${listing._id}`);
    }, 150);
  };

  const handleContactLandlord = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/listings/${listing._id}`);
      return;
    }

    setIsContacting(true);
    contactMutation.mutate();
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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      ariaLabel={`Quick view: ${listing.title}`}
      showCloseButton={true}
      closeOnOverlayClick={true}
    >
      <div className="relative" style={{ marginLeft: '-1px', marginRight: '-1px', width: 'calc(100% + 2px)' }}>
        {/* Image Gallery */}
        <div className="relative bg-white overflow-hidden group w-full">
          {listing.images && listing.images.length > 0 ? (
            <>
              <div style={{ width: '100%', margin: 0, padding: 0, lineHeight: 0, fontSize: 0 }}>
                <img
                  src={
                    currentImage.includes('ik.imagekit.io')
                      ? imageKitPresets.lightbox(currentImage)
                      : currentImage
                  }
                  alt={listing.title}
                  className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] object-contain"
                  style={{ 
                    display: 'block', 
                    margin: 0, 
                    padding: 0, 
                    width: '100%', 
                    border: 'none', 
                    outline: 'none',
                    verticalAlign: 'top',
                    lineHeight: 0,
                    boxSizing: 'border-box',
                    fontSize: '0'
                  }} 
                />
              </div>
              
              {/* Image Navigation */}
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 sm:p-2.5 shadow-lg z-10 transition-all touch-target"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-grey-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 sm:p-2.5 shadow-lg z-10 transition-all touch-target"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-grey-700" />
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
            <div className="w-full min-h-[200px] sm:min-h-[300px] flex items-center justify-center text-grey-400">
              <Sparkles className="w-16 h-16" />
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-gradient-warm text-white px-3 py-1.5 rounded-lg font-bold text-sm sm:text-base shadow-lg z-10">
            ${listing.price.toLocaleString()}/mo
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 space-y-2.5 sm:space-y-3">
          {/* Title and Location */}
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-grey-900 leading-tight">
              {searchQuery ? (
                <span>{highlightSearchTermsReact(listing.title, searchQuery)}</span>
              ) : (
                listing.title
              )}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-grey-600">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="break-words">
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
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-grey-600 flex-wrap">
            {listing.bedrooms !== undefined && (
              <div className="flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5" />
                <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
              </div>
            )}
            {listing.bathrooms !== undefined && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5" />
                <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
              </div>
            )}
            {listing.squareFeet !== undefined && (
              <div className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                <span>{listing.squareFeet.toLocaleString()} sq ft</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-grey-700 line-clamp-2 leading-relaxed">
            {searchQuery ? (
              <span>{highlightSearchTermsReact(listing.description, searchQuery)}</span>
            ) : (
              listing.description
            )}
          </p>

          {/* Amenities and Availability - Combined Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Amenities Preview */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Sparkles className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                <div className="flex gap-1.5 flex-wrap">
                  {listing.amenities.slice(0, 4).map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2 py-0.5 bg-grey-100 text-grey-700 text-xs rounded-md font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                  {listing.amenities.length > 4 && (
                    <span className="px-2 py-0.5 bg-grey-100 text-grey-700 text-xs rounded-md font-medium">
                      +{listing.amenities.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-grey-600">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">{formattedDate}</span>
            </div>
          </div>

          {/* Distance (if available) */}
          {listing.distance !== undefined && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-grey-600">
              <MapPin className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
              <span>{listing.distance.toFixed(1)} miles away</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2.5 border-t border-grey-200">
            <Button
              onClick={handleViewFullDetails}
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2 min-h-[44px]"
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Loading...</span>
                  <span className="sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">View Full Details</span>
                  <span className="sm:hidden">View Details</span>
                </>
              )}
            </Button>
            {isAuthenticated && (
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={() => toggleFavorite.mutate()}
                  variant="outline"
                  className="px-3 sm:px-4 flex-shrink-0 min-h-[44px]"
                  disabled={toggleFavorite.isPending}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-grey-400'
                    }`}
                  />
                </Button>
                <Button
                  onClick={handleContactLandlord}
                  variant="outline"
                  className="px-3 sm:px-4 flex-shrink-0 min-h-[44px]"
                  aria-label="Contact landlord"
                  disabled={contactMutation.isPending || isContacting}
                >
                  {contactMutation.isPending || isContacting ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

