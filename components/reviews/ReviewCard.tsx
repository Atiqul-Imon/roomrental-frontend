import Image from 'next/image';
import { Review } from '@/types';
import { RatingDisplay } from './RatingDisplay';
import { format } from 'date-fns';
import Link from 'next/link';
import { memo } from 'react';

interface ReviewCardProps {
  review: Review;
}

function ReviewCardComponent({ review }: ReviewCardProps) {
  return (
    <div className="border border-accent-100 rounded-xl p-5 bg-white shadow-soft hover:shadow-medium transition-all">
      <div className="flex items-start gap-4">
        {review.reviewerId.profileImage ? (
          <Image
            src={review.reviewerId.profileImage}
            alt={review.reviewerId.name}
            width={48}
            height={48}
            className="rounded-full border-2 border-accent-200"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center border-2 border-accent-200">
            <span className="text-lg font-semibold text-white">
              {review.reviewerId.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Link
                href={`/profile/${review.reviewerId._id}`}
                className="font-semibold text-grey-900 hover:text-accent-600 transition-colors block mb-1"
              >
                {review.reviewerId.name}
              </Link>
              <p className="text-sm text-grey-500">
                {format(new Date(review.createdAt), 'MMMM dd, yyyy')}
              </p>
            </div>
            <RatingDisplay rating={review.rating} showNumber={false} size="small" />
          </div>

          <p className="text-grey-700 mb-3 leading-relaxed">{review.comment}</p>

          {review.listingId && (
            <Link
              href={`/listings/${review.listingId._id}`}
              className="text-sm text-accent-600 hover:text-accent-700 hover:underline font-medium inline-flex items-center gap-1"
            >
              View listing: {review.listingId.title}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoize ReviewCard to prevent unnecessary re-renders
export const ReviewCard = memo(ReviewCardComponent, (prevProps, nextProps) => {
  // Re-render if review ID changed
  if (prevProps.review._id !== nextProps.review._id) {
    return false;
  }
  // Re-render if review data changed
  if (prevProps.review.updatedAt !== nextProps.review.updatedAt) {
    return false;
  }
  // Don't re-render if nothing changed
  return true;
});

