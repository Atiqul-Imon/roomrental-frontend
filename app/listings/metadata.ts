import { Metadata } from 'next';
import { searchParamsToMetadata } from '@/lib/seo/metadata-utils';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const city = typeof params.city === 'string' ? params.city : undefined;
  const state = typeof params.state === 'string' ? params.state : undefined;
  const minPrice = typeof params.minPrice === 'string' ? params.minPrice : undefined;
  const maxPrice = typeof params.maxPrice === 'string' ? params.maxPrice : undefined;

  // Generate location-specific metadata
  let title = 'Browse Available Rooms for Rent';
  let description = 'Search and filter through thousands of rooms to find your ideal space. Find verified listings across the United States.';

  if (city && state) {
    title = `Rooms for Rent in ${city}, ${state} | RoomRentalUSA`;
    description = `Find rooms for rent in ${city}, ${state}. Browse verified listings with photos, prices, and amenities. Perfect for students and professionals.`;
  } else if (state) {
    title = `Rooms for Rent in ${state} | RoomRentalUSA`;
    description = `Find rooms for rent in ${state}. Browse verified listings with photos, prices, and amenities.`;
  } else if (city) {
    title = `Rooms for Rent in ${city} | RoomRentalUSA`;
    description = `Find rooms for rent in ${city}. Browse verified listings with photos, prices, and amenities.`;
  }

  if (minPrice || maxPrice) {
    const priceRange = [minPrice, maxPrice].filter(Boolean).join(' - ');
    title = `${title} | ${priceRange ? `$${priceRange}` : 'Affordable'}`;
  }

  const canonicalUrl = searchParamsToMetadata(params, `${siteUrl}/listings`);

  return {
    title,
    description,
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
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/og-image.jpg`],
    },
  };
}


