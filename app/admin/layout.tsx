'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin()) {
      router.push('/auth/login?redirect=/admin/dashboard');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AdminLayout>{children}</AdminLayout>
      </ToastProvider>
    </ErrorBoundary>
  );
}

