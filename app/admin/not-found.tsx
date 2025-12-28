'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, LayoutDashboard, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminNotFound() {
  const router = useRouter();

  return (
    <AdminLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-8 shadow-lg border-4 border-emerald-100">
                <AlertCircle className="w-20 h-20 text-emerald-600 mx-auto" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-emerald-600 mb-2 font-heading">404</h1>
            <div className="w-20 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          </div>

          {/* Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 font-heading">
              Admin Page Not Found
            </h2>
            <p className="text-base text-gray-600 max-w-md mx-auto">
              The admin page you're looking for doesn't exist or you don't have permission to access it.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/admin/dashboard"
              className="group flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
            >
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard
            </Link>
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            <Link
              href="/"
              className="group flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              View Site
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Quick Links:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/admin/users"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                Users
              </Link>
              <Link
                href="/admin/listings"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                Listings
              </Link>
              <Link
                href="/admin/landlords"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                Landlords
              </Link>
              <Link
                href="/admin/analytics"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

