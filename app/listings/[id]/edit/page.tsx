'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { Header } from '@/components/layout/Header';
import { EditListingForm } from '@/components/listings/EditListingForm';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const listingId = resolvedParams.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const response = await api.get(`/listings/${listingId}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch listing');
      }
      return response.data.data as Listing;
    },
  });

  if (authLoading || isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (user?.id !== data.landlordId._id) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
              <p className="text-muted-foreground mb-6">
                You don&apos;t have permission to edit this listing.
              </p>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>
          <div className="max-w-3xl">
            <EditListingForm
              listing={data}
              onSuccess={() => {
                router.push(`/listings/${listingId}`);
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}

