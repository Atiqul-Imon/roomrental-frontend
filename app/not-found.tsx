'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Search, ArrowLeft, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';

export default function NotFound() {
  const router = useRouter();
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-8 shadow-lg">
                <AlertCircle className="w-24 h-24 text-emerald-600 mx-auto" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-6">
            <h1 className="text-9xl font-bold text-emerald-600 mb-2 font-heading">404</h1>
            <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          </div>

          {/* Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 font-heading">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="group flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
            <Link
              href="/listings"
              className="group flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Search className="w-5 h-5" />
              Browse Listings
            </Link>
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Popular Pages:</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/listings"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                All Listings
              </Link>
              <Link
                href="/auth/login"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/help"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

