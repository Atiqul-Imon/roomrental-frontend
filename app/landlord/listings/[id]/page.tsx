'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { queryConfig } from '@/lib/query-config';
import dynamicImport from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Bed, 
  Bath, 
  Square, 
  Clock, 
  CheckCircle2,
  ArrowLeft,
  Eye,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/ToastProvider';

// Lazy load ImageGallery
const ImageGallery = dynamicImport(() => import('@/components/listings/ImageGallery').then((mod) => ({ default: mod.ImageGallery })), {
  loading: () => <div className="h-96 bg-grey-100 animate-pulse rounded-xl" />,
  ssr: true,
});

export default function LandlordListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const listingId = resolvedParams.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    ...queryConfig.listingDetail,
    queryFn: async () => {
      try {
        const response = await api.get(`/listings/${listingId}`);
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch listing');
        }
        
        const listing = response.data.data;
        
        // Handle both flat structure (city, state) and nested structure (location.city)
        const city = listing.city || listing.location?.city || '';
        const state = listing.state || listing.location?.state || '';
        const zip = listing.zip || listing.location?.zip || '';
        const address = listing.address || listing.location?.address || '';
        const latitude = listing.latitude || listing.location?.latitude || listing.location?.coordinates?.lat;
        const longitude = listing.longitude || listing.location?.longitude || listing.location?.coordinates?.lng;
        
        // Handle landlord data
        const landlordId = listing.landlord?.id || listing.landlordId || '';
        const landlordName = listing.landlord?.name || '';
        const landlordEmail = listing.landlord?.email || '';
        const landlordProfileImage = listing.landlord?.profileImage || null;
        
        const transformedListing = {
          _id: listing.id || listing._id,
          landlordId: {
            _id: landlordId,
            name: landlordName,
            email: landlordEmail,
            profileImage: landlordProfileImage,
          },
          title: listing.title || '',
          description: listing.description || '',
          price: listing.price || 0,
          bedrooms: listing.bedrooms || 1,
          bathrooms: listing.bathrooms || 1,
          squareFeet: listing.squareFeet || null,
          location: {
            city: city,
            state: state,
            zip: zip || undefined,
            address: address || undefined,
            coordinates: latitude && longitude
              ? { lat: Number(latitude), lng: Number(longitude) }
              : undefined,
          },
          images: listing.images || [],
          amenities: listing.amenities || [],
          propertyType: listing.propertyType || 'apartment',
          availabilityDate: listing.availabilityDate || new Date().toISOString(),
          status: listing.status || 'available',
          createdAt: listing.createdAt || new Date().toISOString(),
          updatedAt: listing.updatedAt || new Date().toISOString(),
        };
        
        return transformedListing as Listing;
      } catch (err: any) {
        console.error('Error fetching listing:', err);
        throw new Error(err.response?.data?.error || err.message || 'Failed to fetch listing');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/listings/${listingId}`);
    },
    onSuccess: () => {
      // Invalidate all listing-related caches
      queryClient.invalidateQueries({ queryKey: ['listings'] }); // Public listings
      queryClient.invalidateQueries({ queryKey: ['my-listings'] }); // Landlord listings
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] }); // Admin listings
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] }); // Specific listing
      toast.success('Listing deleted successfully');
      router.push('/landlord/listings');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete listing');
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.patch(`/listings/${listingId}/status`, { status });
    },
    onSuccess: () => {
      // Invalidate all listing-related caches
      queryClient.invalidateQueries({ queryKey: ['listings'] }); // Public listings
      queryClient.invalidateQueries({ queryKey: ['my-listings'] }); // Landlord listings
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] }); // Admin listings
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] }); // Specific listing
      toast.success('Listing status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update status');
    },
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    deleteMutation.mutate();
  };

  const handleStatusChange = (status: string) => {
    statusMutation.mutate(status);
  };

  // Check if user owns this listing
  const isOwner = user?.id === data?.landlordId._id;

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Listing Not Found"
        message={error instanceof Error ? error.message : "The listing you're looking for doesn't exist or has been removed."}
        actionLabel="Back to Listings"
        actionHref="/landlord/listings"
      />
    );
  }

  // Verify ownership
  if (!isOwner) {
    return (
      <ErrorState
        title="Unauthorized"
        message="You don't have permission to view this listing."
        actionLabel="Back to Listings"
        actionHref="/landlord/listings"
      />
    );
  }

  const city = data.location.city || '';
  const state = data.location.state || '';
  const zip = data.location.zip || '';
  const address = data.location.address || '';
  const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');

  return (
    <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/landlord/listings"
              className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-grey-600" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-grey-900">{data.title}</h1>
              <p className="text-grey-600 mt-1">{fullAddress || 'Address not provided'}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/listings/${listingId}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-grey-100 text-grey-700 rounded-lg hover:bg-grey-200 transition-colors font-medium"
            >
              <Eye className="w-4 h-4" />
              View Public
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href={`/listings/${listingId}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Status Badge and Quick Info */}
        <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-grey-700 mb-2 block">Status</label>
                <select
                  value={data.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusMutation.isPending}
                  className="px-4 py-2 border border-grey-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="rented">Rented</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="text-sm text-grey-600">
                <p><strong>Created:</strong> {data.createdAt ? format(new Date(data.createdAt), 'MMM dd, yyyy') : 'N/A'}</p>
                <p><strong>Last Updated:</strong> {data.updatedAt ? format(new Date(data.updatedAt), 'MMM dd, yyyy') : 'N/A'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">${data.price.toLocaleString()}</div>
              <div className="text-sm text-grey-600">per month</div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {data.images && data.images.length > 0 && (
          <div className="bg-white rounded-xl overflow-hidden shadow-medium border border-grey-200">
            <ImageGallery images={data.images} />
          </div>
        )}

        {/* Quick Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-medium border border-grey-200 text-center">
            <Bed className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-grey-900">{data.bedrooms}</div>
            <div className="text-sm text-grey-600">Bedrooms</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-medium border border-grey-200 text-center">
            <Bath className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-grey-900">{data.bathrooms}</div>
            <div className="text-sm text-grey-600">Bathrooms</div>
          </div>
          {data.squareFeet && (
            <div className="bg-white rounded-xl p-4 shadow-medium border border-grey-200 text-center">
              <Square className="w-6 h-6 text-primary-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-grey-900">{data.squareFeet.toLocaleString()}</div>
              <div className="text-sm text-grey-600">Sq Ft</div>
            </div>
          )}
          <div className="bg-white rounded-xl p-4 shadow-medium border border-grey-200 text-center">
            <Calendar className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-grey-900">
              {data.availabilityDate ? format(new Date(data.availabilityDate), 'MMM dd') : 'N/A'}
            </div>
            <div className="text-sm text-grey-600">Available</div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-medium border border-grey-200">
          <h2 className="text-xl sm:text-2xl font-bold text-grey-900 mb-4">Description</h2>
          <p className="text-grey-700 leading-relaxed whitespace-pre-wrap">{data.description}</p>
        </div>

        {/* Amenities */}
        {data.amenities && data.amenities.length > 0 && (
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-medium border border-grey-200">
            <h2 className="text-xl sm:text-2xl font-bold text-grey-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 text-grey-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="capitalize">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Details */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-medium border border-grey-200">
          <h2 className="text-xl sm:text-2xl font-bold text-grey-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary-500" />
            Location
          </h2>
          <div className="space-y-2 text-grey-700">
            {address && <p><strong>Address:</strong> {address}</p>}
            <p><strong>City:</strong> {city}</p>
            <p><strong>State:</strong> {state}</p>
            {zip && <p><strong>ZIP Code:</strong> {zip}</p>}
          </div>
        </div>
    </div>
  );
}

