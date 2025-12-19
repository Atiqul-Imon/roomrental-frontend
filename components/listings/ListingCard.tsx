import Link from 'next/link';
import { Listing } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { MapPin, Calendar, Sparkles } from 'lucide-react';
import { imageKitPresets } from '@/lib/imagekit';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const originalImageUrl = listing.images[0] || '/placeholder-room.jpg';
  const imageUrl = originalImageUrl.includes('ik.imagekit.io')
    ? imageKitPresets.card(originalImageUrl)
    : originalImageUrl;
  const formattedDate = format(new Date(listing.availabilityDate), 'MMM dd, yyyy');
  const [imageError, setImageError] = useState(false);

  return (
    <Link 
      href={`/listings/${listing._id}`}
      aria-label={`View listing: ${listing.title} in ${listing.location.city}, ${listing.location.state} for $${listing.price} per month`}
      className="block group"
    >
      <article className="bg-white border border-grey-200 rounded-xl overflow-hidden card-hover shadow-soft h-full flex flex-col group transition-all duration-300 hover:shadow-large hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative w-full h-56 bg-gradient-to-br from-grey-100 to-grey-200 overflow-hidden">
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
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
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
          <div className="absolute top-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-medium">
              <span className="text-lg font-bold text-primary" aria-label={`Price: $${listing.price} per month`}>
                ${listing.price}
              </span>
              <span className="text-xs text-grey-600 font-medium">/mo</span>
            </div>
          </div>

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-lg text-grey-900 line-clamp-1 mb-2 group-hover:text-primary-600 transition-colors duration-200">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-grey-600 mb-3">
            <MapPin className="w-4 h-4 text-grey-400" />
            <p className="text-sm font-medium" aria-label={`Location: ${listing.location.city}, ${listing.location.state}`}>
              {listing.location.city}, {listing.location.state}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-grey-600 line-clamp-2 mb-4 flex-1">
            {listing.description}
          </p>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 border-t border-grey-100">
            <div className="flex items-center gap-1.5 text-xs text-grey-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            {listing.amenities.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-grey-500" aria-label={`${listing.amenities.length} amenities`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-medium">{listing.amenities.length} amenities</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

