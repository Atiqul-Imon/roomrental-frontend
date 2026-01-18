'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { Header } from '@/components/layout/Header';
import { LandlordLayout } from '@/components/landlord/LandlordLayout';
import { EditListingForm } from '@/components/listings/EditListingForm';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { PageSkeleton } from '@/components/LoadingSkeleton';

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const listingId = resolvedParams.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const response = await api.get(`/listings/${listingId}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch listing');
      }
      
      const listing = response.data.data;
      
      // Transform to match Listing type structure
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
      
      return {
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
      } as Listing;
    },
  });

  // Check if user is a landlord to use LandlordLayout
  const isLandlord = user?.role === 'landlord';

  if (authLoading || isLoading) {
    if (isLandlord) {
      return (
        <LandlordLayout>
          <PageSkeleton />
        </LandlordLayout>
      );
    }
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <PageSkeleton />
        </main>
      </>
    );
  }

  if (error || !data) {
    if (isLandlord) {
      return (
        <LandlordLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
            <Link
              href="/landlord/listings"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition"
            >
              Back to Listings
            </Link>
          </div>
        </LandlordLayout>
      );
    }
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Check ownership - compare as strings for consistency
  const isOwner = user?.id && data?.landlordId?._id 
    ? String(user.id) === String(data.landlordId._id)
    : false;

  if (!isOwner) {
    if (isLandlord) {
      return (
        <LandlordLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
            <p className="text-grey-600 mb-6">
              You don&apos;t have permission to edit this listing.
            </p>
            <Link
              href="/landlord/listings"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition"
            >
              Back to Listings
            </Link>
          </div>
        </LandlordLayout>
      );
    }
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
              <p className="text-muted-foreground mb-6">
                You don&apos;t have permission to edit this listing.
              </p>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isLandlord) {
    return (
      <LandlordLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-grey-900">Edit Listing</h1>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-medium border border-grey-200">
            <div className="max-w-3xl">
              <EditListingForm
                listing={data}
                onSuccess={() => {
                  router.push(`/landlord/listings/${listingId}`);
                }}
              />
            </div>
          </div>
        </div>
      </LandlordLayout>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>
          <div className="max-w-3xl">
            <EditListingForm
              listing={data}
              onSuccess={() => {
                router.push(`/listings/${listingId}`);
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}

