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
import { MapPin, Calendar, DollarSign, Edit, Trash2, Bed, Bath, Square, CheckCircle2, Users, Wifi, Car, GraduationCap, Heart } from 'lucide-react';
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
          propertyType: listing.propertyType || undefined,
          createdAt: listing.createdAt || new Date().toISOString(),
          updatedAt: listing.updatedAt || new Date().toISOString(),
          // Additional listing details
          billsIncluded: listing.billsIncluded ?? undefined,
          securityDeposit: listing.securityDeposit ?? undefined,
          roomFurnishing: listing.roomFurnishing || undefined,
          minStayMonths: listing.minStayMonths ?? undefined,
          maxStayMonths: listing.maxStayMonths ?? undefined,
          currentRoomiesCount: listing.currentRoomiesCount ?? undefined,
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

  // Calculate status tags
  const statusTags = [];
  if (data) {
    const now = new Date();
    const updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
    const createdAt = data.createdAt ? new Date(data.createdAt) : null;
    
    // "Updated" tag if updated within last 7 days
    if (updatedAt) {
      const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate <= 7) {
        statusTags.push({ label: 'Updated', color: 'bg-red-500' });
      }
    }
    
    // "Recently posted" tag if created within last 3 days
    if (createdAt) {
      const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation <= 3) {
        statusTags.push({ label: 'Recently posted', color: 'bg-blue-500' });
      }
    }
    
    // "Free to message" tag if listing is available
    if (data.status === 'available') {
      statusTags.push({ label: 'Free to message', color: 'bg-red-500' });
    }
  }

  // Get room type subtitle
  const getRoomTypeSubtitle = () => {
    if (!data?.propertyType) return null;
    const typeMap: Record<string, string> = {
      'private_room': 'Private room',
      'shared_room': 'Shared room',
      'apartment': 'Apartment',
      'house': 'House',
      'studio': 'Studio',
      'dorm': 'Dormitory',
    };
    const baseType = typeMap[data.propertyType] || data.propertyType.replace('_', ' ');
    // Add bathroom info if available
    if (data.bathrooms) {
      return `${baseType}${data.bathrooms > 1 ? ' with shared bathroom' : ' with private bathroom'}`;
    }
    return baseType;
  };

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('garage')) {
      return <Car className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />;
    }
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet') || lowerAmenity.includes('wi-fi')) {
      return <Wifi className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />;
    }
    if (lowerAmenity.includes('lgbtq') || lowerAmenity.includes('lgbt')) {
      return <Heart className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />;
    }
    if (lowerAmenity.includes('student') || lowerAmenity.includes('university')) {
      return <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />;
    }
    return <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />;
  };

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
      <main className="min-h-screen bg-gray-50 pb-32 md:pb-8">
        <div className="w-full md:container md:mx-auto px-4 md:px-6 md:max-w-4xl py-4 md:py-6">
          {/* Image Gallery with Profile Picture and Status Tags */}
          <div className="mb-4 md:mb-6 relative">
            <ImageGallery images={data.images} title={data.title} />
            
            {/* Status Tags */}
            {statusTags.length > 0 && (
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-10">
                {statusTags.map((tag, index) => (
                  <span
                    key={index}
                    className={`${tag.color} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
            
            {/* Profile Picture - Positioned top-right */}
            {data.landlordId.profileImage && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                  <Image
                    src={data.landlordId.profileImage}
                    alt={data.landlordId.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
            {/* Header Section */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-start justify-between mb-4 md:mb-5">
                <div className="flex-1 min-w-0 pr-2 md:pr-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-2 md:mb-3 leading-tight tracking-tight">
                    {data.title}
                  </h1>
                  {/* Room Type Subtitle */}
                  {getRoomTypeSubtitle() && (
                    <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                      {getRoomTypeSubtitle()}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span>
                      {data.location.city}, {data.location.state}
                      {data.location.zip && ` ${data.location.zip}`}
                    </span>
                  </div>
                </div>
                {isOwner && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/listings/${data._id}/edit`}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                      title="Edit listing"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Row with Icons */}
              <div className="flex items-center gap-6 md:gap-8 text-sm md:text-base text-gray-700 pt-3 border-t border-gray-100">
                {data.currentRoomiesCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-900 font-semibold md:text-lg">{data.currentRoomiesCount}</span>
                    <span className="text-gray-600">roomies</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-900 font-semibold md:text-lg">{data.bathrooms}</span>
                  <span className="text-gray-600">bathrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-900 font-semibold md:text-lg">{data.bedrooms}</span>
                  <span className="text-gray-600">bedrooms</span>
                </div>
              </div>
            </div>

            {/* Key Details - Two Column Format */}
            <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-200">
              <div className="mb-4 md:mb-5">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Key Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-y-3 md:gap-y-4 gap-x-4 md:gap-x-12 text-sm md:text-base">
                <div className="text-gray-600 font-medium">Rent</div>
                <div className="text-gray-900 font-semibold">${data.price.toLocaleString()} per month</div>
                
                {data.billsIncluded !== undefined && (
                  <>
                    <div className="text-gray-600 font-medium">Bills</div>
                    <div className="text-gray-900 font-semibold">{data.billsIncluded ? 'Included' : 'Not included'}</div>
                  </>
                )}
                
                {data.securityDeposit !== undefined && data.securityDeposit > 0 && (
                  <>
                    <div className="text-gray-600 font-medium">Security deposit</div>
                    <div className="text-gray-900 font-semibold">${data.securityDeposit.toLocaleString()}</div>
                  </>
                )}
                
                {data.propertyType && (
                  <>
                    <div className="text-gray-600 font-medium">Property type</div>
                    <div className="text-gray-900 font-semibold capitalize">{data.propertyType.replace('_', ' ')}</div>
                  </>
                )}
                
                {data.roomFurnishing && (
                  <>
                    <div className="text-gray-600 font-medium">Room furnishing</div>
                    <div className="text-gray-900 font-semibold capitalize">{data.roomFurnishing.replace('_', ' ')}</div>
                  </>
                )}
                
                {data.squareFeet && (
                  <>
                    <div className="text-gray-600 font-medium">Square feet</div>
                    <div className="text-gray-900 font-semibold">{data.squareFeet.toLocaleString()}</div>
                  </>
                )}
                
                <div className="text-gray-600 font-medium">Available on</div>
                <div className="text-gray-900 font-semibold">{formattedDate}</div>
                
                {(data.minStayMonths !== undefined || data.maxStayMonths !== undefined) && (
                  <>
                    <div className="text-gray-600 font-medium">Stay length</div>
                    <div className="text-gray-900 font-semibold">
                      {data.minStayMonths !== undefined && data.maxStayMonths !== undefined
                        ? `${data.minStayMonths} - ${data.maxStayMonths} months`
                        : data.minStayMonths !== undefined
                        ? `${data.minStayMonths}+ months`
                        : data.maxStayMonths !== undefined
                        ? `Up to ${data.maxStayMonths} months`
                        : ''}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Amenities */}
            {data.amenities.length > 0 && (
              <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-200">
                <div className="mb-4 md:mb-5">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">Amenities</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4">
                  {data.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 md:gap-3 text-sm md:text-base"
                    >
                      {getAmenityIcon(amenity)}
                      <span className="text-gray-700 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About the room */}
            <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-200">
              <div className="mb-5 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">About the room</h2>
              </div>
              <div className="prose prose-sm md:prose-base max-w-none">
                <p className="text-gray-800 whitespace-pre-line leading-7 md:leading-8 text-base md:text-lg max-w-3xl">
                  {data.description}
                </p>
              </div>
            </div>

            {/* About the roomies */}
            <div className="mb-6 md:mb-8">
              <div className="mb-4 md:mb-5">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">About the roomies</h2>
              </div>
              <div className="flex items-start gap-3 md:gap-5">
                {data.landlordId.profileImage ? (
                  <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                    <Image
                      src={data.landlordId.profileImage}
                      alt={data.landlordId.name}
                      width={56}
                      height={56}
                      className="rounded-full border-2 border-gray-200 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
                    <span className="text-base md:text-lg font-semibold text-gray-600">
                      {data.landlordId.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${data.landlordId._id}`}
                    className="font-semibold text-gray-900 hover:text-gray-700 transition-colors block mb-1.5 md:mb-2 text-base md:text-lg"
                  >
                    {data.landlordId.name}
                  </Link>
                  {(data.landlordId as any).bio ? (
                    <p className="text-sm md:text-base text-gray-700 leading-6 md:leading-7">
                      {(data.landlordId as any).bio}
                    </p>
                  ) : (
                    <p className="text-sm md:text-base text-gray-600">{data.landlordId.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Section */}
            {!isOwner && (
              <div className="pt-4 md:pt-6 border-t border-gray-200">
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

        {/* Mobile Contact Button - Sticky at bottom, above BottomNav */}
        {!isOwner && (
          <div className="fixed bottom-16 left-0 right-0 md:hidden bg-white border-t border-gray-200 px-4 py-3 z-40">
            <ContactButton
              landlordId={data.landlordId._id}
              landlordRole={data.landlordId.role}
              listingId={data._id}
              listingTitle={data.title}
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

