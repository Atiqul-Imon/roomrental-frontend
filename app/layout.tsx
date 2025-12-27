import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BottomNav } from '@/components/layout/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'RoomRentalUSA - Find Your Perfect Room',
    template: '%s | RoomRentalUSA',
  },
  description: 'Find single rooms for rent across the United States. Perfect for university students and young professionals.',
  keywords: ['room rental', 'student housing', 'roommates', 'apartment rental', 'USA'],
  authors: [{ name: 'RoomRentalUSA' }],
  creator: 'RoomRentalUSA',
  publisher: 'RoomRentalUSA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'RoomRentalUSA',
    title: 'RoomRentalUSA - Find Your Perfect Room',
    description: 'Find single rooms for rent across the United States. Perfect for university students and young professionals.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RoomRentalUSA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoomRentalUSA - Find Your Perfect Room',
    description: 'Find single rooms for rent across the United States.',
    images: ['/og-image.jpg'],
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <div className="fade-in">
              {children}
            </div>
            <BottomNav />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

