'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { queryConfig } from '@/lib/query-config';
import { User, Mail, Phone, MapPin, Save, Upload, Camera, LayoutDashboard, Home, Eye, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandlordProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    bio: (user as any)?.bio || '',
    address: (user as any)?.address || '',
    city: (user as any)?.city || '',
    state: (user as any)?.state || '',
    zip: (user as any)?.zip || '',
  });
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [isUploading, setIsUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch('/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditing(false);
    },
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setProfileImage(response.data.data.url);
        // Auto-save profile image
        updateMutation.mutate({ profileImage: response.data.data.url });
      }
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  // Fetch listings data for statistics
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['my-listings', 'all', 1],
    ...queryConfig.dashboard,
    queryFn: async () => {
      const response = await api.get('/listings/my/listings', { 
        params: { page: 1, limit: 100 } 
      });
      const backendData = response.data.data;
      return {
        listings: backendData.listings || [],
        total: backendData.total || 0,
      };
    },
  });

  const listings = listingsData?.listings || [];
  
  // Calculate statistics
  const stats = {
    total: listingsData?.total || 0,
    active: listings.filter((l: any) => l.status === 'available' || l.status === 'active').length,
    totalViews: listings.reduce((sum: number, l: any) => sum + (l.views || l.viewCount || 0), 0),
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-grey-900 mb-1 sm:mb-2">Profile Settings</h1>
          <p className="text-sm sm:text-base text-grey-600">Manage your profile information</p>
        </div>
        <Link
          href="/landlord/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors font-semibold text-sm sm:text-base shadow-medium hover:shadow-lg"
        >
          <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
          Dashboard
        </Link>
      </div>

      {/* Overview Section with Statistics */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-grey-200">
        <h2 className="text-lg sm:text-xl font-bold text-grey-900 mb-4 sm:mb-6">Overview</h2>
        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-grey-100 rounded-lg p-4 animate-pulse">
                <div className="h-16 bg-grey-200 rounded" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/landlord/listings"
              className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-grey-200 hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-primary-100 rounded-lg">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-grey-900">{stats.total}</span>
              </div>
              <p className="text-xs sm:text-sm text-grey-600 font-medium">Total Listings</p>
            </Link>

            <Link
              href="/landlord/listings?status=available"
              className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-grey-200 hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-grey-900">{stats.active}</span>
              </div>
              <p className="text-xs sm:text-sm text-grey-600 font-medium">Active Listings</p>
            </Link>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-grey-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-grey-900">{stats.totalViews.toLocaleString()}</span>
              </div>
              <p className="text-xs sm:text-sm text-grey-600 font-medium">Total Views</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Home className="w-12 h-12 sm:w-16 sm:h-16 text-grey-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-grey-600 mb-3 sm:mb-4">No listings yet</p>
            <Link
              href="/listings/create"
              className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors font-semibold text-sm sm:text-base"
            >
              Create Your First Listing
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 sm:p-6 shadow-lg border border-primary-400">
            <div className="text-center">
              <div className="relative inline-block mb-3 sm:mb-4">
                {profileImage ? (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                    <Image
                      src={profileImage}
                      alt={user?.name || 'Profile'}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-2 sm:p-2.5 bg-white text-primary-600 rounded-full cursor-pointer hover:bg-grey-50 active:scale-95 transition-all shadow-lg">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{user?.name}</h2>
              <p className="text-xs sm:text-sm text-white/90 mb-3 sm:mb-4">{user?.email}</p>
              <span className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-semibold">
                LANDLORD
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 sm:p-6 shadow-medium border border-grey-200 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-grey-900">Personal Information</h2>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 sm:px-4 py-2 text-primary-600 hover:bg-primary-50 active:bg-primary-100 rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-grey-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-grey-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 text-sm sm:text-base border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-grey-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-grey-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-grey-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 text-sm sm:text-base border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-grey-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-grey-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-grey-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 text-sm sm:text-base border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-grey-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-grey-700 mb-2">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-grey-400" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 text-sm sm:text-base border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-grey-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-grey-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-grey-50"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-grey-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-grey-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-grey-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-grey-50 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-grey-200">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors font-semibold disabled:opacity-50 text-sm sm:text-base"
                >
                  <Save className="w-4 h-4" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: (user as any)?.phone || '',
                      bio: (user as any)?.bio || '',
                      address: (user as any)?.address || '',
                      city: (user as any)?.city || '',
                      state: (user as any)?.state || '',
                      zip: (user as any)?.zip || '',
                    });
                  }}
                  className="px-6 py-3 border border-grey-300 rounded-lg hover:bg-grey-50 active:bg-grey-100 transition-colors font-semibold text-grey-700 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

