'use client';

export const dynamic = 'force-dynamic';

import { use, useEffect } from 'react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Trash2, Edit, Eye, MapPin, Calendar, DollarSign, Building2, BedDouble, Bath, Ruler, Check, X, Sparkles, Home, Phone, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { imageKitPresets } from '@/lib/imagekit';

interface EditListingForm {
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  status: 'available' | 'pending' | 'rented' | 'inactive';
  propertyType?: string;
  petFriendly: boolean;
  smokingAllowed: boolean;
  parkingAvailable: boolean;
  city: string;
  state: string;
  zip?: string;
  address?: string;
}

export default function AdminListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const listingId = resolvedParams.id;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { data: listingData, isLoading, error: queryError } = useQuery<{ listing: Listing }>({
    queryKey: ['admin-listing', listingId],
    queryFn: async () => {
      try {
        const response = await api.get(`/listings/${listingId}`);
        
        // Backend returns: { success: true, data: listing }
        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch listing');
        }
        
        const backendData = response.data.data;
        
        if (!backendData) {
          throw new Error('Listing data not found in response');
        }
        
        // Backend returns raw Prisma data with 'id' and 'landlord' (not 'landlordId')
        // Transform to match frontend Listing type
        return {
          listing: {
            _id: backendData.id || backendData._id || listingId,
            id: backendData.id || listingId,
            title: backendData.title || '',
            description: backendData.description || '',
            price: backendData.price || 0,
            bedrooms: backendData.bedrooms,
            bathrooms: backendData.bathrooms,
            squareFeet: backendData.squareFeet,
            location: {
              city: backendData.city || '',
              state: backendData.state || '',
              zip: backendData.zip,
              address: backendData.address,
              coordinates: (backendData.latitude && backendData.longitude) ? {
                lat: backendData.latitude,
                lng: backendData.longitude,
              } : undefined,
            },
            images: backendData.images || [],
            amenities: backendData.amenities || [],
            availabilityDate: backendData.availabilityDate ? new Date(backendData.availabilityDate).toISOString() : new Date().toISOString(),
            status: backendData.status,
            createdAt: backendData.createdAt ? new Date(backendData.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: backendData.updatedAt ? new Date(backendData.updatedAt).toISOString() : new Date().toISOString(),
            propertyType: backendData.propertyType,
            petFriendly: backendData.petFriendly || false,
            smokingAllowed: backendData.smokingAllowed || false,
            parkingAvailable: backendData.parkingAvailable || false,
            genderPreference: backendData.genderPreference,
            walkabilityScore: backendData.walkabilityScore,
            nearbyUniversities: backendData.nearbyUniversities || [],
            nearbyTransit: backendData.nearbyTransit || [],
            viewCount: backendData.viewCount || 0,
            landlordId: backendData.landlord ? {
              _id: backendData.landlord.id || '',
              name: backendData.landlord.name || 'N/A',
              email: backendData.landlord.email || 'N/A',
              profileImage: backendData.landlord.profileImage,
            } : {
              _id: '',
              name: 'N/A',
              email: 'N/A',
            },
          },
        };
      } catch (err: any) {
        console.error('Error fetching listing:', err);
        console.error('Response:', err.response?.data);
        throw err;
      }
    },
    enabled: !!listingId,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditListingForm>({
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: undefined,
      status: 'available',
      propertyType: '',
      petFriendly: false,
      smokingAllowed: false,
      parkingAvailable: false,
      city: '',
      state: '',
      zip: '',
      address: '',
    },
  });

  // Populate form when listing data loads
  useEffect(() => {
    if (listingData?.listing && !isEditing) {
      const listing = listingData.listing;
      setValue('title', listing.title);
      setValue('description', listing.description);
      setValue('price', listing.price);
      setValue('bedrooms', listing.bedrooms || 0);
      setValue('bathrooms', listing.bathrooms || 0);
      setValue('squareFeet', listing.squareFeet);
      setValue('status', listing.status as any);
      setValue('propertyType', listing.propertyType || '');
      setValue('petFriendly', listing.petFriendly || false);
      setValue('smokingAllowed', listing.smokingAllowed || false);
      setValue('parkingAvailable', listing.parkingAvailable || false);
      setValue('city', listing.location?.city || '');
      setValue('state', listing.location?.state || '');
      setValue('zip', listing.location?.zip || '');
      setValue('address', listing.location?.address || '');
    }
  }, [listingData, setValue, isEditing]);

  const onSubmit = async (data: EditListingForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Transform form data to match backend UpdateListingDto
      const updateData = {
        title: data.title,
        description: data.description,
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        squareFeet: data.squareFeet,
        status: data.status,
        propertyType: data.propertyType || undefined,
        petFriendly: data.petFriendly,
        smokingAllowed: data.smokingAllowed,
        parkingAvailable: data.parkingAvailable,
        location: {
          city: data.city,
          state: data.state,
          zip: data.zip || undefined,
          address: data.address || undefined,
        },
      };

      const response = await api.patch(`/listings/${listingId}`, updateData);
      
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-listing', listingId] });
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
        setIsEditing(false);
      } else {
        setError(response.data.error || 'Failed to update listing');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/listings/${listingId}`);
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
        router.push('/admin/listings');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete listing');
    }
  };

  const handleStatusChange = async (newStatus: 'available' | 'pending' | 'rented' | 'inactive') => {
    try {
      await api.put(`/listings/${listingId}/status`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['admin-listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update listing status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-2">Error loading listing</p>
        <p className="text-dark-text-muted text-sm mb-4">
          {queryError instanceof Error ? queryError.message : 'Unknown error occurred'}
        </p>
        <Link href="/admin/listings" className="text-primary-400 hover:underline">
          Back to Listings
        </Link>
      </div>
    );
  }

  if (!listingData?.listing) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-text-secondary mb-4">Listing not found</p>
        <Link href="/admin/listings" className="text-primary-400 hover:underline">
          Back to Listings
        </Link>
      </div>
    );
  }

  const listing = listingData.listing;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rented':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'inactive':
        return 'bg-grey-500/20 text-grey-400 border-grey-500/30';
      default:
        return 'bg-dark-bg-tertiary text-dark-text-secondary border-dark-border-default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/listings"
            className="p-2 text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-tertiary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-dark-text-primary">Listing Details</h1>
            <p className="text-dark-text-secondary">{listing.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/listings/${listing._id}`}
            target="_blank"
            className="px-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-secondary hover:text-primary-400 hover:border-primary-500/50 transition-colors font-semibold flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Public Page
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-semibold flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border-2 border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {listing.images && listing.images.length > 0 && (
            <div className="bg-dark-bg-secondary rounded-xl overflow-hidden shadow-dark-medium border border-dark-border-default">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
                {listing.images.slice(0, 6).map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                    <img
                      src={image.includes('ik.imagekit.io') ? imageKitPresets.card(image) : image}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-dark-bg-secondary rounded-xl p-6 shadow-dark-medium border border-dark-border-default">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark-text-primary">Basic Information</h2>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-text-secondary mb-2">Title</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-3 border-2 border-dark-border-default rounded-lg bg-dark-bg-tertiary text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark-text-secondary mb-2">Description</label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-dark-border-default rounded-lg bg-dark-bg-tertiary text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.description && <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-text-secondary mb-2">Price ($/month)</label>
                    <input
                      {...register('price', { required: 'Price is required', min: 0 })}
                      type="number"
                      className="w-full px-4 py-3 border-2 border-dark-border-default rounded-lg bg-dark-bg-tertiary text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.price && <p className="text-sm text-red-400 mt-1">{errors.price.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark-text-secondary mb-2">Status</label>
                    <select
                      {...register('status')}
                      className="w-full px-4 py-3 border-2 border-dark-border-default rounded-lg bg-dark-bg-tertiary text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="rented">Rented</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-text-secondary mb-2">Bedrooms</label>
                    <input
                      {...register('bedrooms', { required: 'Bedrooms is required', min: 0 })}
                      type="number"
                      className="w-full px-4 py-3 border-2 border-dark-border-default rounded-lg bg-dark-bg-tertiary text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-text-secondary mb-2">Bathrooms</label>
                    <input
                      {...register('bathrooms', { required: 'Bathrooms is required', min: 0 })}
                      type="number"
                      step="0.5"
                      className="w-full px-4 py-3 border-2 border-dark-border-default rounded-lg bg-dark-bg-tertiary text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-text-secondary mb-2">Square Feet</label>
                    <input
                      {...register('squareFeet', { min: 0 })}
                      type="number"
                      className="w-full px-4 py-3 border-2 border-dark-border-default rounded-lg bg-dark-bg-tertiary text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-dark-border-default">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
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
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-dark-text-muted mb-1">Title</p>
                  <p className="text-lg font-semibold text-dark-text-primary">{listing.title}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-text-muted mb-1">Description</p>
                  <p className="text-dark-text-secondary whitespace-pre-wrap">{listing.description}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-dark-border-default">
                  <div>
                    <p className="text-sm text-dark-text-muted mb-1">Price</p>
                    <p className="text-xl font-bold text-primary-400">${listing.price.toLocaleString()}/mo</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-muted mb-1">Bedrooms</p>
                    <p className="text-lg font-semibold text-dark-text-primary flex items-center gap-1">
                      <BedDouble className="w-4 h-4" />
                      {listing.bedrooms || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-muted mb-1">Bathrooms</p>
                    <p className="text-lg font-semibold text-dark-text-primary flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {listing.bathrooms || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-text-muted mb-1">Square Feet</p>
                    <p className="text-lg font-semibold text-dark-text-primary flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      {listing.squareFeet ? listing.squareFeet.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location Information */}
          <div className="bg-dark-bg-secondary rounded-xl p-6 shadow-dark-medium border border-dark-border-default">
            <h2 className="text-xl font-bold text-dark-text-primary mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h2>
            <div className="space-y-2">
              <p className="text-dark-text-primary">
                {listing.location?.address && (
                  <>
                    <span className="font-semibold">{listing.location.address}</span>
                    <br />
                  </>
                )}
                {listing.location?.city && listing.location?.state ? (
                  `${listing.location.city}, ${listing.location.state}${listing.location.zip ? ` ${listing.location.zip}` : ''}`
                ) : (
                  'Location not specified'
                )}
              </p>
              {listing.location?.coordinates && (
                <p className="text-sm text-dark-text-muted">
                  Coordinates: {listing.location.coordinates.lat.toFixed(6)}, {listing.location.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="bg-dark-bg-secondary rounded-xl p-6 shadow-dark-medium border border-dark-border-default">
              <h2 className="text-xl font-bold text-dark-text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium border border-primary-500/30"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="bg-dark-bg-secondary rounded-xl p-6 shadow-dark-medium border border-dark-border-default">
            <h2 className="text-xl font-bold text-dark-text-primary mb-4">Additional Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-dark-text-muted">Property Type:</span>
                <span className="text-dark-text-primary font-medium capitalize">{listing.propertyType || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-dark-text-muted">Pet Friendly:</span>
                {listing.petFriendly ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Yes
                  </span>
                ) : (
                  <span className="text-grey-400 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    No
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-dark-text-muted">Smoking Allowed:</span>
                {listing.smokingAllowed ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Yes
                  </span>
                ) : (
                  <span className="text-grey-400 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    No
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-dark-text-muted">Parking Available:</span>
                {listing.parkingAvailable ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Yes
                  </span>
                ) : (
                  <span className="text-grey-400 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    No
                  </span>
                )}
              </div>
              {listing.genderPreference && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-dark-text-muted">Gender Preference:</span>
                  <span className="text-dark-text-primary font-medium capitalize">{listing.genderPreference}</span>
                </div>
              )}
              {listing.walkabilityScore && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-dark-text-muted">Walkability Score:</span>
                  <span className="text-dark-text-primary font-medium">{listing.walkabilityScore}/100</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-dark-bg-secondary rounded-xl p-6 shadow-dark-medium border border-dark-border-default">
            <h3 className="text-lg font-bold text-dark-text-primary mb-4">Status</h3>
            <div className="space-y-3">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusBadgeColor(listing.status)}`}>
                {listing.status === 'available' ? 'Active' : listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </span>
              <div className="flex flex-col gap-2 pt-2 border-t border-dark-border-default">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('available')}
                  disabled={listing.status === 'available'}
                  className="w-full"
                >
                  Set Active
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('pending')}
                  disabled={listing.status === 'pending'}
                  className="w-full"
                >
                  Set Pending
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('rented')}
                  disabled={listing.status === 'rented'}
                  className="w-full"
                >
                  Set Rented
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('inactive')}
                  disabled={listing.status === 'inactive'}
                  className="w-full"
                >
                  Set Inactive
                </Button>
              </div>
            </div>
          </div>

          {/* Landlord Information */}
          <div className="bg-dark-bg-secondary rounded-xl p-6 shadow-dark-medium border border-dark-border-default">
            <h3 className="text-lg font-bold text-dark-text-primary mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Landlord
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-dark-text-muted mb-1">Name</p>
                <p className="text-dark-text-primary font-semibold">{listing.landlordId?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-dark-text-muted mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-dark-text-muted" />
                  <a
                    href={`mailto:${listing.landlordId?.email}`}
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {listing.landlordId?.email || 'N/A'}
                  </a>
                </div>
              </div>
              <Link
                href={`/admin/users/${listing.landlordId?._id || ''}`}
                className="block mt-4 text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium"
              >
                View Landlord Profile →
              </Link>
            </div>
          </div>

          {/* Listing Statistics */}
          <div className="bg-dark-bg-secondary rounded-xl p-6 shadow-dark-medium border border-dark-border-default">
            <h3 className="text-lg font-bold text-dark-text-primary mb-4">Statistics</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-dark-text-muted mb-1">Views</p>
                <p className="text-dark-text-primary font-semibold">{listing.viewCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-dark-text-muted mb-1">Created</p>
                <p className="text-dark-text-primary font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {listing.createdAt ? format(new Date(listing.createdAt), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-text-muted mb-1">Last Updated</p>
                <p className="text-dark-text-primary font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {listing.updatedAt ? format(new Date(listing.updatedAt), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-text-muted mb-1">Availability Date</p>
                <p className="text-dark-text-primary font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {listing.availabilityDate ? format(new Date(listing.availabilityDate), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Nearby Information */}
          {(listing.nearbyUniversities && listing.nearbyUniversities.length > 0) || (listing.nearbyTransit && listing.nearbyTransit.length > 0) ? (
            <div className="bg-dark-bg-secondary rounded-xl p-6 shadow-dark-medium border border-dark-border-default">
              <h3 className="text-lg font-bold text-dark-text-primary mb-4">Nearby</h3>
              {listing.nearbyUniversities && listing.nearbyUniversities.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-dark-text-muted mb-2">Universities</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.nearbyUniversities.map((uni, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium"
                      >
                        {uni}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {listing.nearbyTransit && listing.nearbyTransit.length > 0 && (
                <div>
                  <p className="text-sm text-dark-text-muted mb-2">Transit</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.nearbyTransit.map((transit, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium"
                      >
                        {transit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

