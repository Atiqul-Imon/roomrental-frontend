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
      const response = await api.get('/reviews', {
        params: { revieweeId: userId, listingId, page, limit: 10 },
      });
      const backendData = response.data.data;
      return {
        reviews: (backendData.reviews || []).map((r: any) => ({
          _id: r.id,
          reviewerId: {
            _id: r.reviewer?.id || r.reviewerId,
            name: r.reviewer?.name || '',
            email: r.reviewer?.email || '',
            profileImage: r.reviewer?.profileImage,
          },
          revieweeId: {
            _id: r.reviewee?.id || r.revieweeId,
            name: r.reviewee?.name || '',
            email: r.reviewee?.email || '',
            profileImage: r.reviewee?.profileImage,
          },
          listingId: r.listing
            ? {
                _id: r.listing.id,
                title: r.listing.title,
              }
            : undefined,
          rating: r.rating,
          comment: r.comment || '',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })) as Review[],
        total: backendData.pagination?.total || 0,
        page: backendData.pagination?.page || 1,
        limit: backendData.pagination?.limit || 10,
        totalPages: backendData.pagination?.totalPages || 0,
      };
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

