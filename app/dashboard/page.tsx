'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'landlord') {
        router.push('/landlord/dashboard');
        return;
      } else if (['admin', 'super_admin', 'staff'].includes(user.role)) {
        router.push('/admin/dashboard');
        return;
      }
      // Students stay on this page - show student dashboard
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Show student dashboard for students, or loading for other roles (will redirect)
  if (user && user.role === 'student') {
    return <StudentDashboard />;
  }

  // Still loading or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );
}
