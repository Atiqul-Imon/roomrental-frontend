'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Search, Edit, Building2, DollarSign, TrendingUp, CheckCircle, XCircle, Mail, Phone, Calendar, Home } from 'lucide-react';
import Link from 'next/link';

interface LandlordStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  rentedListings: number;
  totalValue: number;
  averagePrice: number;
}

interface LandlordWithStats extends User {
  stats: LandlordStats;
}

export default function LandlordsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-landlords', page, search, emailVerifiedFilter],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (emailVerifiedFilter !== 'all') {
        params.emailVerified = emailVerifiedFilter === 'verified';
      }
      
      const response = await api.get('/admin/landlords', { params });
      const backendData = response.data.data;
      
      // Backend returns: { landlords, pagination: { total, page, limit, totalPages } }
      return {
        landlords: backendData.landlords || [],
        total: backendData.pagination?.total || 0,
        page: backendData.pagination?.page || page,
        limit: backendData.pagination?.limit || 20,
        totalPages: backendData.pagination?.totalPages || 0,
      };
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Home className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Landlord Management</h1>
        </div>
        <p className="text-gray-600 ml-12">View and manage all registered landlords and their listing statistics</p>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Landlords</p>
                <p className="text-2xl font-bold text-gray-900">{data.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.landlords.reduce((sum: number, landlord: LandlordWithStats) => sum + landlord.stats.totalListings, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.landlords.reduce((sum: number, landlord: LandlordWithStats) => sum + landlord.stats.activeListings, 0)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.landlords.reduce((sum: number, landlord: LandlordWithStats) => sum + landlord.stats.totalValue, 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={emailVerifiedFilter}
            onChange={(e) => setEmailVerifiedFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Verification Status</option>
            <option value="verified">Email Verified</option>
            <option value="unverified">Email Unverified</option>
          </select>
        </div>
      </div>

      {/* Landlords Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600 mb-2">Error loading landlords</p>
            <p className="text-gray-500 text-sm">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        ) : data && data.landlords.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Landlord</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Listings</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Verification</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.landlords.map((landlord: LandlordWithStats) => (
                    <tr key={landlord.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            {landlord.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{landlord.name}</p>
                            <p className="text-sm text-gray-500">{landlord.email}</p>
                            {landlord.bio && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{landlord.bio}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate max-w-[200px]">{landlord.email}</span>
                          </div>
                          {landlord.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{landlord.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-900">
                              {landlord.stats.totalListings} Total
                            </span>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded border border-emerald-300">
                              {landlord.stats.activeListings} Active
                            </span>
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                              {landlord.stats.pendingListings} Pending
                            </span>
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-600 rounded">
                              {landlord.stats.rentedListings} Rented
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            <span className="font-semibold">Avg:</span> {formatCurrency(landlord.stats.averagePrice)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {landlord.stats.totalListings > 0 ? (
                              <span>{(landlord.stats.activeListings / landlord.stats.totalListings * 100).toFixed(0)}% Active</span>
                            ) : (
                              <span>No listings</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(landlord.stats.totalValue)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {landlord.verification?.emailVerified ? (
                            <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 bg-green-500/20 text-green-600 rounded text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Email
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 bg-red-500/20 text-red-600 rounded text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              Email
                            </span>
                          )}
                          {landlord.verification?.phoneVerified && (
                            <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 bg-green-500/20 text-green-600 rounded text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Phone
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {landlord.createdAt ? new Date(landlord.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${landlord.id}`}
                            className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
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
                  Showing {(data.page - 1) * data.limit + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} landlords
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
            <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600">No landlords found</p>
          </div>
        )}
      </div>
    </div>
  );
}

