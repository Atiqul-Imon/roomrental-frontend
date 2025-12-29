import Link from 'next/link';
import { Listing } from '@/types';
import { format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Calendar, Sparkles, Navigation, Check, Heart } from 'lucide-react';
import { imageKitPresets } from '@/lib/imagekit';
import { highlightSearchTermsReact } from '@/lib/search-highlight';
import { useComparisonStore } from '@/lib/comparison-store';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface ListingCardProps {
  listing: Listing;
  onQuickView?: (listing: Listing) => void;
}

export function ListingCard({ listing, onQuickView }: ListingCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const searchQuery = searchParams.get('search') || '';
  const originalImageUrl = listing.images[0] || '/placeholder-room.jpg';
  const imageUrl = originalImageUrl.includes('ik.imagekit.io')
    ? imageKitPresets.card(originalImageUrl)
    : originalImageUrl;
  const formattedDate = format(new Date(listing.availabilityDate), 'MMM dd, yyyy');
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const { addListing, removeListing, isInComparison, canAddMore } = useComparisonStore();
  const isSelected = isInComparison(listing._id);

  // Check favorite status
  useEffect(() => {
    if (isAuthenticated) {
      api.get(`/favorites/check/${listing._id}`)
        .then((res) => {
          if (res.data.success) {
            setIsFavorite(res.data.data.isFavorite || false);
          }
        })
        .catch(() => setIsFavorite(false));
    }
  }, [listing._id, isAuthenticated]);

  // Swipe gesture handlers (mobile only)
  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof window === 'undefined') return;
    
    // Only enable on mobile devices
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      currentX = startX;
      isDragging = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startX === 0) return;
      
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      
      // Only allow left swipe (negative diff) and prevent if swiping right
      if (diff < 0 && Math.abs(diff) > 10) {
        isDragging = true;
        e.preventDefault(); // Prevent scrolling while swiping
        if (Math.abs(diff) < 100) {
          setSwipeOffset(diff);
          setIsSwiping(true);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (startX === 0) return;
      
      const diff = currentX - startX;
      
      // If swiped more than 50px to the left, trigger favorite
      if (diff < -50 && isDragging && isAuthenticated) {
        try {
          if (isFavorite) {
            await api.delete(`/favorites/${listing._id}`);
            setIsFavorite(false);
          } else {
            await api.post(`/favorites/${listing._id}`);
            setIsFavorite(true);
          }
          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(20);
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
        }
      }
      
      // Reset swipe state
      setSwipeOffset(0);
      setIsSwiping(false);
      startX = 0;
      currentX = 0;
      isDragging = false;
    };

    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAuthenticated, isFavorite, listing._id]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open quick view if not clicking on a link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    e.preventDefault();
    onQuickView?.(listing);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="block group cursor-pointer relative overflow-hidden"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onQuickView?.(listing);
          }
        }}
        aria-label={`Quick view listing: ${listing.title} in ${listing.location.city}, ${listing.location.state} for $${listing.price} per month`}
      >
        {/* Swipe indicator */}
        {swipeOffset < -30 && isAuthenticated && (
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-warm flex items-center justify-center z-20 rounded-r-xl pointer-events-none shadow-medium">
            <Heart className={`w-6 h-6 text-white ${isFavorite ? 'fill-white' : ''}`} />
          </div>
        )}
      <article 
        ref={cardRef}
        className="bg-white border-refined border-accent-100 rounded-xl overflow-hidden card-hover-enhanced shadow-soft h-full flex flex-col group relative hover:border-accent-200 hover:shadow-medium transition-all duration-300"
        style={{
          transform: `translateX(${swipeOffset}px) translateZ(0)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Image Container */}
        <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-accent-50 to-coral-50 overflow-hidden aspect-[16/9] sm:aspect-auto">
          {listing.images[0] && !imageError ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              loading="lazy"
              onError={() => setImageError(true)}
              style={{ willChange: 'transform' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-grey-400" role="img" aria-label="No image available">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
          
          {/* Comparison Checkbox */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isSelected) {
                  removeListing(listing._id);
                } else if (canAddMore()) {
                  addListing(listing);
                } else {
                  alert(`You can compare up to 5 listings. Please remove one to add another.`);
                }
              }}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shadow-soft ${
                isSelected
                  ? 'bg-gradient-primary border-accent-500 text-white shadow-medium'
                  : 'bg-white/95 backdrop-blur-sm border-accent-200 text-accent-400 hover:border-accent-400 hover:bg-accent-50'
              }`}
              aria-label={isSelected ? 'Remove from comparison' : 'Add to comparison'}
              title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 sm:top-3 left-9 sm:left-10">
            <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-sm ${
              listing.status === 'active' 
                ? 'bg-accent-500/90 text-white' 
                : listing.status === 'pending'
                ? 'bg-warning/90 text-white'
                : 'bg-grey-500/90 text-white'
            }`}>
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <div className="bg-coral-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-medium backdrop-blur-sm">
              <span className="text-base sm:text-lg font-bold" aria-label={`Price: $${listing.price} per month`}>
                ${listing.price}
              </span>
              <span className="text-[10px] sm:text-xs text-white/90 font-medium">/mo</span>
            </div>
          </div>

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-base sm:text-lg text-grey-900 line-clamp-1 mb-2 sm:mb-3 group-hover:text-accent-600 transition-colors duration-200 leading-tight">
            {searchQuery ? (
              <span>{highlightSearchTermsReact(listing.title, searchQuery)}</span>
            ) : (
              listing.title
            )}
          </h3>

          {/* Location */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1 sm:gap-1.5 text-grey-600 min-w-0 flex-1">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-grey-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium truncate" aria-label={`Location: ${listing.location.city}, ${listing.location.state}`}>
                {searchQuery ? (
                  <span>
                    {highlightSearchTermsReact(listing.location.city, searchQuery)},{' '}
                    {highlightSearchTermsReact(listing.location.state, searchQuery)}
                  </span>
                ) : (
                  `${listing.location.city}, ${listing.location.state}`
                )}
              </p>
            </div>
            {listing.distance !== undefined && (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-accent-600 font-medium flex-shrink-0 ml-2">
                <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{listing.distance.toFixed(1)} mi</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-grey-600 line-clamp-2 mb-4 sm:mb-5 flex-1 leading-relaxed">
            {searchQuery ? (
              <span>{highlightSearchTermsReact(listing.description, searchQuery)}</span>
            ) : (
              listing.description
            )}
          </p>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-accent-100">
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-accent-600">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            {listing.amenities.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-coral-600" aria-label={`${listing.amenities.length} amenities`}>
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="font-medium">{listing.amenities.length} amenities</span>
              </div>
            )}
          </div>
        </div>
      </article>
      </div>
    </>
  );
}

