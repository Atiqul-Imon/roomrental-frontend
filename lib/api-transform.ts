/**
 * Transform backend API responses to match frontend expectations
 * This bridges the gap between NestJS (id) and frontend (_id) conventions
 */

import { Listing, Review, User } from '@/types';

// Transform listing from backend format to frontend format
export function transformListing(listing: any): Listing {
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
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    squareFeet: listing.squareFeet,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

// Transform review from backend format to frontend format
export function transformReview(review: any): Review {
  return {
    _id: review.id,
    reviewerId: {
      _id: review.reviewer?.id || review.reviewerId,
      name: review.reviewer?.name || '',
      email: review.reviewer?.email || '',
      profileImage: review.reviewer?.profileImage,
    },
    revieweeId: {
      _id: review.reviewee?.id || review.revieweeId,
      name: review.reviewee?.name || '',
      email: review.reviewee?.email || '',
      profileImage: review.reviewee?.profileImage,
    },
    listingId: review.listing
      ? {
          _id: review.listing.id,
          title: review.listing.title,
        }
      : undefined,
    rating: review.rating,
    comment: review.comment || '',
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

// Transform user from backend format to frontend format
export function transformUser(user: any): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name || '',
    role: user.role,
    profileImage: user.profileImage,
    bio: user.bio,
    phone: user.phone,
    preferences: user.preferences as any,
    verification: user.verification
      ? {
          emailVerified: user.emailVerified || false,
          phoneVerified: false,
          idVerified: user.verification === 'verified',
        }
      : undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Transform listing data for create/update (frontend format to backend format)
export function transformListingForBackend(listing: any) {
  return {
    title: listing.title,
    description: listing.description,
    price: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    squareFeet: listing.squareFeet,
    location: {
      city: listing.location?.city || listing.city,
      state: listing.location?.state || listing.state,
      zip: listing.location?.zip || listing.zip,
      address: listing.location?.address || listing.address,
      latitude: listing.location?.coordinates?.lat || listing.latitude,
      longitude: listing.location?.coordinates?.lng || listing.longitude,
    },
    amenities: listing.amenities || [],
    images: listing.images || [],
    status: listing.status,
    availabilityDate: listing.availabilityDate,
  };
}




























