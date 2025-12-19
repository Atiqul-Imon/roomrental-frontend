'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryConfig } from '@/lib/query-config';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Listing } from '@/types';
import { ListingCard } from '@/components/listings/ListingCard';
import { Pagination } from '@/components/listings/Pagination';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'active' | 'pending' | 'rented' | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-listings', statusFilter, page],
    ...queryConfig.dashboard,
    queryFn: async () => {
      const params: any = { page, limit: 12 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await api.get('/listings/my/listings', { params });
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
    },
    enabled: isAuthenticated && user?.role === 'landlord',
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
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'pending' | 'rented' | 'available' | 'inactive' }) => {
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

  const handleStatusChange = (id: string, status: 'active' | 'pending' | 'rented') => {
    statusMutation.mutate({ id, status });
  };

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </>
    );
  }

  if (!isAuthenticated || user?.role !== 'landlord') {
    router.push('/auth/login');
    return null;
  }

  // Calculate statistics
  const stats = {
    total: data?.total || 0,
    active: data?.listings.filter((l) => l.status === 'active').length || 0,
    pending: data?.listings.filter((l) => l.status === 'pending').length || 0,
    rented: data?.listings.filter((l) => l.status === 'rented').length || 0,
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Listings</h1>
            <Link
              href="/listings/create"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
            >
              <Plus className="w-5 h-5" />
              Create Listing
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="border border-border rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Listings</div>
            </div>
            <div className="border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.rented}</div>
              <div className="text-sm text-muted-foreground">Rented</div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 mb-6">
            {(['all', 'active', 'pending', 'rented'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition capitalize ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-secondary'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Listings */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg animate-pulse">
                  <div className="h-48 bg-secondary" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.listings.map((listing) => (
                  <div key={listing._id} className="relative group">
                    <ListingCard listing={listing} />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <Link
                        href={`/listings/${listing._id}`}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/listings/${listing._id}/edit`}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(listing._id)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        value={listing.status}
                        onChange={(e) =>
                          handleStatusChange(
                            listing._id,
                            e.target.value as 'active' | 'pending' | 'rented'
                          )
                        }
                        className="text-xs px-2 py-1 border border-border rounded capitalize"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="rented">Rented</option>
                      </select>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(listing.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(data.page - 1) * data.limit + 1} to{' '}
                    {Math.min(data.page * data.limit, data.total)} of {data.total} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={data.page === 1}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={data.page === data.totalPages}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No listings found.</p>
              <Link
                href="/listings/create"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition inline-block"
              >
                Create Your First Listing
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
