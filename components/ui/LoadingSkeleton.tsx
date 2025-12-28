'use client';

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-12 w-12 bg-grey-200 rounded-lg" />
        <div className="h-8 w-16 bg-grey-200 rounded" />
      </div>
      <div className="h-4 w-24 bg-grey-200 rounded" />
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-medium border border-grey-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-grey-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-grey-200 rounded w-3/4" />
        <div className="h-4 bg-grey-200 rounded w-1/2" />
        <div className="h-4 bg-grey-200 rounded w-2/3" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 bg-grey-200 rounded w-16" />
          <div className="h-6 bg-grey-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function ProfileHeroSkeleton() {
  return (
    <div className="relative animate-pulse">
      <div className="h-48 bg-grey-200 rounded-t-xl" />
      <div className="relative -mt-20 px-6 pb-6">
        <div className="bg-white rounded-xl shadow-large border border-grey-200 p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-grey-200 border-4 border-white" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-grey-200 rounded w-48" />
              <div className="h-6 bg-grey-200 rounded w-32" />
              <div className="h-4 bg-grey-200 rounded w-64" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-medium border border-grey-200 animate-pulse">
      <div className="p-6 border-b border-grey-200">
        <div className="h-6 bg-grey-200 rounded w-32" />
      </div>
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-grey-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}




