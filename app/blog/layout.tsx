import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';

/**
 * Blog segment defaults. Per-route metadata (index filters, articles) overrides canonical, title, and OG url.
 */
export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Expert room rental guides for renters and landlords in the United States — housing tips, leases, budgets, and how to get the most from RoomRentalUSA.',
  keywords: [
    'room rental blog',
    'student housing tips',
    'rent a room USA',
    'landlord guide',
    'renter advice',
    'RoomRentalUSA',
  ],
  alternates: {
    types: {
      'application/rss+xml': `${siteUrl.replace(/\/$/, '')}/blog/rss.xml`,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'RoomRentalUSA',
    locale: 'en_US',
    title: 'RoomRentalUSA Blog',
    description:
      'Expert room rental guides for renters and landlords in the United States.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@roomrentalusa',
    title: 'RoomRentalUSA Blog',
    description: 'Expert room rental guides for renters and landlords in the United States.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
