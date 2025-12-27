import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ListingList } from '@/components/listings/ListingList';
import { Search, Home as HomeIcon, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Home() {

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-grey-50" role="main">
        {/* Hero Section */}
        <section className="relative bg-gradient-primary text-white py-12 sm:py-16 md:py-20 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-3 sm:px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 sm:mb-6 md:mb-8 leading-tight tracking-tight">
                Find Your Perfect Room
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 md:mb-12 font-light px-2 leading-relaxed">
                Discover single rooms for rent across the United States. 
                Perfect for university students and young professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Link
                  href="/listings"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-xl font-semibold text-base sm:text-lg hover:scale-105 transition-all duration-200 shadow-large hover:shadow-xl flex items-center justify-center gap-2 min-h-[44px] touch-target"
                >
                  <Search className="w-5 h-5" />
                  Browse Listings
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-white/20 transition-all duration-200 min-h-[44px] touch-target"
                >
                  Sign In
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Join 10,000+ room seekers</span>
                </div>
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-5 h-5" />
                  <span className="text-sm">5,000+ listings available</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section className="container mx-auto px-3 sm:px-4 py-10 sm:py-12 md:py-16 section-spacing">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-grey-900 mb-3 leading-tight tracking-tight">Featured Listings</h2>
            <p className="text-sm sm:text-base md:text-lg text-grey-600 leading-relaxed">Discover rooms that match your preferences</p>
          </div>
          <ListingList />
        </section>
      </main>
      <Footer />
    </>
  );
}

