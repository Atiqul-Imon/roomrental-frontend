'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Review } from '@/types';
import { ReviewCard } from './ReviewCard';
import { useState } from 'react';

interface ReviewListProps {
  userId: string;
  listingId?: string;
}

export function ReviewList({ userId, listingId }: ReviewListProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', userId, listingId, page],
    queryFn: async () => {
      const endpoint = listingId ? `/reviews/listing/${listingId}` : `/reviews/user/${userId}`;
      const response = await api.get(endpoint, {
        params: listingId ? {} : { page, limit: 10 },
      });
      return response.data.data as
        | { reviews: Review[]; total: number; page: number; limit: number; totalPages: number; averageRating: number }
        | Review[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-secondary rounded w-1/4 mb-2" />
            <div className="h-4 bg-secondary rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return <div className="text-muted-foreground">No reviews yet.</div>;
  }

  const reviews = Array.isArray(data) ? data : data.reviews;
  const pagination = Array.isArray(data) ? null : data;

  if (reviews.length === 0) {
    return <div className="text-muted-foreground">No reviews yet.</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

