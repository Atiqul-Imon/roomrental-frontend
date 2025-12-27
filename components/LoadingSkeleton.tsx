export function ListingCardSkeleton() {
  return (
    <div className="bg-white border border-grey-200 rounded-xl overflow-hidden shadow-soft">
      <div className="w-full h-48 sm:h-56 skeleton-shimmer relative">
        <div className="absolute top-3 right-3 w-20 h-6 bg-grey-200/80 rounded-lg" />
        <div className="absolute top-3 left-3 w-16 h-6 bg-grey-200/80 rounded-full" />
      </div>
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-grey-200 rounded w-3/4 skeleton-shimmer" />
          <div className="h-6 bg-grey-200 rounded w-16 skeleton-shimmer" />
        </div>
        <div className="h-4 bg-grey-200 rounded w-1/2 skeleton-shimmer" />
        <div className="space-y-2">
          <div className="h-3 bg-grey-200 rounded w-full skeleton-shimmer" />
          <div className="h-3 bg-grey-200 rounded w-5/6 skeleton-shimmer" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-grey-200">
          <div className="h-3 bg-grey-200 rounded w-24 skeleton-shimmer" />
          <div className="h-3 bg-grey-200 rounded w-20 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-dark-bg-secondary border border-dark-border-default rounded-xl p-6 shadow-dark-soft animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-dark-bg-tertiary rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-dark-bg-tertiary rounded w-1/3" />
          <div className="h-4 bg-dark-bg-tertiary rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-dark-bg-tertiary rounded w-full" />
        <div className="h-4 bg-dark-bg-tertiary rounded w-5/6" />
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="bg-dark-bg-secondary border border-dark-border-default rounded-xl p-4 shadow-dark-soft animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-dark-bg-tertiary rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-dark-bg-tertiary rounded w-1/4" />
          <div className="h-4 bg-dark-bg-tertiary rounded w-full" />
          <div className="h-4 bg-dark-bg-tertiary rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-96 skeleton-shimmer rounded-xl" />
      <div className="space-y-4">
        <div className="h-8 bg-grey-200 rounded w-3/4 skeleton-shimmer" />
        <div className="h-4 bg-grey-200 rounded w-1/2 skeleton-shimmer" />
        <div className="h-4 bg-grey-200 rounded w-full skeleton-shimmer" />
        <div className="h-4 bg-grey-200 rounded w-5/6 skeleton-shimmer" />
      </div>
    </div>
  );
}

