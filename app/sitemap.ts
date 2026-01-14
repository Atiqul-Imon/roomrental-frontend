import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getAllListings(): Promise<Array<{ id: string; updatedAt: string }>> {
  try {
    const response = await fetch(`${apiUrl}/listings?limit=10000&status=available`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      console.error('Failed to fetch listings for sitemap');
      return [];
    }

    const data = await response.json();
    if (data.success && data.data?.listings) {
      return data.data.listings.map((listing: any) => ({
        id: listing.id || listing._id,
        updatedAt: listing.updatedAt || listing.createdAt || new Date().toISOString(),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching listings for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/forgot-password`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ];

  // Dynamic listing pages
  const listings = await getAllListings();
  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: new Date(listing.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...listingPages];
}

