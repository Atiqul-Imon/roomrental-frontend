'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CreateListingForm } from '@/components/listings/CreateListingForm';
import { LandlordLayout } from '@/components/landlord/LandlordLayout';

export default function CreateListingPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <LandlordLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </LandlordLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'landlord') {
    return null;
  }

  return (
    <LandlordLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Create New Listing</h1>
        <CreateListingForm
          onSuccess={() => {
            router.push('/landlord/dashboard');
          }}
        />
      </div>
    </LandlordLayout>
  );
}

