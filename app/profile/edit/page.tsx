'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface UploadError {
  message: string;
  type: 'size' | 'type' | 'network' | 'server' | 'unknown';
}

export default function EditProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
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
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push(`/profile/${user?.id}`);
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  // Validate file before upload (strict 100KB limit for profile images)
  const validateFile = (file: File): UploadError | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        message: 'Please select an image file (JPG, PNG, GIF, etc.)',
        type: 'type',
      };
    }

    // Strict file size check for profile images (100KB max)
    const maxSize = 100 * 1024; // 100KB
    if (file.size > maxSize) {
      const fileSizeKB = (file.size / 1024).toFixed(2);
      return {
        message: `Profile image size exceeds 100KB limit. Your file is ${fileSizeKB}KB. Please compress or resize the image.`,
        type: 'size',
      };
    }

    // Check if file is too small (likely corrupted)
    if (file.size < 100) {
      return {
        message: 'File appears to be corrupted or too small',
        type: 'type',
      };
    }

    return null;
  };

  const handleImageUpload = async (file: File) => {
    // Reset previous states
    setUploadError(null);
    setUploadSuccess(false);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setIsUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      // Don't set Content-Type header - let browser set it with boundary
      const response = await api.post('/upload/image', formDataToSend, {
        headers: {
          // Remove Content-Type to let browser set it automatically with boundary
        },
        // Set timeout for large files
        timeout: 60000, // 60 seconds
      });

      if (response.data.success && response.data.data?.url) {
        setFormData((prev) => ({
          ...prev,
          profileImage: response.data.data.url,
        }));
        setUploadSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        throw new Error('Upload failed: Invalid response from server');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Failed to upload image';
      let errorType: UploadError['type'] = 'unknown';

      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const serverMessage = error.response.data?.error || error.response.data?.message;

        if (status === 400) {
          errorType = 'server';
          errorMessage = serverMessage || 'Invalid file format or file too large (max 100KB for profile images)';
        } else if (status === 401) {
          errorType = 'server';
          errorMessage = 'Please log in again to upload images';
        } else if (status === 413) {
          errorType = 'size';
          errorMessage = 'File is too large. Maximum size is 100KB for profile images';
        } else if (status >= 500) {
          errorType = 'server';
          errorMessage = 'Server error. Please try again later';
        } else {
          errorMessage = serverMessage || `Upload failed (${status})`;
        }
      } else if (error.request) {
        // Request was made but no response
        errorType = 'network';
        errorMessage = 'Network error. Please check your connection and try again';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setUploadError({
        message: errorMessage,
        type: errorType,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
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
      <main className="min-h-screen bg-grey-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-grey-900">Edit Profile</h1>
          <div className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 shadow-medium border border-grey-200">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium mb-2 text-grey-900">Profile Image</label>
                <div className="flex items-center gap-4">
                  {formData.profileImage ? (
                    <div className="relative">
                      <Image
                        src={formData.profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="rounded-full border-4 border-white shadow-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, profileImage: '' }));
                          setUploadError(null);
                          setUploadSuccess(false);
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-medium"
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center border-4 border-white shadow-medium">
                      <span className="text-5xl font-bold text-white">
                        {formData.name.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all cursor-pointer ${
                        isUploading
                          ? 'border-grey-300 bg-grey-100 cursor-not-allowed'
                          : 'border-primary-500 bg-white text-primary-600 hover:bg-primary-50 hover:border-primary-600'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </label>
                    <p className="text-xs text-grey-500 mt-2">
                      JPG, PNG, GIF or WEBP. Max size: <span className="font-semibold text-grey-700">100KB</span>
                    </p>
                  </div>
                </div>

                {/* Upload Error */}
                {uploadError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900">Upload Failed</p>
                      <p className="text-sm text-red-700">{uploadError.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadError(null)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Dismiss error"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload Success */}
                {uploadSuccess && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">Image uploaded successfully!</p>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-grey-900">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-2 text-grey-900">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-grey-500 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2 text-grey-900">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Notification Preferences */}
              <div>
                <label className="block text-sm font-medium mb-4 text-grey-900">Notification Preferences</label>
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
                      className="w-4 h-4 text-primary-600 border-grey-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-grey-700">Email Notifications</span>
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
                      className="w-4 h-4 text-primary-600 border-grey-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-grey-700">Push Notifications</span>
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
                      className="w-4 h-4 text-primary-600 border-grey-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-grey-700">SMS Notifications</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-grey-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-grey-300 rounded-lg hover:bg-grey-50 transition-colors font-medium text-grey-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || isUploading}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>

              {updateMutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Failed to update profile</p>
                    <p>Please try again. If the problem persists, contact support.</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
