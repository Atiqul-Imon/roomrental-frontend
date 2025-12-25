'use client';

import { LandlordLayout } from '@/components/landlord/LandlordLayout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandlordLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'landlord') {
      router.push('/auth/login?redirect=/landlord/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (user?.role !== 'landlord') {
    return null;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <LandlordLayout>{children}</LandlordLayout>
      </ToastProvider>
    </ErrorBoundary>
  );
}

