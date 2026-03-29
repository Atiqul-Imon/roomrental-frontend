import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';
// Use production API URL - should be set in production environment
// For sitemap generation, we need the backend API URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' ? 'https://api.roomrentalusa.com' : 'http://localhost:5000');

async function getBlogSlugs(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    const all: Array<{ slug: string; updatedAt: string }> = [];
    let page = 1;
    while (page <= 50) {
      const response = await fetch(`${apiUrl}/api/blog/posts?limit=100&page=${page}`, {
        next: { revalidate: 3600 },
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) break;
      const data = await response.json();
      const posts = data?.data?.posts;
      if (!Array.isArray(posts) || posts.length === 0) break;
      for (const p of posts) {
        if (p?.slug) all.push({ slug: p.slug, updatedAt: p.updatedAt || p.createdAt });
      }
      const totalPages = data?.data?.pagination?.totalPages ?? 1;
      if (page >= totalPages) break;
      page += 1;
    }
    return all;
  } catch {
    return [];
  }
}

async function getAllListings(): Promise<Array<{ id: string; updatedAt: string }>> {
  try {
    // Use absolute URL for API calls in sitemap generation
    const apiEndpoint = `${apiUrl}/api/listings?limit=10000&status=available`;
    const response = await fetch(apiEndpoint, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch listings for sitemap: ${response.status} ${response.statusText}`);
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
    // High-value static content pages
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
  ];

  // Dynamic listing pages
  const [listings, blogPosts] = await Promise.all([getAllListings(), getBlogSlugs()]);

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: new Date(listing.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [...staticPages, ...listingPages, ...blogPages];
}

