'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { Button } from '@/components/ui/Button';
import { Search, Filter, CheckCircle, XCircle, Eye, Edit, Trash2, Building2, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminListingsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-listings', page, search, statusFilter],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.get('/admin/listings', { params });
      const backendData = response.data.data;
      
      // Backend returns: { listings, pagination: { total, page, limit, totalPages } }
      return {
        listings: backendData.listings || [],
        total: backendData.pagination?.total || 0,
        page: backendData.pagination?.page || page,
        limit: backendData.pagination?.limit || 20,
        totalPages: backendData.pagination?.totalPages || 0,
      };
    },
  });

  const handleStatusChange = async (listingId: string, newStatus: 'active' | 'pending' | 'rented' | 'available' | 'inactive') => {
    try {
      await api.put(`/listings/${listingId}/status`, { status: newStatus });
      // Invalidate all listing-related caches
      queryClient.invalidateQueries({ queryKey: ['listings'] }); // Public listings
      queryClient.invalidateQueries({ queryKey: ['my-listings'] }); // Landlord listings
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] }); // Admin listings
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] }); // Specific listing
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
      // Invalidate all listing-related caches
      queryClient.invalidateQueries({ queryKey: ['listings'] }); // Public listings
      queryClient.invalidateQueries({ queryKey: ['my-listings'] }); // Landlord listings
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] }); // Admin listings
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] }); // Specific listing
    } catch (error) {
      alert('Failed to delete listing');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-700 border-green-300 font-semibold';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-300 font-semibold';
      case 'rented':
        return 'bg-purple-100 text-purple-700 border-purple-300 font-semibold';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-300 font-semibold';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Listing Management</h1>
          </div>
          <p className="text-gray-600 ml-12">Manage and moderate all listings on the platform</p>
        </div>
        <Link
          href="/admin/listings/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
        >
          <Building2 className="w-5 h-5" />
          Create Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rented">Rented</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600 mb-2">Error loading listings</p>
            <p className="text-gray-500 text-sm">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        ) : data && data.listings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50 border-b-2 border-emerald-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Listing</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Landlord</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-emerald-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.listings.map((listing: Listing, index: number) => (
                    <tr key={listing._id || `listing-${index}`} className={`hover:bg-emerald-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {listing.images && listing.images.length > 0 && listing.images[0] && (
                            <img
                              src={listing.images[0]}
                              alt={listing.title || 'Listing'}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{listing.title || 'Untitled'}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{listing.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {listing.landlordId?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {listing.landlordId?.email || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">${listing.price}</p>
                        <p className="text-xs text-gray-500">/month</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {listing.location?.city && listing.location?.state
                            ? `${listing.location.city}, ${listing.location.state}`
                            : listing.location?.city || listing.location?.state || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={listing.status === 'available' ? 'active' : listing.status === 'inactive' ? 'inactive' : listing.status}
                          onChange={(e) => {
                            const newStatus = e.target.value === 'active' ? 'available' : e.target.value;
                            handleStatusChange(listing._id || '', newStatus as any);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-900 ${getStatusBadgeColor(listing.status)} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="rented">Rented</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {listing.createdAt ? format(new Date(listing.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {listing._id ? (
                            <Link
                              href={`/admin/listings/${listing._id}`}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          ) : (
                            <span
                              className="p-2 text-gray-500 cursor-not-allowed opacity-50"
                              title="Listing ID missing"
                            >
                              <Eye className="w-4 h-4" />
                            </span>
                          )}
                          <button
                            onClick={() => handleDelete(listing._id || '')}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
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
            <p className="text-gray-600">No listings found</p>
          </div>
        )}
      </div>
    </div>
  );
}

