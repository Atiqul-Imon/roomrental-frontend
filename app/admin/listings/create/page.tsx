'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CreateListingForm } from '@/components/listings/CreateListingForm';
import { api } from '@/lib/api';
import { Building2, Loader2 } from 'lucide-react';

export default function AdminCreateListingPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedLandlordId, setSelectedLandlordId] = useState<string>('');

  // Fetch landlords for selection
  const { data: landlordsData, isLoading: landlordsLoading } = useQuery({
    queryKey: ['admin-landlords'],
    queryFn: async () => {
      const response = await api.get('/admin/landlords');
      return response.data.data || [];
    },
    enabled: isAdmin(),
  });

  useEffect(() => {
    if (!authLoading && !isAdmin()) {
      router.push('/auth/login?redirect=/admin/listings/create');
    }
  }, [authLoading, isAdmin, router]);

  if (authLoading || landlordsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-dark-text-secondary">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin()) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-500/20 rounded-xl">
            <Building2 className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-dark-text-primary">Create New Listing</h1>
            <p className="text-dark-text-secondary mt-1">Create a listing and assign it to a landlord</p>
          </div>
        </div>

        {/* Create Listing Form */}
        <div className="bg-dark-bg-secondary rounded-xl p-6 border border-dark-border-default">
          {landlordsData && landlordsData.length > 0 ? (
            <CreateListingForm
              isAdmin={true}
              selectedLandlordId={selectedLandlordId}
              onLandlordChange={setSelectedLandlordId}
              landlords={landlordsData}
              onSuccess={() => {
                router.push('/admin/listings');
              }}
            />
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-text-primary mb-2">No Landlords Available</h3>
              <p className="text-dark-text-secondary mb-6">
                You need at least one landlord account to create listings.
              </p>
              <button
                onClick={() => router.push('/admin/landlords')}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
              >
                View Landlords
              </button>
            </div>
          )}
        </div>

        {/* Landlord Selection Info */}
        {landlordsData && landlordsData.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Building2 className="w-5 h-5 text-blue-400 mt-0.5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-400 mb-1">Admin Listing Creation</h4>
                <p className="text-sm text-blue-300/80">
                  As an admin, you can create listings and assign them to any landlord. 
                  If no landlord is selected, the listing will be assigned to your admin account.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

