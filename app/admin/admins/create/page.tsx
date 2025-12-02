'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { PERMISSIONS, PERMISSION_GROUPS } from '@/lib/permissions';

interface CreateAdminForm {
  email: string;
  password: string;
  name: string;
  role: 'staff' | 'admin' | 'super_admin';
  permissions: string[];
  notes: string;
}

export default function CreateAdminPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateAdminForm>({
    defaultValues: {
      role: 'staff',
      permissions: [],
      notes: '',
    },
  });

  const selectedRole = watch('role');
  const selectedPermissions = watch('permissions') || [];

  const handlePermissionToggle = (permission: string) => {
    const current = selectedPermissions;
    if (current.includes(permission)) {
      setValue('permissions', current.filter(p => p !== permission));
    } else {
      setValue('permissions', [...current, permission]);
    }
  };

  const handleGroupToggle = (groupPermissions: readonly string[] | string[]) => {
    const current = selectedPermissions;
    const allSelected = groupPermissions.every(p => current.includes(p));
    
    if (allSelected) {
      setValue('permissions', current.filter(p => !groupPermissions.includes(p)));
    } else {
      const newPerms = [...new Set([...current, ...groupPermissions])];
      setValue('permissions', newPerms);
    }
  };

  const onSubmit = async (data: CreateAdminForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const payload: any = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        notes: data.notes,
      };

      // Only send permissions for staff role
      if (data.role === 'staff') {
        payload.permissions = data.permissions;
      }

      const response = await api.post('/admin/admins', payload);
      
      if (response.data.success) {
        router.push('/admin/admins');
      } else {
        setError(response.data.error || 'Failed to create admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/admins"
          className="p-2 text-grey-600 hover:text-grey-900 hover:bg-grey-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Create Admin</h1>
          <p className="text-grey-600">Add a new admin user to the system</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 shadow-medium border border-grey-200 space-y-6">
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
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
              type="email"
              className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="admin@example.com"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
              type="password"
              className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter secure password"
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
            <p className="text-xs text-grey-500 mt-1">Must contain uppercase, lowercase, number, and special character</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-grey-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>}
          </div>
        </div>

        {/* Permissions (only for staff) */}
        {selectedRole === 'staff' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-grey-900">Permissions</h2>
            <p className="text-sm text-grey-600">Select permissions for this staff member</p>
            
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
            {...register('notes')}
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
            Create Admin
          </Button>
        </div>
      </form>
    </div>
  );
}

