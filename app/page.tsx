'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ListingList } from '@/components/listings/ListingList';
import { ComparisonButton } from '@/components/listings/ComparisonButton';
import { SearchBar } from '@/components/search/SearchBar';
import { Suspense } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function ListingListContent() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading listings...</div>}>
      <ListingList />
    </Suspense>
  );
}

function SearchBarContent() {
  return <SearchBar />;
}

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-comfort" role="main">
        {/* Enterprise Hero Section */}
        <section className="relative z-40 min-h-[30vh] sm:min-h-[32vh] md:min-h-[35vh] flex items-center justify-center overflow-visible bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large gradient orbs */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full mix-blend-multiply blur-3xl opacity-40" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full mix-blend-multiply blur-3xl opacity-40" />
            <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full mix-blend-multiply blur-3xl opacity-40" />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          </div>

          {/* Content Container */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-4 sm:py-5 md:py-6">
            <div className="max-w-5xl mx-auto">
              {/* Main Heading */}
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3 leading-tight tracking-tight">
                  <span className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                    Find Your Perfect
                  </span>
                  <br className="md:hidden" />
                  <span className="md:ml-2 bg-gradient-to-r from-white via-pink-100 to-pink-50 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                    Room Rental
                  </span>
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
                <Link
                  href="/listings"
                  className="w-full sm:w-auto bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base shadow-lg hover:bg-gray-50 transition-colors duration-200 text-center"
                >
                  Find Your Room
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base shadow-lg hover:bg-gray-800 transition-colors duration-200 text-center"
                >
                  List Your Room
                </Link>
              </div>

              {/* Integrated Search Bar */}
              <div className="mb-6">
                <Suspense fallback={<div className="h-12" />}>
                  <SearchBarContent />
                </Suspense>
              </div>

            </div>
          </div>

        </section>

        {/* Listings Section */}
        <section className="relative z-10 container mx-auto px-3 sm:px-4 py-10 sm:py-12 md:py-16 section-spacing">
          <ListingListContent />
        </section>
      </main>
      <Footer />
      <ComparisonButton />
    </>
  );
}

