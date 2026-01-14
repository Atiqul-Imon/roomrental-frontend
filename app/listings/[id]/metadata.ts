import { Metadata } from 'next';
import { api } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  try {
    const response = await api.get(`/listings/${resolvedParams.id}`);
    const listing = response.data.data;

    const city = listing.city || listing.location?.city || '';
    const state = listing.state || listing.location?.state || '';
    const price = listing.price || 0;
    const locationText = city && state ? `${city}, ${state}` : state || city || 'USA';
    
    const title = `${listing.title} - $${price}/month in ${locationText} | RoomRentalUSA`;
    const description = listing.description
      ? listing.description.substring(0, 155) + '...'
      : `Room for rent in ${locationText}. $${price}/month. ${listing.bedrooms || 1} bedroom, ${listing.bathrooms || 1} bathroom.`;

    const images = listing.images && listing.images.length > 0 
      ? listing.images.map((img: string) => ({
          url: img,
          width: 1200,
          height: 630,
          alt: listing.title,
        }))
      : [{
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: listing.title,
        }];

    const canonicalUrl = `${siteUrl}/listings/${resolvedParams.id}`;

    return {
      title,
      description,
      keywords: [
        'room rental',
        'room for rent',
        locationText,
        city,
        state,
        `$${price} room rental`,
        'student housing',
        'roommate',
      ],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'RoomRentalUSA',
        locale: 'en_US',
        type: 'website',
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: images.map((img: { url: string }) => img.url),
      },
      other: {
        ...(city && { 'geo.city': city }),
        ...(state && { 'geo.region': state }),
        ...(listing.latitude && listing.longitude && {
          'geo.position': `${listing.latitude};${listing.longitude}`,
          'ICBM': `${listing.latitude}, ${listing.longitude}`,
        }),
      },
    };
  } catch {
    return {
      title: 'Listing Not Found | RoomRentalUSA',
      description: 'The listing you are looking for could not be found.',
    };
  }
}

