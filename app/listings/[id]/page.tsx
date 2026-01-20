'use client';

// Note: ISR (revalidate) cannot be used in client components
// Caching is handled by React Query with queryConfig.listingDetail
// (2 minutes staleTime, 5 minutes gcTime)

import { use } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { queryConfig } from '@/lib/query-config';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import dynamic from 'next/dynamic';

// Lazy load ImageGallery - only load when viewing listing details
const ImageGallery = dynamic(() => import('@/components/listings/ImageGallery').then((mod) => ({ default: mod.ImageGallery })), {
  loading: () => <div className="h-96 bg-grey-100 animate-pulse rounded-xl" />,
  ssr: true, // Image gallery can be SSR'd
});
import { ContactButton } from '@/components/listings/ContactButton';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import { MapPin, Calendar, DollarSign, Edit, Trash2, Bed, Bath, Square, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/ToastProvider';
import { StructuredData } from '@/components/seo/StructuredData';
import {
  generateProductSchema,
  generatePlaceSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/structured-data';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const listingId = resolvedParams.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    ...queryConfig.listingDetail,
    queryFn: async () => {
      try {
        const response = await api.get(`/listings/${listingId}`);
        console.log('Listing API response:', response.data);
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch listing');
        }
        
        const listing = response.data.data;
        console.log('Listing data:', listing);
        
        // Handle both flat structure (city, state) and nested structure (location.city)
        const city = listing.city || listing.location?.city || '';
        const state = listing.state || listing.location?.state || '';
        const zip = listing.zip || listing.location?.zip || '';
        const address = listing.address || listing.location?.address || '';
        const latitude = listing.latitude || listing.location?.latitude || listing.location?.coordinates?.lat;
        const longitude = listing.longitude || listing.location?.longitude || listing.location?.coordinates?.lng;
        
        // Handle landlord data - can be nested or flat
        const landlordId = listing.landlord?.id || listing.landlordId || '';
        const landlordName = listing.landlord?.name || '';
        const landlordEmail = listing.landlord?.email || '';
        const landlordProfileImage = listing.landlord?.profileImage || null;
        const landlordRole = listing.landlord?.role || 'landlord';
        const landlordBio = listing.landlord?.bio || null;
        
        const transformedListing = {
          _id: listing.id || listing._id,
          landlordId: {
            _id: landlordId,
            name: landlordName,
            email: landlordEmail,
            profileImage: landlordProfileImage,
            role: landlordRole,
            ...(landlordBio && { bio: landlordBio }),
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
          images: Array.isArray(listing.images) ? listing.images : [],
          amenities: Array.isArray(listing.amenities) ? listing.amenities : [],
          availabilityDate: listing.availabilityDate || new Date().toISOString(),
          status: listing.status || 'available',
          createdAt: listing.createdAt || new Date().toISOString(),
          updatedAt: listing.updatedAt || new Date().toISOString(),
        } as Listing;
        
        console.log('Transformed listing:', transformedListing);
        return transformedListing;
      } catch (error: any) {
        console.error('Error fetching listing:', error);
        console.error('Error response:', error.response?.data);
        throw error;
      }
    },
  });

  const isOwner = isAuthenticated && user?.id && data?.landlordId?._id 
    ? String(user.id) === String(data.landlordId._id)
    : false;
  const formattedDate = data && data.availabilityDate 
    ? (() => {
        try {
          return format(new Date(data.availabilityDate), 'MMMM dd, yyyy');
        } catch (error) {
          console.error('Error formatting date:', error, data.availabilityDate);
          return 'Date not available';
        }
      })()
    : '';

  const { success, error: showError } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await api.delete(`/listings/${listingId}`);
      // Invalidate all listing-related caches
      queryClient.invalidateQueries({ queryKey: ['listings'] }); // Public listings
      queryClient.invalidateQueries({ queryKey: ['my-listings'] }); // Landlord listings
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] }); // Admin listings
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] }); // Specific listing
      router.push('/dashboard');
    } catch (error) {
      alert('Failed to delete listing');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-comfort">
          <div className="container mx-auto px-4 py-8">
            <PageSkeleton />
          </div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-comfort">
          <div className="container mx-auto px-4 py-8">
            <ErrorState
              title="Listing Not Found"
              message="The listing you're looking for doesn't exist or has been removed."
              actionLabel="Browse Listings"
              actionHref="/listings"
            />
          </div>
        </main>
      </>
    );
  }

  // Generate structured data for SEO
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';
  const listingUrl = `${siteUrl}/listings/${listingId}`;
  const city = data.location.city || '';
  const state = data.location.state || '';
  const zip = data.location.zip || '';
  const address = data.location.address || '';
  
  const productSchema = generateProductSchema({
    name: data.title,
    description: data.description || `${data.title} in ${city}, ${state}`,
    image: data.images && data.images.length > 0 ? data.images : [`${siteUrl}/og-image.jpg`],
    offers: {
      price: data.price,
      priceCurrency: 'USD',
      availability: data.status === 'available' ? 'InStock' : 'OutOfStock',
      url: listingUrl,
      validFrom: data.availabilityDate || new Date().toISOString(),
    },
  });

  const placeSchema = data.location.coordinates
    ? generatePlaceSchema({
        name: data.title,
        description: `Room rental located in ${city}, ${state}`,
        address: {
          addressLocality: city,
          addressRegion: state,
          postalCode: zip,
          addressCountry: 'US',
          ...(address && { streetAddress: address }),
        },
        geo: {
          latitude: data.location.coordinates.lat,
          longitude: data.location.coordinates.lng,
        },
        image: data.images && data.images.length > 0 ? data.images : undefined,
      })
    : null;

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: siteUrl },
      { name: 'Listings', url: `${siteUrl}/listings` },
      ...(city && state
        ? [
            { name: `${city}, ${state}`, url: `${siteUrl}/listings?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}` },
          ]
        : []),
      { name: data.title, url: listingUrl },
    ],
  });

  const structuredData = [productSchema, breadcrumbSchema, placeSchema].filter(Boolean);

  return (
    <>
      <StructuredData data={structuredData} />
      <Header />
      <main className="min-h-screen bg-gradient-comfort pb-32 md:pb-8">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 fade-in">
          {/* Image Gallery - Enhanced with better shadow */}
          <div className="mb-6 sm:mb-8 md:mb-10 bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            <ImageGallery images={data.images} title={data.title} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Title and Header Section - Enhanced */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-100 overflow-hidden relative">
                {/* Decorative gradient background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent-100/30 to-transparent rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8 sm:mb-10">
                    <div className="flex-1 min-w-0 pr-6">
                      <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-gray-900 leading-tight tracking-tight">
                        {data.title}
                      </h1>
                      <div className="flex items-center gap-4 text-gray-600 mb-8">
                        <div className="flex items-center gap-3 min-w-0 bg-accent-50/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-accent-200/50">
                          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600 flex-shrink-0" />
                          <span className="font-semibold text-base sm:text-lg md:text-xl text-gray-800 truncate">
                            {data.location.city}, {data.location.state}
                            {data.location.zip && ` ${data.location.zip}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isOwner && (
                      <div className="flex items-center gap-3 flex-shrink-0 ml-6">
                        <Link
                          href={`/listings/${data._id}/edit`}
                          className="p-3 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-gray-600 hover:text-blue-600 shadow-sm hover:shadow-md"
                          title="Edit listing"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={handleDelete}
                          className="p-3 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all duration-200 text-red-600 hover:border-red-400 shadow-sm hover:shadow-md"
                          title="Delete listing"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Badge - Enhanced */}
                  <div className="inline-flex items-center gap-3 px-6 py-4 bg-coral-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-4xl font-bold block leading-none">{data.price}</span>
                      <span className="text-sm font-medium opacity-90">per month</span>
                    </div>
                  </div>

                  {/* Quick Stats - New Section */}
                  <div className="mt-8 grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-accent-100 rounded-xl flex-shrink-0">
                        <Bed className="w-6 h-6 text-accent-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1 uppercase tracking-wide">Bedrooms</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">{data.bedrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                        <Bath className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1 uppercase tracking-wide">Bathrooms</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">{data.bathrooms}</p>
                      </div>
                    </div>
                    {data.squareFeet && (
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
                          <Square className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1 uppercase tracking-wide">Square Feet</p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">{data.squareFeet.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description - Enhanced */}
              <div className="bg-white rounded-2xl p-8 sm:p-10 md:p-12 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                    Description
                  </h2>
                </div>
                <div className="prose prose-lg sm:prose-xl max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-[1.8] text-base sm:text-lg md:text-xl font-normal">
                    {data.description}
                  </p>
                </div>
              </div>

              {/* Amenities - Enhanced for Students */}
              {data.amenities.length > 0 && (
                <div className="bg-white rounded-2xl p-8 sm:p-10 md:p-12 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-8 sm:mb-10">
                    <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                      What's Included
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                    {data.amenities.map((amenity, index) => {
                      // Cycle through different color combinations for variety
                      const colorVariants = [
                        { bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-800', icon: 'text-accent-600', iconBg: 'bg-accent-100' },
                        { bg: 'bg-coral-50', border: 'border-coral-200', text: 'text-coral-800', icon: 'text-coral-600', iconBg: 'bg-coral-100' },
                        { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-800', icon: 'text-primary-600', iconBg: 'bg-primary-100' },
                        { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-600', iconBg: 'bg-amber-100' },
                        { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600', iconBg: 'bg-purple-100' },
                        { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', icon: 'text-pink-600', iconBg: 'bg-pink-100' },
                      ];
                      const colors = colorVariants[index % colorVariants.length];
                      return (
                        <div
                          key={index}
                          className={`group relative px-5 py-4 ${colors.bg} ${colors.text} rounded-2xl text-sm sm:text-base font-semibold border-2 ${colors.border} hover:border-opacity-80 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default flex flex-col items-center gap-3 text-center`}
                        >
                          <div className={`${colors.iconBg} p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                            <CheckCircle2 className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.icon} flex-shrink-0`} />
                          </div>
                          <span className="leading-tight">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Availability - Enhanced */}
              <div className="bg-gradient-to-br from-white to-accent-50/50 rounded-2xl p-8 sm:p-10 shadow-lg border-2 border-accent-100">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm sm:text-base text-gray-600 block mb-2 font-medium uppercase tracking-wide">Available from</span>
                    <span className="font-bold text-2xl sm:text-3xl text-gray-900 leading-tight">{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar - Enhanced for Students */}
            <div className="lg:sticky lg:top-20 space-y-6 h-fit">
              {/* Contact Card - Student-Friendly */}
              <div className="bg-gradient-to-br from-white via-accent-50/40 to-white border-2 border-accent-200 rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden relative">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-200/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-accent-100 rounded-xl flex-shrink-0">
                      <span className="text-2xl">👤</span>
                    </div>
                    <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                      Meet Your Landlord
                    </h2>
                  </div>
                  <div className="flex items-center gap-5 mb-6">
                    {data.landlordId.profileImage ? (
                      <Image
                        src={data.landlordId.profileImage}
                        alt={data.landlordId.name}
                        width={80}
                        height={80}
                        className="rounded-full border-4 border-accent-300 shadow-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center border-4 border-accent-300 shadow-lg flex-shrink-0">
                        <span className="text-3xl font-bold text-white">
                          {data.landlordId.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/${data.landlordId._id}`}
                        className="font-bold text-lg sm:text-xl text-gray-900 hover:text-accent-600 transition-colors block mb-2 truncate leading-tight"
                      >
                        {data.landlordId.name}
                      </Link>
                      <p className="text-sm sm:text-base text-gray-600 truncate leading-relaxed">{data.landlordId.email}</p>
                    </div>
                  </div>
                  {(data.landlordId as any).bio && (
                    <div className="mt-6 mb-6 p-5 bg-white/70 rounded-xl border border-accent-100">
                      <p className="text-sm sm:text-base text-gray-700 leading-[1.75] font-normal">
                        {(data.landlordId as any).bio}
                      </p>
                    </div>
                  )}
                  {!isOwner && (
                    <div className="mt-6">
                      <ContactButton
                        landlordId={data.landlordId._id}
                        landlordRole={data.landlordId.role}
                        listingId={data._id}
                        listingTitle={data.title}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Contact Button - Sticky at bottom, above BottomNav */}
          {!isOwner && (
            <div className="fixed bottom-16 left-0 right-0 md:hidden bg-white border-t-2 border-accent-200 shadow-2xl p-4 z-40">
              <ContactButton
                landlordId={data.landlordId._id}
                landlordRole={data.landlordId.role}
                listingId={data._id}
                listingTitle={data.title}
              />
            </div>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
}

