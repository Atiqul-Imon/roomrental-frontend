'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Key, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Admin } from '@/types';
import { PERMISSION_GROUPS } from '@/lib/permissions';

interface EditAdminForm {
  name: string;
  role: 'staff' | 'admin' | 'super_admin';
  permissions: string[];
  isActive: boolean;
  notes: string;
}

interface ChangePasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id as string;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { data: adminData, isLoading } = useQuery<{ admin: Admin }>({
    queryKey: ['admin', adminId],
    queryFn: async () => {
      const response = await api.get(`/admin/admins/${adminId}`);
      return response.data.data;
    },
    enabled: !!adminId,
  });

  const { register: registerEdit, handleSubmit: handleEditSubmit, watch: watchEdit, setValue: setEditValue, formState: { errors: editErrors } } = useForm<EditAdminForm>({
    defaultValues: {
      name: '',
      role: 'staff',
      permissions: [],
      isActive: true,
      notes: '',
    },
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors } } = useForm<ChangePasswordForm>({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (adminData?.admin) {
      setEditValue('name', adminData.admin.name);
      setEditValue('role', adminData.admin.role as 'staff' | 'admin' | 'super_admin');
      setEditValue('permissions', adminData.admin.adminMetadata?.permissions || []);
      setEditValue('isActive', adminData.admin.adminMetadata?.isActive ?? true);
      setEditValue('notes', adminData.admin.adminMetadata?.notes || '');
    }
  }, [adminData, setEditValue]);

  const selectedRole = watchEdit('role');
  const selectedPermissions = watchEdit('permissions') || [];

  const handlePermissionToggle = (permission: string) => {
    const current = selectedPermissions;
    if (current.includes(permission)) {
      setEditValue('permissions', current.filter(p => p !== permission));
    } else {
      setEditValue('permissions', [...current, permission]);
    }
  };

  const handleGroupToggle = (groupPermissions: readonly string[] | string[]) => {
    const current = selectedPermissions;
    const allSelected = groupPermissions.every(p => current.includes(p));
    
    if (allSelected) {
      setEditValue('permissions', current.filter(p => !groupPermissions.includes(p)));
    } else {
      const newPerms = [...new Set([...current, ...groupPermissions])];
      setEditValue('permissions', newPerms);
    }
  };

  const onEditSubmit = async (data: EditAdminForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const payload: any = {
        name: data.name,
        role: data.role,
        isActive: data.isActive,
        notes: data.notes,
      };

      if (data.role === 'staff') {
        payload.permissions = data.permissions;
      }

      const response = await api.put(`/admin/admins/${adminId}`, payload);
      
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['admin', adminId] });
        queryClient.invalidateQueries({ queryKey: ['admins'] });
        router.push('/admin/admins');
      } else {
        setError(response.data.error || 'Failed to update admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');

    try {
      const response = await api.put(`/admin/admins/${adminId}/password`, {
        newPassword: data.newPassword,
      });
      
      if (response.data.success) {
        setShowPasswordForm(false);
        setPasswordError('');
        alert('Password updated successfully');
      } else {
        setPasswordError(response.data.error || 'Failed to update password');
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate this admin?')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/admins/${adminId}`);
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['admins'] });
        router.push('/admin/admins');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to deactivate admin');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!adminData?.admin) {
    return (
      <div className="text-center py-12">
        <p className="text-grey-600">Admin not found</p>
        <Link href="/admin/admins" className="text-primary-600 hover:underline mt-4 inline-block">
          Back to Admins
        </Link>
      </div>
    );
  }

  const admin = adminData.admin;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/admins"
            className="p-2 text-grey-600 hover:text-grey-900 hover:bg-grey-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-grey-900">Edit Admin</h1>
            <p className="text-grey-600">{admin.email}</p>
          </div>
        </div>
        {admin.adminMetadata?.isActive && (
          <button
            onClick={handleDeactivate}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Deactivate
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleEditSubmit(onEditSubmit)} className="bg-white rounded-xl p-6 shadow-medium border border-grey-200 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-grey-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={admin.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg bg-grey-50 text-grey-600"
                />
                <p className="text-xs text-grey-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerEdit('name', { required: 'Name is required' })}
                  type="text"
                  className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {editErrors.name && <p className="text-sm text-red-600 mt-1">{editErrors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerEdit('role', { required: 'Role is required' })}
                  className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {editErrors.role && <p className="text-sm text-red-600 mt-1">{editErrors.role.message}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...registerEdit('isActive')}
                    type="checkbox"
                    className="w-5 h-5 rounded border-grey-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-semibold text-grey-700">Active Account</span>
                </label>
              </div>
            </div>

            {/* Permissions (only for staff) */}
            {selectedRole === 'staff' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-grey-900">Permissions</h2>
                
                {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                  <div key={groupName} className="border border-grey-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-grey-900 capitalize">{groupName.replace('_', ' ')}</h3>
                      <button
                        type="button"
                        onClick={() => handleGroupToggle(permissions)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {permissions.every(p => selectedPermissions.includes(p)) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map((permission) => {
                        const isChecked = selectedPermissions.includes(permission);
                        return (
                          <label
                            key={permission}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-primary-50 border-2 border-primary-300'
                                : 'bg-grey-50 border-2 border-transparent hover:bg-grey-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handlePermissionToggle(permission)}
                              className="w-4 h-4 rounded border-grey-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-grey-700">{permission.replace(/_/g, ' ')}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-grey-700 mb-2">Notes</label>
              <textarea
                {...registerEdit('notes')}
                rows={3}
                className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Optional notes about this admin..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-grey-200">
              <Link
                href="/admin/admins"
                className="px-6 py-3 border-2 border-grey-300 rounded-lg hover:bg-grey-50 transition-colors font-semibold text-grey-700"
              >
                Cancel
              </Link>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </form>

          {/* Change Password Form */}
          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="bg-white rounded-xl p-6 shadow-medium border border-grey-200 space-y-4">
              <h2 className="text-xl font-bold text-grey-900">Change Password</h2>
              
              {passwordError && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerPassword('newPassword', { 
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  type="password"
                  className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {passwordErrors.newPassword && <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerPassword('confirmPassword', { 
                    required: 'Please confirm password',
                  })}
                  type="password"
                  className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {passwordErrors.confirmPassword && <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-grey-200">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-6 py-3 border-2 border-grey-300 rounded-lg hover:bg-grey-50 transition-colors font-semibold text-grey-700"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isChangingPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Admin Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
            <h3 className="text-lg font-bold text-grey-900 mb-4">Admin Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-grey-500 mb-1">Created</p>
                <p className="text-sm font-medium text-grey-900">
                  {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {admin.adminMetadata?.createdBy && (
                <div>
                  <p className="text-xs text-grey-500 mb-1">Created By</p>
                  <p className="text-sm font-medium text-grey-900">
                    {admin.adminMetadata.createdBy.name}
                  </p>
                </div>
              )}
              {admin.adminMetadata?.lastLogin && (
                <div>
                  <p className="text-xs text-grey-500 mb-1">Last Login</p>
                  <p className="text-sm font-medium text-grey-900">
                    {new Date(admin.adminMetadata.lastLogin).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
            <h3 className="text-lg font-bold text-grey-900 mb-4">Quick Actions</h3>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-grey-50 hover:bg-grey-100 rounded-lg transition-colors text-grey-700 font-medium"
            >
              <Key className="w-5 h-5" />
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

