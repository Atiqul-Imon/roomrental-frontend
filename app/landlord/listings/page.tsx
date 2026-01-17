'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryConfig } from '@/lib/query-config';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { ListingCard } from '@/components/listings/ListingCard';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';

export default function LandlordListingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'pending' | 'rented' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-listings', statusFilter, page, search],
    ...queryConfig.dashboard,
    queryFn: async () => {
      try {
        const params: any = { page, limit: 12 };
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        if (search) {
          params.search = search;
        }
        const response = await api.get('/listings/my/listings', { params });
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch listings');
        }
        
        const backendData = response.data.data;
        return {
          listings: (backendData.listings || []).map((l: any) => ({
          _id: l.id,
          landlordId: {
            _id: l.landlord?.id || l.landlordId,
            name: l.landlord?.name || '',
            email: l.landlord?.email || '',
            profileImage: l.landlord?.profileImage,
          },
          title: l.title,
          description: l.description,
          price: l.price,
          bedrooms: l.bedrooms,
          bathrooms: l.bathrooms,
          squareFeet: l.squareFeet,
          location: {
            city: l.city,
            state: l.state,
            zip: l.zip,
            address: l.address,
            coordinates: l.latitude && l.longitude
              ? { lat: l.latitude, lng: l.longitude }
              : undefined,
          },
          images: l.images || [],
          amenities: l.amenities || [],
          availabilityDate: l.availabilityDate,
          status: l.status,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        })) as Listing[],
        total: backendData.total || 0,
        page: backendData.page || 1,
        limit: backendData.limit || 12,
        totalPages: backendData.totalPages || 0,
      };
      } catch (err: any) {
        console.error('Error fetching listings:', err);
        throw new Error(err.response?.data?.error || err.message || 'Failed to fetch listings');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/listings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const handleStatusChange = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  // Calculate statistics
  const stats = {
    total: data?.total || 0,
    active: data?.listings.filter((l) => l.status === 'available' || l.status === 'active').length || 0,
    pending: data?.listings.filter((l) => l.status === 'pending').length || 0,
    rented: data?.listings.filter((l) => l.status === 'rented').length || 0,
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-grey-900 mb-2">My Listings</h1>
          <p className="text-sm sm:text-base text-grey-600">Manage all your property listings</p>
        </div>
        <Link
          href="/listings/create"
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold shadow-medium text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Create Listing
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
          <div className="text-3xl font-bold text-grey-900 mb-1">{stats.total}</div>
          <div className="text-sm text-grey-600 font-medium">Total Listings</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
          <div className="text-3xl font-bold text-green-600 mb-1">{stats.active}</div>
          <div className="text-sm text-grey-600 font-medium">Active</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
          <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
          <div className="text-sm text-grey-600 font-medium">Pending</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
          <div className="text-3xl font-bold text-grey-600 mb-1">{stats.rented}</div>
          <div className="text-sm text-grey-600 font-medium">Rented</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-medium border border-grey-200">
        <div className="flex flex-col gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-grey-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-2 px-2 md:overflow-x-visible md:pb-0 md:mx-0 md:px-0">
            {(['all', 'available', 'pending', 'rented', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition capitalize font-medium whitespace-nowrap flex-shrink-0 ${
                  statusFilter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings */}
      {error ? (
        <ErrorState 
          title="Failed to load listings"
          message={error instanceof Error ? error.message : 'An unexpected error occurred'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['my-listings'] })}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-grey-200 animate-pulse">
              <div className="h-48 bg-grey-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-grey-200 rounded w-3/4" />
                <div className="h-4 bg-grey-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : data && data.listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.listings.map((listing) => (
              <div key={listing._id} className="relative group bg-white rounded-xl border border-grey-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  onClick={(e) => {
                    // Only navigate if clicking on the card itself, not on action buttons
                    if ((e.target as HTMLElement).closest('.listing-actions')) {
                      return;
                    }
                    router.push(`/landlord/listings/${listing._id}`);
                  }}
                  className="cursor-pointer"
                >
                  <ListingCard listing={listing} />
                </div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition listing-actions z-10">
                  <Link
                    href={`/landlord/listings/${listing._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-grey-50 transition"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/listings/${listing._id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-grey-50 transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(listing._id);
                    }}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 border-t border-grey-200 flex items-center justify-between">
                  <select
                    value={listing.status}
                    onChange={(e) => handleStatusChange(listing._id, e.target.value)}
                    className="text-xs px-3 py-1.5 border border-grey-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="rented">Rented</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <span className="text-xs text-grey-500">
                    {listing.createdAt ? format(new Date(listing.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-medium border border-grey-200">
              <p className="text-sm text-grey-600">
                Showing {(data.page - 1) * data.limit + 1} to{' '}
                {Math.min(data.page * data.limit, data.total)} of {data.total} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page === 1}
                  className="px-4 py-2 border border-grey-300 rounded-lg hover:bg-grey-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={data.page === data.totalPages}
                  className="px-4 py-2 border border-grey-300 rounded-lg hover:bg-grey-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-medium border border-grey-200">
          <p className="text-grey-600 mb-4">No listings found.</p>
          <Link
            href="/listings/create"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            Create Your First Listing
          </Link>
        </div>
      )}
    </div>
  );
}

