'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { CreateListingForm } from '@/components/listings/CreateListingForm';

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
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </>
    );
  }

  if (!isAuthenticated || user?.role !== 'landlord') {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>
          <div className="max-w-3xl">
            <CreateListingForm
              onSuccess={() => {
                router.push('/dashboard');
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}

