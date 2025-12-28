'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import { Search, Star, Edit, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page, search],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      
      const response = await api.get('/admin/reviews', { params });
      return response.data.data as {
        reviews: Review[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    },
  });

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Management</h1>
        <p className="text-gray-600">Manage and moderate all reviews on the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : data && data.reviews.length > 0 ? (
          <>
            <div className="divide-y divide-gray-200">
              {data.reviews.map((review) => (
                <div key={review._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {review.reviewerId.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.reviewerId.name}</p>
                          <p className="text-sm text-gray-500">{review.reviewerId.email}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-500'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{review.comment}</p>
                      {review.listingId && (
                        <p className="text-sm text-gray-500">
                          For listing: <span className="font-medium text-gray-900">{review.listingId.title}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(review.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(data.page - 1) * data.limit + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} reviews
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={data.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={data.page === data.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-600">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}

