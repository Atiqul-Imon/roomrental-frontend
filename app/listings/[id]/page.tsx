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
import { ImageGallery } from '@/components/listings/ImageGallery';
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import { ContactButton } from '@/components/listings/ContactButton';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { RatingDisplay } from '@/components/reviews/RatingDisplay';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import { MapPin, Calendar, DollarSign, Share2, Edit, Trash2, Bed, Bath, Square, Shield, Star, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/ToastProvider';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const listingId = resolvedParams.id;
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    ...queryConfig.listingDetail,
    queryFn: async () => {
      const response = await api.get(`/listings/${listingId}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch listing');
      }
      const listing = response.data.data;
      return {
        _id: listing.id,
        landlordId: {
          _id: listing.landlord?.id || listing.landlordId,
          name: listing.landlord?.name || '',
          email: listing.landlord?.email || '',
          profileImage: listing.landlord?.profileImage,
          role: listing.landlord?.role || 'landlord', // Include role to determine if admin
        },
        title: listing.title,
        description: listing.description,
        price: listing.price,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareFeet: listing.squareFeet,
        location: {
          city: listing.city,
          state: listing.state,
          zip: listing.zip,
          address: listing.address,
          coordinates: listing.latitude && listing.longitude
            ? { lat: listing.latitude, lng: listing.longitude }
            : undefined,
        },
        images: listing.images || [],
        amenities: listing.amenities || [],
        availabilityDate: listing.availabilityDate,
        status: listing.status,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      } as Listing;
    },
  });

  const isOwner = isAuthenticated && user?.id === data?.landlordId._id;
  const formattedDate = data ? format(new Date(data.availabilityDate), 'MMMM dd, yyyy') : '';

  const { success, error: showError } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: data?.title || 'Room Rental Listing',
      text: data?.description?.substring(0, 200) || 'Check out this room rental listing',
      url: window.location.href,
    };

    // Try native share API first (mobile)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        success('Shared successfully!', { duration: 2000 });
      } catch (error: any) {
        // User cancelled or error occurred - don't show error for cancellation
        if (error.name !== 'AbortError') {
          // Fallback to clipboard
          handleClipboardShare();
        }
      }
    } else {
      // Fallback: copy to clipboard
      handleClipboardShare();
    }
  };

  const handleClipboardShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!', { duration: 2000 });
    } catch (err) {
      showError('Failed to copy link. Please try again.', { duration: 3000 });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await api.delete(`/listings/${listingId}`);
      router.push('/dashboard');
    } catch (error) {
      alert('Failed to delete listing');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-grey-50">
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
        <main className="min-h-screen bg-grey-50">
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-50 pb-20 md:pb-8">
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
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/30 to-transparent rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0 pr-4">
                      <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
                        {data.title}
                      </h1>
                      <div className="flex items-center gap-3 text-gray-600 mb-6">
                        <div className="flex items-center gap-2 min-w-0 bg-emerald-50 px-3 py-1.5 rounded-lg">
                          <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <span className="font-semibold text-base sm:text-lg text-gray-800 truncate">
                            {data.location.city}, {data.location.state}
                            {data.location.zip && ` ${data.location.zip}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <FavoriteButton listingId={data._id} />
                      <button
                        onClick={(e) => {
                          handleShare();
                          e.currentTarget.classList.add('share-bounce');
                          setTimeout(() => {
                            e.currentTarget.classList.remove('share-bounce');
                          }, 300);
                        }}
                        className="p-3 border-2 border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 text-gray-600 hover:text-emerald-600 touch-target shadow-sm hover:shadow-md"
                        title="Share listing"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      {isOwner && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price Badge - Enhanced */}
                  <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-4xl font-bold block leading-none">{data.price}</span>
                      <span className="text-sm font-medium opacity-90">per month</span>
                    </div>
                  </div>

                  {/* Quick Stats - New Section */}
                  <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Bed className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Bedrooms</p>
                        <p className="text-lg font-bold text-gray-900">{data.bedrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bath className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Bathrooms</p>
                        <p className="text-lg font-bold text-gray-900">{data.bathrooms}</p>
                      </div>
                    </div>
                    {data.squareFeet && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Square className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Square Feet</p>
                          <p className="text-lg font-bold text-gray-900">{data.squareFeet}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description - Enhanced */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
                    About This Room
                  </h2>
                </div>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base sm:text-lg md:text-xl">
                  {data.description}
                </p>
              </div>

              {/* Amenities - Enhanced for Students */}
              {data.amenities.length > 0 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl">
                      <span className="text-2xl">✨</span>
                    </div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
                      What's Included
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {data.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="group px-4 py-3 bg-gradient-to-br from-emerald-50 to-blue-50 text-emerald-800 rounded-xl text-sm font-semibold border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-default flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability - Enhanced */}
              <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-100 rounded-xl shadow-sm">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1 font-medium">Available from</span>
                    <span className="font-bold text-xl text-gray-900">{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar - Enhanced for Students */}
            <div className="lg:sticky lg:top-20 space-y-6 h-fit">
              {/* Contact Card - Student-Friendly */}
              <div className="bg-gradient-to-br from-white via-emerald-50/40 to-white border-2 border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden relative">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <span className="text-2xl">👤</span>
                    </div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">
                      Meet Your Landlord
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    {data.landlordId.profileImage ? (
                      <Image
                        src={data.landlordId.profileImage}
                        alt={data.landlordId.name}
                        width={80}
                        height={80}
                        className="rounded-full border-4 border-emerald-300 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-300 shadow-lg">
                        <span className="text-3xl font-bold text-white">
                          {data.landlordId.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/${data.landlordId._id}`}
                        className="font-bold text-lg text-gray-900 hover:text-emerald-600 transition-colors block mb-1 truncate"
                      >
                        {data.landlordId.name}
                      </Link>
                      <p className="text-sm text-gray-600 truncate">{data.landlordId.email}</p>
                    </div>
                  </div>
                  {(data.landlordId as any).bio && (
                    <div className="mt-4 mb-4 p-4 bg-white/70 rounded-xl border border-emerald-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
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

              {/* Quick Info - Enhanced */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-xl">ℹ️</span>
                  </div>
                  <h2 className="font-heading text-xl font-bold text-gray-900">
                    Quick Details
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium flex items-center gap-2">
                      Status:
                    </span>
                    <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                      data.status === 'available' 
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' 
                        : data.status === 'pending'
                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                    }`}>
                      {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Listed:
                    </span>
                    <span className="font-bold text-gray-900">
                      {data.createdAt ? format(new Date(data.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety & Trust Badge for Students */}
              <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-gray-900 mb-2 flex items-center gap-2">
                      Verified Listing
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      This listing has been verified by our team for accuracy and safety.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section - Enhanced */}
          <div className="mt-10 sm:mt-12 md:mt-16">
            <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Star className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">Reviews</h2>
                </div>
                {isAuthenticated && !isOwner && user?.id !== data.landlordId._id && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 min-h-[44px] touch-target text-sm sm:text-base font-semibold"
                  >
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className="mb-6">
                  <ReviewForm
                    revieweeId={data.landlordId._id}
                    listingId={data._id}
                    onSuccess={() => {
                      setShowReviewForm(false);
                      queryClient.invalidateQueries({ queryKey: ['reviews'] });
                      queryClient.invalidateQueries({ queryKey: ['rating'] });
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              <ReviewList userId={data.landlordId._id} listingId={data._id} />
            </div>
          </div>

          {/* Mobile Contact Button - Sticky at bottom */}
          {!isOwner && (
            <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t-2 border-emerald-200 shadow-2xl p-4 z-50">
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

