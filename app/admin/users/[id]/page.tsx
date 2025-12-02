'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Trash2, Mail, Phone, User as UserIcon, Shield } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

interface EditUserForm {
  name: string;
  role: 'student' | 'landlord';
  phone: string;
  bio: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: userData, isLoading } = useQuery<{ user: User }>({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data.data;
    },
    enabled: !!userId,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditUserForm>({
    defaultValues: {
      name: '',
      role: 'student',
      phone: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (userData?.user) {
      setValue('name', userData.user.name);
      setValue('role', userData.user.role as 'student' | 'landlord');
      setValue('phone', userData.user.phone || '');
      setValue('bio', userData.user.bio || '');
    }
  }, [userData, setValue]);

  const onSubmit = async (data: EditUserForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.put(`/admin/users/${userId}`, data);
      
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        router.push('/admin/users');
      } else {
        setError(response.data.error || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        router.push('/admin/users');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userData?.user) {
    return (
      <div className="text-center py-12">
        <p className="text-grey-600">User not found</p>
        <Link href="/admin/users" className="text-primary-600 hover:underline mt-4 inline-block">
          Back to Users
        </Link>
      </div>
    );
  }

  const user = userData.user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2 text-grey-600 hover:text-grey-900 hover:bg-grey-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-grey-900">User Details</h1>
            <p className="text-grey-600">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete User
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 shadow-medium border border-grey-200 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-grey-900">User Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
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
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <option value="student">Student</option>
                  <option value="landlord">Landlord</option>
                </select>
                {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-2">Phone</label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-2">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-grey-200">
              <Link
                href="/admin/users"
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
            <h3 className="text-lg font-bold text-grey-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-grey-500 mb-1">Member Since</p>
                <p className="text-sm font-medium text-grey-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-grey-500 mb-1">Verification Status</p>
                <div className="flex flex-col gap-1">
                  {user.verification?.emailVerified && (
                    <span className="inline-block w-fit px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Email Verified
                    </span>
                  )}
                  {user.verification?.phoneVerified && (
                    <span className="inline-block w-fit px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Phone Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

