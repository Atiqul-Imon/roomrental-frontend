'use client';

import { useState, Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ListingList } from '@/components/listings/ListingList';
import { MapViewContent } from '@/components/listings/MapViewContent';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { FilterChips } from '@/components/filters/FilterChips';
import { FilterPresets } from '@/components/filters/FilterPresets';
import { ViewToggle } from '@/components/listings/ViewToggle';
import { SaveSearchButton } from '@/components/search/SaveSearchButton';
import { ComparisonButton } from '@/components/listings/ComparisonButton';
import { SlidersHorizontal } from 'lucide-react';

// Note: Metadata is exported from metadata.ts file
// This is a client component, so metadata must be in a separate file

export const dynamic = 'force-dynamic';

// Wrapper components that use useSearchParams - must be in Suspense
function SearchBarContent() {
  return <SearchBar />;
}

function FilterChipsContent() {
  return <FilterChips />;
}

function FilterPresetsContent() {
  return <FilterPresets />;
}

function ListingListContent() {
  return <ListingList />;
}

function MapViewContentWrapper() {
  return <MapViewContent />;
}

function FilterSidebarContent({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return <FilterSidebar isOpen={isOpen} onClose={onClose} />;
}

export default function ListingsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-comfort">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-teal-500 text-white py-12 sm:py-16 md:py-20 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 right-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-300 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          <div className="container mx-auto px-3 sm:px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 leading-[1.2] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">Browse Available Rooms</h1>
              <p className="font-body text-base sm:text-lg md:text-xl font-normal text-white/90 mb-6 sm:mb-8 md:mb-10 leading-relaxed tracking-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
                Search and filter through thousands of rooms to find your ideal space
              </p>
              
              {/* Enhanced Search Bar */}
              <div className="mb-6">
                <Suspense fallback={<div className="h-12" />}>
                  <SearchBarContent />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-6 md:py-8">
          {/* Filter Presets */}
          <div className="mb-5 sm:mb-6 md:mb-8">
            <Suspense fallback={null}>
              <FilterPresetsContent />
            </Suspense>
          </div>

          {/* Filter Toggle and View Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
              <Suspense fallback={null}>
                <SaveSearchButton />
              </Suspense>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-accent-200 rounded-lg hover:bg-accent-50 hover:border-accent-300 transition-all duration-200 shadow-soft md:hidden min-h-[44px] touch-target text-accent-700"
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">Filters</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          <div className="mb-4 sm:mb-6">
            <Suspense fallback={null}>
              <FilterChipsContent />
            </Suspense>
          </div>

          {/* Content with Sidebar */}
          <div className="flex gap-4 sm:gap-6 relative">
            {/* Filter Sidebar */}
            <Suspense fallback={null}>
              <FilterSidebarContent isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
            </Suspense>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {viewMode === 'list' ? (
                <Suspense fallback={<div className="text-center py-12">Loading listings...</div>}>
                  <ListingListContent />
                </Suspense>
              ) : (
                <Suspense fallback={<div className="text-center py-12">Loading map...</div>}>
                  <MapViewContentWrapper />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ComparisonButton />
    </>
  );
}

