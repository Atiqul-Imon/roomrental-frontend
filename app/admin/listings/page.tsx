'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { Button } from '@/components/ui/Button';
import { Search, Filter, CheckCircle, XCircle, Eye, Edit, Trash2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminListingsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', page, search, statusFilter],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.get('/admin/listings', { params });
      const backendData = response.data.data;
      
      // Transform backend listing format to frontend format
      const listings = (backendData.listings || []).map((l: any) => ({
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
        },
        images: l.images || [],
        status: l.status,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      }));
      
      return {
        listings,
        total: backendData.pagination?.total || 0,
        page: backendData.pagination?.page || page,
        limit: backendData.pagination?.limit || 20,
        totalPages: backendData.pagination?.totalPages || 1,
      };
    },
  });

  const handleStatusChange = async (listingId: string, newStatus: 'available' | 'pending' | 'rented' | 'inactive') => {
    try {
      await api.put(`/listings/${listingId}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    } catch (error) {
      alert('Failed to update listing status');
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await api.delete(`/listings/${listingId}`);
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    } catch (error) {
      alert('Failed to delete listing');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'rented':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'inactive':
        return 'bg-dark-bg-tertiary text-dark-text-secondary border-dark-border-default';
      default:
        return 'bg-dark-bg-tertiary text-dark-text-secondary border-dark-border-default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Listing Management</h1>
        <p className="text-dark-text-secondary">Manage and moderate all listings on the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-dark-bg-secondary rounded-xl p-4 shadow-dark-medium border border-dark-border-default">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
            <input
              type="text"
              placeholder="Search by title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="rented">Rented</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-dark-bg-secondary rounded-xl shadow-dark-medium border border-dark-border-default overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : data && data.listings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg-tertiary border-b border-dark-border-default">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-dark-text-secondary uppercase">Listing</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-dark-text-secondary uppercase">Landlord</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-dark-text-secondary uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-dark-text-secondary uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-dark-text-secondary uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-dark-text-secondary uppercase">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-dark-text-secondary uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border-default">
                  {data.listings.map((listing: Listing) => (
                    <tr key={listing._id} className="hover:bg-dark-bg-tertiary transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {listing.images[0] && (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-dark-text-primary">{listing.title}</p>
                            <p className="text-sm text-dark-text-muted line-clamp-1">{listing.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-dark-text-primary">{listing.landlordId.name}</p>
                        <p className="text-xs text-dark-text-muted">{listing.landlordId.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-dark-text-primary">${listing.price}</p>
                        <p className="text-xs text-dark-text-muted">/month</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-dark-text-secondary">
                          {listing.location.city}, {listing.location.state}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={listing.status}
                          onChange={(e) => handleStatusChange(listing._id, e.target.value as any)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border bg-dark-bg-tertiary text-dark-text-primary ${getStatusBadgeColor(listing.status)} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        >
                          <option value="pending">Pending</option>
                          <option value="available">Available</option>
                          <option value="rented">Rented</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-dark-text-secondary">
                          {format(new Date(listing.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/listings/${listing._id}`}
                            className="p-2 text-dark-text-secondary hover:text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(listing._id)}
                            className="p-2 text-dark-text-secondary hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-dark-border-default flex items-center justify-between">
                <p className="text-sm text-dark-text-secondary">
                  Showing {(data.page - 1) * data.limit + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} listings
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
            <p className="text-dark-text-secondary">No listings found</p>
          </div>
        )}
      </div>
    </div>
  );
}

