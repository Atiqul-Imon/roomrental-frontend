'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ListingList } from '@/components/listings/ListingList';
import { ComparisonButton } from '@/components/listings/ComparisonButton';
import { Search } from 'lucide-react';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

function ListingListContent() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading listings...</div>}>
      <ListingList />
    </Suspense>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-comfort" role="main">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-500 to-teal-500 text-white py-8 sm:py-10 md:py-12 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-300 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="container mx-auto px-3 sm:px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 leading-[1.2] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                Find Your Perfect Home
              </h1>
              <p className="font-body text-base sm:text-lg md:text-xl lg:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 font-normal px-2 leading-relaxed tracking-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
                Discover cozy, comfortable rooms for rent across the United States.
              </p>
              <div className="flex justify-center items-center">
                <Link
                  href="/listings"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl font-semibold text-base sm:text-lg hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl hover:bg-blue-50 hover:text-blue-700 flex items-center justify-center gap-2 min-h-[44px] touch-target"
                >
                  <Search className="w-5 h-5" />
                  Browse Listings
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section className="container mx-auto px-3 sm:px-4 py-10 sm:py-12 md:py-16 section-spacing">
          <ListingListContent />
        </section>
      </main>
      <Footer />
      <ComparisonButton />
    </>
  );
}

