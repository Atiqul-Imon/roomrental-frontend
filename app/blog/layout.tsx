import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guides and insights for renters, landlords, and students — housing tips, market trends, and how to get the most from RoomRentalUSA.',
  alternates: {
    canonical: `${siteUrl}/blog`,
    types: {
      'application/rss+xml': `${siteUrl}/blog/rss.xml`,
    },
  },
  openGraph: {
    title: 'RoomRentalUSA Blog',
    description:
      'Guides and insights for renters, landlords, and students.',
    url: `${siteUrl}/blog`,
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
