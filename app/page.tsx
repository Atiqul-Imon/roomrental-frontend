'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ListingList } from '@/components/listings/ListingList';
import { ComparisonButton } from '@/components/listings/ComparisonButton';
import { SearchBar } from '@/components/search/SearchBar';
import { Suspense } from 'react';

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
        <section className="relative z-40 min-h-[45vh] sm:min-h-[50vh] md:min-h-[55vh] flex items-center justify-center overflow-visible bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500">
          {/* Deploy Trigger Indicator */}
          <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-2 px-4 z-50">
            <p className="font-semibold">🚀 Deploy Triggered - If you see this text, the deployment worked!</p>
          </div>
          
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large gradient orbs */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply blur-3xl opacity-30" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-400 rounded-full mix-blend-multiply blur-3xl opacity-30" />
            <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply blur-3xl opacity-30" />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          </div>

          {/* Content Container */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-6 sm:py-8 md:py-10">
            <div className="max-w-5xl mx-auto">
              {/* Main Heading */}
              <div className="text-center mb-4 sm:mb-6">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5 leading-tight tracking-tight">
                  <span className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                    Find Your Perfect
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-white via-accent-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                    Room Rental
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-normal mb-6 sm:mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  Discover premium rooms for rent across the United States. 
                  <span className="block mt-2 text-white/80">
                    Safe, verified, and perfect for students and professionals.
                  </span>
                </p>
              </div>

              {/* Integrated Search Bar */}
              <div className="relative z-[100]">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 sm:p-3 border border-white/20">
                    <Suspense fallback={
                      <div className="h-14 sm:h-16 bg-grey-100 rounded-xl animate-pulse" />
                    }>
                      <SearchBarContent />
                    </Suspense>
                  </div>
                </div>
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

