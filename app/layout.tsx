import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChatWidgetWrapper } from '@/components/chat/ChatWidgetWrapper';
import { StructuredData } from '@/components/seo/StructuredData';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from '@/lib/seo/structured-data';

// Body font - Inter (for body text, UI elements)
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// Heading font - Plus Jakarta Sans (for headings)
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';
const siteName = 'RoomRentalUSA';
const defaultDescription = 'Find single rooms for rent across the United States. Perfect for university students and young professionals. Browse verified listings, connect with landlords, and find your ideal room rental today.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Find Your Perfect Room Rental in USA`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    'room rental',
    'room for rent',
    'student housing',
    'roommates',
    'apartment rental',
    'USA',
    'United States',
    'room rental USA',
    'student accommodation',
    'shared housing',
    'roommate finder',
    'affordable housing',
    'room rental near me',
    'college housing',
    'university housing',
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  applicationName: siteName,
  category: 'Real Estate',
  classification: 'Room Rental Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - Find Your Perfect Room Rental in USA`,
    description: defaultDescription,
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${siteName} - Room Rental Platform`,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@roomrentalusa',
    creator: '@roomrentalusa',
    title: `${siteName} - Find Your Perfect Room Rental`,
    description: defaultDescription,
    images: [`${siteUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },
  other: {
    'geo.region': 'US',
    'geo.placename': 'United States',
    'geo.position': '39.8283;-98.5795', // Geographic center of USA
    'ICBM': '39.8283, -98.5795',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate structured data for homepage
  const organizationSchema = generateOrganizationSchema({
    name: 'RoomRentalUSA',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Find single rooms for rent across the United States. Perfect for university students and young professionals.',
    contactPoint: {
      contactType: 'Customer Service',
      email: 'admin@roomrentalusa.com',
      areaServed: 'US',
    },
    sameAs: [
      // Add social media links when available
      // 'https://www.facebook.com/roomrentalusa',
      // 'https://www.twitter.com/roomrentalusa',
      // 'https://www.instagram.com/roomrentalusa',
    ],
  });

  const websiteSchema = generateWebSiteSchema(
    siteUrl,
    `${siteUrl}/listings`
  );

  return (
    <html lang="en-US">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#667eea" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <StructuredData data={[organizationSchema, websiteSchema]} />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} ${inter.className}`}>
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <ErrorBoundary>
          <Providers>
            <div className="fade-in">
              {children}
            </div>
            <ChatWidgetWrapper />
            <BottomNav />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

