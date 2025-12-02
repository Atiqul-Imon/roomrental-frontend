import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  totalReviews?: number;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
}

export function RatingDisplay({
  rating,
  totalReviews,
  size = 'medium',
  showNumber = true,
}: RatingDisplayProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${sizeClasses[size]} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className={`${sizeClasses[size]} text-gray-300`} />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium">
          {rating.toFixed(1)}
          {totalReviews !== undefined && (
            <span className="text-muted-foreground ml-1">({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
}

