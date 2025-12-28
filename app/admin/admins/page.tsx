'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Admin } from '@/types';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Shield, UserCog, User } from 'lucide-react';
import Link from 'next/link';

export default function AdminsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admins', page, search, roleFilter],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      
      const response = await api.get('/admin/admins', { params });
      const backendData = response.data.data;
      
      // Backend returns: { admins, pagination: { total, page, limit, totalPages } }
      return {
        admins: backendData.admins || [],
        total: backendData.pagination?.total || 0,
        page: backendData.pagination?.page || page,
        limit: backendData.pagination?.limit || 20,
        totalPages: backendData.pagination?.totalPages || 0,
      };
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return Shield;
      case 'admin':
        return UserCog;
      case 'staff':
        return User;
      default:
        return User;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500/20 text-red-600 border-red-300';
      case 'admin':
        return 'bg-blue-500/20 text-blue-600 border-blue-300';
      case 'staff':
        return 'bg-green-500/20 text-green-600 border-green-300';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          </div>
          <p className="text-gray-600 ml-12">Manage admin users and their permissions</p>
        </div>
        <Link
          href="/admin/admins/create"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-md inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Admin
        </Link>
      </div>

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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600 mb-2">Error loading admins</p>
            <p className="text-gray-500 text-sm">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        ) : data && data.admins.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.admins.map((admin: Admin) => {
                    const RoleIcon = getRoleIcon(admin.role);
                    return (
                      <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{admin.name}</p>
                              <p className="text-sm text-gray-500">{admin.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(admin.role)}`}>
                            <RoleIcon className="w-3.5 h-3.5" />
                            {admin.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            admin.adminMetadata?.isActive
                              ? 'bg-green-500/20 text-green-600'
                              : 'bg-red-500/20 text-red-600'
                          }`}>
                            {admin.adminMetadata?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {admin.adminMetadata?.permissions?.length || 0} permissions
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/admins/${admin.id}/edit`}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(data.page - 1) * data.limit + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} admins
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
            <p className="text-gray-600">No admins found</p>
          </div>
        )}
      </div>
    </div>
  );
}

