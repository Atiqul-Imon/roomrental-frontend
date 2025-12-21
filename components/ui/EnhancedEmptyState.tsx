/**
 * Enhanced Empty State Component
 * Phase 2: User Experience - Empty States
 * 
 * Provides helpful, engaging empty states with suggestions
 */

'use client';

import { ReactNode } from 'react';
import { Home, Search, Heart, Inbox, Plus, MapPin, Filter, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { H3, Body, BodySmall } from './Typography';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EnhancedEmptyStateProps {
  icon?: 'home' | 'search' | 'heart' | 'inbox' | 'plus' | 'map' | 'filter' | 'sparkles';
  title: string;
  message: string;
  suggestions?: string[];
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  illustration?: ReactNode;
  className?: string;
}

const iconMap = {
  home: Home,
  search: Search,
  heart: Heart,
  inbox: Inbox,
  plus: Plus,
  map: MapPin,
  filter: Filter,
  sparkles: Sparkles,
};

export function EnhancedEmptyState({
  icon = 'inbox',
  title,
  message,
  suggestions = [],
  actionLabel,
  actionHref,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionHref,
  illustration,
  className,
}: EnhancedEmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-8">{illustration}</div>
      ) : (
        <div className="mb-6 p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-full">
          <IconComponent className="w-16 h-16 text-primary-600" />
        </div>
      )}

      {/* Title */}
      <H3 className="mb-3">{title}</H3>

      {/* Message */}
      <Body className="text-grey-600 mb-8 max-w-md">
        {message}
      </Body>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-8 w-full max-w-md">
          <BodySmall className="text-grey-500 mb-3 font-medium">
            Try these suggestions:
          </BodySmall>
          <ul className="space-y-2 text-left">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-grey-600"
              >
                <span className="text-primary-500 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && (
          <>
            {actionHref ? (
              <Link href={actionHref}>
                <Button variant="primary" size="lg">
                  {actionLabel}
                </Button>
              </Link>
            ) : actionOnClick ? (
              <Button variant="primary" size="lg" onClick={actionOnClick}>
                {actionLabel}
              </Button>
            ) : null}
          </>
        )}

        {secondaryActionLabel && secondaryActionHref && (
          <Link href={secondaryActionHref}>
            <Button variant="outline" size="lg">
              {secondaryActionLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// Predefined empty states for common scenarios
export const EmptyStates = {
  noListings: (onClearFilters?: () => void) => (
    <EnhancedEmptyState
      icon="home"
      title="No listings found"
      message="We couldn't find any listings matching your criteria. Try adjusting your filters or search terms."
      suggestions={[
        'Clear all filters and start fresh',
        'Try a different location or city',
        'Adjust your price range',
        'Check back later for new listings',
      ]}
      actionLabel="Clear Filters"
      actionOnClick={onClearFilters}
      secondaryActionLabel="Browse All Listings"
      secondaryActionHref="/listings"
    />
  ),

  noFavorites: () => (
    <EnhancedEmptyState
      icon="heart"
      title="No favorites yet"
      message="Start exploring and save your favorite rooms to view them here later."
      suggestions={[
        'Browse available listings',
        'Use filters to find rooms you like',
        'Click the heart icon to save favorites',
        'Compare your saved rooms later',
      ]}
      actionLabel="Browse Listings"
      actionHref="/listings"
    />
  ),

  noSearchResults: (searchTerm: string, onClearSearch?: () => void) => (
    <EnhancedEmptyState
      icon="search"
      title={`No results for "${searchTerm}"`}
      message="We couldn't find any listings matching your search. Try different keywords or browse all listings."
      suggestions={[
        'Check your spelling',
        'Try a more general search term',
        'Use location names instead',
        'Browse by filters instead',
      ]}
      actionLabel="Clear Search"
      actionOnClick={onClearSearch}
      secondaryActionLabel="Browse All"
      secondaryActionHref="/listings"
    />
  ),

  noReviews: () => (
    <EnhancedEmptyState
      icon="sparkles"
      title="No reviews yet"
      message="Be the first to leave a review and help others make informed decisions."
      suggestions={[
        'Share your experience',
        'Help build the community',
        'Your feedback matters',
      ]}
    />
  ),
};






