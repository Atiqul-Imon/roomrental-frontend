'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ListingList } from '@/components/listings/ListingList';
import { SearchBar } from '@/components/search/SearchBar';
import { Suspense } from 'react';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for non-critical comparison feature
const ComparisonButton = dynamic(
  () => import('@/components/listings/ComparisonButton').then(mod => ({ default: mod.ComparisonButton })),
  { ssr: false }
);

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
        {/* Enterprise Hero Section - Maximum Performance Optimized */}
        <section className="relative z-40 min-h-[30vh] sm:min-h-[32vh] md:min-h-[35vh] flex items-center justify-center overflow-x-hidden overflow-y-visible bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500">
          {/* Minimal background effects for better LCP */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {/* Single optimized gradient orb */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-pink-300/20 to-rose-400/20 rounded-full blur-3xl" />
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
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-8 sm:mb-10 md:mb-12">
                <Link
                  href="/listings"
                  className="group relative w-auto min-w-[200px] sm:min-w-[240px] overflow-hidden bg-white text-gray-900 px-8 sm:px-10 py-4.5 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.12)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out text-center border border-gray-200/60 backdrop-blur-sm"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[100%] transition-all duration-700 ease-in-out" />
                  
                  {/* Background gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-white opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gray-100/80 group-hover:bg-gray-200/90 transition-all duration-300 group-hover:scale-110">
                      <Search className="w-4.5 h-4.5 text-gray-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    </div>
                    <span className="tracking-tight font-semibold">Find Your Room</span>
                  </span>
                  
                  {/* Border glow on hover */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-gray-300/0 group-hover:border-gray-300/30 transition-all duration-300" />
                </Link>
                
                <Link
                  href="/auth/register"
                  className="group relative w-auto min-w-[200px] sm:min-w-[240px] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-8 sm:px-10 py-4.5 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg shadow-[0_8px_30px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.45),0_4px_12px_rgba(0,0,0,0.25)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out text-center border border-gray-700/40"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[100%] transition-all duration-700 ease-in-out" />
                  
                  {/* Background gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-700 via-gray-900 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/15 backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
                      <Plus className="w-4.5 h-4.5 text-white transition-transform duration-300 group-hover:rotate-90" />
                    </div>
                    <span className="tracking-tight font-semibold">List Your Room</span>
                  </span>
                  
                  {/* Border glow on hover */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/10 transition-all duration-300" />
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

