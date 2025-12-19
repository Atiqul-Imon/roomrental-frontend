'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

export default function EditProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    pushNotifications: user?.preferences?.pushNotifications ?? true,
    smsNotifications: user?.preferences?.smsNotifications ?? false,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.patch('/profile', {
        name: data.name,
        bio: data.bio,
        phone: data.phone,
        profileImage: data.profileImage,
        preferences: {
          emailNotifications: data.emailNotifications,
          pushNotifications: data.pushNotifications,
          smsNotifications: data.smsNotifications,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.push(`/profile/${user?.id}`);
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

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
        setFormData((prev) => ({
          ...prev,
          profileImage: response.data.data.url,
        }));
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

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
          <div className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Profile Image</label>
                <div className="flex items-center gap-4">
                  {formData.profileImage ? (
                    <div className="relative">
                      <Image
                        src={formData.profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="rounded-full"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, profileImage: '' }))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-4xl font-semibold">
                        {formData.name.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      disabled={isUploading}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition cursor-pointer inline-block"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Notification Preferences */}
              <div>
                <label className="block text-sm font-medium mb-4">Notification Preferences</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emailNotifications: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.pushNotifications}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pushNotifications: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Push Notifications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.smsNotifications}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          smsNotifications: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">SMS Notifications</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {updateMutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  Failed to update profile. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

