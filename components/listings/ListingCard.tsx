import Link from 'next/link';
import { Listing } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, Calendar, Sparkles, Navigation, Check } from 'lucide-react';
import { imageKitPresets } from '@/lib/imagekit';
import { QuickViewModal } from './QuickViewModal';
import { highlightSearchTermsReact } from '@/lib/search-highlight';
import { useComparisonStore } from '@/lib/comparison-store';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const originalImageUrl = listing.images[0] || '/placeholder-room.jpg';
  const imageUrl = originalImageUrl.includes('ik.imagekit.io')
    ? imageKitPresets.card(originalImageUrl)
    : originalImageUrl;
  const formattedDate = format(new Date(listing.availabilityDate), 'MMM dd, yyyy');
  const [imageError, setImageError] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addListing, removeListing, isInComparison, canAddMore } = useComparisonStore();
  const isSelected = isInComparison(listing._id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open quick view if not clicking on a link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    e.preventDefault();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="block group cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsQuickViewOpen(true);
          }
        }}
        aria-label={`Quick view listing: ${listing.title} in ${listing.location.city}, ${listing.location.state} for $${listing.price} per month`}
      >
      <article className="bg-white border border-grey-200 rounded-xl overflow-hidden card-hover shadow-soft h-full flex flex-col group transition-all duration-300 hover:shadow-large hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-grey-100 to-grey-200 overflow-hidden aspect-[16/9] sm:aspect-auto">
          {listing.images[0] && !imageError ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              onError={() => setImageError(true)}
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
              className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center transition-all touch-target ${
                isSelected
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-white/95 backdrop-blur-sm border-grey-300 text-grey-400 hover:border-primary-400'
              }`}
              aria-label={isSelected ? 'Remove from comparison' : 'Add to comparison'}
              title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
            >
              {isSelected && <Check className="w-5 h-5 sm:w-4 sm:h-4" />}
            </button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 sm:top-3 left-11 sm:left-12">
            <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-sm ${
              listing.status === 'active' 
                ? 'bg-green-500/90 text-white' 
                : listing.status === 'pending'
                ? 'bg-warning/90 text-white'
                : 'bg-grey-500/90 text-white'
            }`}>
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <div className="bg-white/95 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-medium">
              <span className="text-base sm:text-lg font-bold text-primary" aria-label={`Price: $${listing.price} per month`}>
                ${listing.price}
              </span>
              <span className="text-[10px] sm:text-xs text-grey-600 font-medium">/mo</span>
            </div>
          </div>

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-base sm:text-lg text-grey-900 line-clamp-1 mb-1.5 sm:mb-2 group-hover:text-primary-600 transition-colors duration-200">
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
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-primary-600 font-medium flex-shrink-0 ml-2">
                <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{listing.distance.toFixed(1)} mi</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-grey-600 line-clamp-2 mb-3 sm:mb-4 flex-1">
            {searchQuery ? (
              <span>{highlightSearchTermsReact(listing.description, searchQuery)}</span>
            ) : (
              listing.description
            )}
          </p>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-grey-100">
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-grey-500">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{formattedDate}</span>
            </div>
            {listing.amenities.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-grey-500" aria-label={`${listing.amenities.length} amenities`}>
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="font-medium">{listing.amenities.length} amenities</span>
              </div>
            )}
          </div>
        </div>
      </article>
      </div>
      <QuickViewModal
        listing={listing}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}

