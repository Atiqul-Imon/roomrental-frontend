import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration for RoomRentalUSA
 * 
 * This generates a valid robots.txt file that:
 * - Allows all search engines to crawl the site
 * - Blocks AI training bots (GPTBot, CCBot, etc.)
 * - Protects private pages (dashboard, profile editing, listing creation)
 * - Points to sitemap for better indexing
 * 
 * Note: Cloudflare may inject additional directives. This configuration
 * provides the base valid robots.txt content.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';

  return {
    rules: [
      // Main rule for all search engines
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/profile/edit',
          '/listings/create',
          '/listings/*/edit',
          '/auth/callback',
        ],
      },
      // Block AI training bots (respect AI training restrictions)
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Google-Extended', 'Amazonbot', 'FacebookBot', 'Applebot-Extended', 'Bytespider', 'PerplexityBot', 'YouBot'],
        disallow: ['/'],
      },
      // Allow specific search engine bots full access
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot', 'DuckDuckBot', 'Slurp', 'Baiduspider'],
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/profile/edit',
          '/listings/create',
          '/listings/*/edit',
          '/auth/callback',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

