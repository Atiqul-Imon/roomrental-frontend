import Image from 'next/image';
import { Review } from '@/types';
import { RatingDisplay } from './RatingDisplay';
import { format } from 'date-fns';
import Link from 'next/link';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-start gap-4">
        {review.reviewerId.profileImage ? (
          <Image
            src={review.reviewerId.profileImage}
            alt={review.reviewerId.name}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold">
              {review.reviewerId.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Link
                href={`/profile/${review.reviewerId._id}`}
                className="font-semibold hover:text-primary transition"
              >
                {review.reviewerId.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {format(new Date(review.createdAt), 'MMMM dd, yyyy')}
              </p>
            </div>
            <RatingDisplay rating={review.rating} showNumber={false} size="small" />
          </div>

          <p className="text-muted-foreground mb-2">{review.comment}</p>

          {review.listingId && (
            <Link
              href={`/listings/${review.listingId._id}`}
              className="text-sm text-primary hover:underline"
            >
              View listing: {review.listingId.title}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

