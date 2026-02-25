import { Metadata } from 'next';
import { transformImageKitUrl } from '@/lib/imagekit';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    // Use fetch for server-side - axios api uses localStorage which is undefined on server
    const response = await fetch(`${apiUrl}/api/listings/${id}`, {
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch listing');
    }

    const json = await response.json();
    const listing = json.data;

    if (!listing) {
      throw new Error('No listing data');
    }

    const city = listing.city || listing.location?.city || '';
    const state = listing.state || listing.location?.state || '';
    const price = listing.price || 0;
    const locationText = city && state ? `${city}, ${state}` : state || city || 'USA';

    // Title without site suffix - root layout template adds "| RoomRentalUSA"
    const title = `${listing.title} - $${price}/month in ${locationText}`;
    const description = listing.description
      ? listing.description.substring(0, 155) + '...'
      : `Room for rent in ${locationText}. $${price}/month. ${listing.bedrooms || 1} bedroom, ${listing.bathrooms || 1} bathroom.`;

    // Use first image for social preview - must be absolute URL
    // Facebook/Open Graph recommends 1200x630 for best display
    let ogImageUrl = `${siteUrl}/og-image.jpg`;
    if (listing.images && listing.images.length > 0) {
      const firstImage = listing.images[0];
      // Ensure absolute URL and add OG-optimized size for ImageKit
      ogImageUrl = firstImage.startsWith('http')
        ? firstImage.includes('ik.imagekit.io')
          ? transformImageKitUrl(firstImage, {
              width: 1200,
              height: 630,
              crop: 'maintain_ratio',
              quality: 85,
            })
          : firstImage
        : `${siteUrl}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
    }

    const canonicalUrl = `${siteUrl}/listings/${id}`;

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
        title: `${listing.title} - $${price}/month in ${locationText}`,
        description,
        url: canonicalUrl,
        siteName: 'RoomRentalUSA',
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: listing.title,
            type: 'image/jpeg',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${listing.title} - $${price}/month in ${locationText}`,
        description,
        images: [ogImageUrl],
      },
      other: {
        ...(city && { 'geo.city': city }),
        ...(state && { 'geo.region': state }),
        ...(listing.latitude &&
          listing.longitude && {
            'geo.position': `${listing.latitude};${listing.longitude}`,
            ICBM: `${listing.latitude}, ${listing.longitude}`,
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

export default function ListingDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
