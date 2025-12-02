'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Listing } from '@/types';
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
    queryFn: async () => {
      const response = await api.get(`/listings/${listingId}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch listing');
      }
      return response.data.data as Listing;
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
          {/* Image Gallery */}
          <div className="mb-8 bg-white rounded-xl overflow-hidden shadow-medium">
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

              {/* Description */}
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <h2 className="text-2xl font-bold mb-4 text-grey-900">Description</h2>
                <p className="text-grey-700 whitespace-pre-line leading-relaxed">{data.description}</p>
              </div>

              {/* Amenities */}
              {data.amenities.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <h2 className="text-2xl font-bold mb-4 text-grey-900">Amenities</h2>
                  <div className="flex flex-wrap gap-3">
                    {data.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-semibold border border-primary-200"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center gap-3 text-grey-700">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Available from: <span className="text-grey-900">{formattedDate}</span></span>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:sticky lg:top-20 space-y-6 h-fit">
              {/* Landlord Info */}
              <div className="bg-white border border-grey-200 rounded-xl p-6 shadow-medium">
                <h2 className="text-xl font-bold mb-4 text-grey-900">Landlord</h2>
                <div className="flex items-center gap-4 mb-4">
                  {data.landlordId.profileImage ? (
                    <Image
                      src={data.landlordId.profileImage}
                      alt={data.landlordId.name}
                      width={64}
                      height={64}
                      className="rounded-full border-2 border-grey-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center border-2 border-grey-200">
                      <span className="text-2xl font-bold text-white">
                        {data.landlordId.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/profile/${data.landlordId._id}`}
                      className="font-bold text-grey-900 hover:text-primary-600 transition-colors block"
                    >
                      {data.landlordId.name}
                    </Link>
                    <p className="text-sm text-grey-600">{data.landlordId.email}</p>
                  </div>
                </div>
                {(data.landlordId as any).bio && (
                  <p className="mt-4 text-sm text-grey-600 leading-relaxed">{(data.landlordId as any).bio}</p>
                )}
                {!isOwner && (
                  <button className="mt-6 w-full px-4 py-3 btn-gradient text-white rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-medium">
                    Contact Landlord
                  </button>
                )}
              </div>

              {/* Quick Info */}
              <div className="bg-white border border-grey-200 rounded-xl p-6 shadow-medium">
                <h2 className="text-xl font-bold mb-4 text-grey-900">Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-grey-100">
                    <span className="text-grey-600 font-medium">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      data.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : data.status === 'pending'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-grey-100 text-grey-700'
                    }`}>
                      {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-grey-600 font-medium">Listed:</span>
                    <span className="font-semibold text-grey-900">
                      {format(new Date(data.createdAt), 'MMM dd, yyyy')}
                    </span>
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

