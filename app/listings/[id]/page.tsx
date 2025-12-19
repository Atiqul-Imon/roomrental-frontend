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
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { RatingDisplay } from '@/components/reviews/RatingDisplay';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import { MapPin, Calendar, DollarSign, Share2, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.title,
          text: data?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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
      <main className="min-h-screen bg-grey-50">
        <div className="container mx-auto px-4 py-8 fade-in">
          {/* Image Gallery - Modern & Student-Friendly */}
          <div className="mb-8 bg-white rounded-xl overflow-hidden shadow-large">
            <ImageGallery images={data.images} title={data.title} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Actions */}
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-grey-900">{data.title}</h1>
                    <div className="flex items-center gap-4 text-grey-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-5 h-5 text-primary-600" />
                        <span className="font-medium">
                          {data.location.city}, {data.location.state}
                          {data.location.zip && ` ${data.location.zip}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <FavoriteButton listingId={data._id} />
                    <button
                      onClick={handleShare}
                      className="p-2.5 border border-grey-300 rounded-lg hover:bg-grey-50 transition-all duration-200 hover:border-primary-400 text-grey-600 hover:text-primary-600"
                      title="Share listing"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    {isOwner && (
                      <>
                        <Link
                          href={`/listings/${data._id}/edit`}
                          className="p-2.5 border border-grey-300 rounded-lg hover:bg-grey-50 transition-all duration-200 hover:border-primary-400 text-grey-600 hover:text-primary-600"
                          title="Edit listing"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={handleDelete}
                          className="p-2.5 border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200 text-red-600 hover:border-red-400"
                          title="Delete listing"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Price Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-primary text-white rounded-xl shadow-medium">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-3xl font-bold">{data.price}</span>
                  <span className="text-lg font-medium opacity-90">/month</span>
                </div>
              </div>

              {/* Description - Enhanced */}
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-large border border-grey-100">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-grey-900 flex items-center gap-3">
                  <span className="text-3xl">📝</span>
                  About This Room
                </h2>
                <p className="text-grey-700 whitespace-pre-line leading-relaxed text-base md:text-lg">
                  {data.description}
                </p>
              </div>

              {/* Amenities - Enhanced for Students */}
              {data.amenities.length > 0 && (
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-large border border-grey-100">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-grey-900 flex items-center gap-3">
                    <span className="text-3xl">✨</span>
                    What's Included
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {data.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-800 rounded-xl text-sm font-semibold border border-primary-200 hover:border-primary-400 hover:shadow-medium transition-all duration-200 hover:scale-105 cursor-default"
                      >
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability - Enhanced */}
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-large border border-grey-100">
                <div className="flex items-center gap-4 text-grey-700">
                  <div className="p-3 bg-primary-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <span className="text-sm text-grey-600 block mb-1">Available from</span>
                    <span className="font-bold text-lg text-grey-900">{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar - Enhanced for Students */}
            <div className="lg:sticky lg:top-20 space-y-6 h-fit">
              {/* Contact Card - Student-Friendly */}
              <div className="bg-gradient-to-br from-white to-primary-50/30 border-2 border-primary-200 rounded-xl p-6 shadow-large">
                <h2 className="text-xl font-bold mb-4 text-grey-900 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  Meet Your Landlord
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  {data.landlordId.profileImage ? (
                    <Image
                      src={data.landlordId.profileImage}
                      alt={data.landlordId.name}
                      width={72}
                      height={72}
                      className="rounded-full border-3 border-primary-300 shadow-medium"
                    />
                  ) : (
                    <div className="w-18 h-18 bg-gradient-primary rounded-full flex items-center justify-center border-4 border-primary-300 shadow-medium">
                      <span className="text-3xl font-bold text-white">
                        {data.landlordId.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/profile/${data.landlordId._id}`}
                      className="font-bold text-lg text-grey-900 hover:text-primary-600 transition-colors block mb-1"
                    >
                      {data.landlordId.name}
                    </Link>
                    <p className="text-sm text-grey-600">{data.landlordId.email}</p>
                  </div>
                </div>
                {(data.landlordId as any).bio && (
                  <p className="mt-4 mb-4 text-sm text-grey-700 leading-relaxed bg-white/50 p-3 rounded-lg">
                    {(data.landlordId as any).bio}
                  </p>
                )}
                {!isOwner && (
                  <button className="mt-4 w-full px-6 py-4 btn-gradient text-white rounded-xl font-bold text-base hover:scale-105 transition-all duration-200 shadow-large hover:shadow-xl flex items-center justify-center gap-2">
                    <span>💬</span>
                    Contact Landlord
                  </button>
                )}
              </div>

              {/* Quick Info - Enhanced */}
              <div className="bg-white border-2 border-grey-200 rounded-xl p-6 shadow-large">
                <h2 className="text-xl font-bold mb-4 text-grey-900 flex items-center gap-2">
                  <span className="text-2xl">ℹ️</span>
                  Quick Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-grey-100">
                    <span className="text-grey-600 font-medium flex items-center gap-2">
                      <span>Status:</span>
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                      data.status === 'active' 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : data.status === 'pending'
                        ? 'bg-warning/20 text-warning border border-warning/30'
                        : 'bg-grey-100 text-grey-700 border border-grey-300'
                    }`}>
                      {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-grey-600 font-medium">Listed:</span>
                    <span className="font-bold text-grey-900">
                      {format(new Date(data.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety & Trust Badge for Students */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-large">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🛡️</span>
                  <div>
                    <h3 className="font-bold text-grey-900 mb-2">Verified Listing</h3>
                    <p className="text-sm text-grey-700">
                      This listing has been verified by our team for accuracy and safety.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 border-t border-border pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Reviews</h2>
              {isAuthenticated && !isOwner && user?.id !== data.landlordId._id && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
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
      </main>
      <Footer />
    </>
  );
}

