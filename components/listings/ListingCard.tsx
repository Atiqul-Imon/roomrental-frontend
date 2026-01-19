import Link from 'next/link';
import { Listing } from '@/types';
import { format } from 'date-fns';
import { useState, useRef, useEffect, memo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Calendar, Sparkles, Navigation, Check } from 'lucide-react';
import { imageKitPresets } from '@/lib/imagekit';
import { highlightSearchTermsReact } from '@/lib/search-highlight';
import { useComparisonStore } from '@/lib/comparison-store';

interface ListingCardProps {
  listing: Listing;
  onQuickView?: (listing: Listing) => void;
}

function ListingCardComponent({ listing, onQuickView }: ListingCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search') || '';
  const originalImageUrl = listing.images[0] || '/placeholder-room.jpg';
  const imageUrl = originalImageUrl.includes('ik.imagekit.io')
    ? imageKitPresets.card(originalImageUrl)
    : originalImageUrl;
  const formattedDate = format(new Date(listing.availabilityDate), 'MMM dd, yyyy');
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { addListing, removeListing, isInComparison, canAddMore } = useComparisonStore();
  const isSelected = isInComparison(listing._id);


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
        className="block group cursor-pointer relative overflow-hidden h-full"
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
      <article 
        ref={cardRef}
        className="bg-white border-refined border-accent-100 rounded-xl overflow-hidden card-hover-enhanced shadow-soft h-full flex flex-col group relative hover:border-accent-200 hover:shadow-medium transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-accent-50 to-coral-50 overflow-hidden flex-shrink-0">
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
            <div className="bg-coral-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-medium backdrop-blur-sm">
              <span className="text-lg sm:text-xl md:text-2xl font-bold" aria-label={`Price: $${listing.price} per month`}>
                ${listing.price}
              </span>
              <span className="text-xs sm:text-sm text-white/95 font-semibold">/mo</span>
            </div>
          </div>

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col min-h-0">
          {/* Title */}
          <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-grey-900 line-clamp-2 mb-3 sm:mb-4 group-hover:text-accent-600 transition-colors duration-200 leading-snug flex-shrink-0">
            {searchQuery ? (
              <span>{highlightSearchTermsReact(listing.title, searchQuery)}</span>
            ) : (
              listing.title
            )}
          </h3>

          {/* Location */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-grey-700 min-w-0 flex-1">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent-600 flex-shrink-0" />
              <p className="text-sm sm:text-base font-semibold truncate" aria-label={`Location: ${listing.location.city}, ${listing.location.state}`}>
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
              <div className="flex items-center gap-1 text-xs sm:text-sm text-accent-600 font-semibold flex-shrink-0 ml-2">
                <Navigation className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>{listing.distance.toFixed(1)} mi</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-grey-700 line-clamp-2 mb-4 sm:mb-5 flex-1 leading-relaxed font-normal min-h-[3rem]">
            {searchQuery ? (
              <span>{highlightSearchTermsReact(listing.description, searchQuery)}</span>
            ) : (
              listing.description
            )}
          </p>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-accent-200 flex-shrink-0 mt-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-grey-700">
              <Calendar className="w-4 h-4 sm:w-4 sm:h-4 text-accent-600" />
              <span className="font-semibold">{formattedDate}</span>
            </div>
            {listing.amenities.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-coral-600" aria-label={`${listing.amenities.length} amenities`}>
                <Sparkles className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="font-semibold">{listing.amenities.length} amenities</span>
              </div>
            )}
          </div>
        </div>
      </article>
      </div>
    </>
  );
}

// Memoize ListingCard to prevent unnecessary re-renders
// Only re-render if listing ID or updatedAt changes
export const ListingCard = memo(ListingCardComponent, (prevProps, nextProps) => {
  // Re-render if listing ID changed
  if (prevProps.listing._id !== nextProps.listing._id) {
    return false;
  }
  
  // Re-render if listing data changed (using updatedAt if available, or createdAt)
  const prevUpdated = prevProps.listing.updatedAt || prevProps.listing.createdAt;
  const nextUpdated = nextProps.listing.updatedAt || nextProps.listing.createdAt;
  if (prevUpdated !== nextUpdated) {
    return false;
  }
  
  // Re-render if onQuickView callback changed (reference equality)
  if (prevProps.onQuickView !== nextProps.onQuickView) {
    return false;
  }
  
  // Don't re-render if nothing changed
  return true;
});

