'use client';

import { useState, Suspense, useEffect } from 'react';
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
import { ComparisonModal } from '@/components/listings/ComparisonModal';
import { SlidersHorizontal } from 'lucide-react';

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
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  useEffect(() => {
    const handleOpenComparison = () => {
      setIsComparisonOpen(true);
    };
    window.addEventListener('openComparison', handleOpenComparison);
    return () => window.removeEventListener('openComparison', handleOpenComparison);
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-grey-50">
        {/* Hero Section */}
        <section className="bg-gradient-primary text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Room</h1>
              <p className="text-xl text-white/90 mb-8">
                Search through thousands of available rooms across the United States
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

        <div className="container mx-auto px-4 py-8">
          {/* Filter Presets */}
          <div className="mb-6">
            <Suspense fallback={null}>
              <FilterPresetsContent />
            </Suspense>
          </div>

          {/* Filter Toggle and View Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
              <Suspense fallback={null}>
                <SaveSearchButton />
              </Suspense>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-grey-300 rounded-lg hover:bg-grey-50 transition-all duration-200 shadow-soft lg:hidden"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="font-medium">Filters</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          <div className="mb-6">
            <Suspense fallback={null}>
              <FilterChipsContent />
            </Suspense>
          </div>

          {/* Content with Sidebar */}
          <div className="flex gap-6 relative">
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
      <ComparisonModal isOpen={isComparisonOpen} onClose={() => setIsComparisonOpen(false)} />
    </>
  );
}

