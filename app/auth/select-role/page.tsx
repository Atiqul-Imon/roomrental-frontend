'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { api } from '@/lib/api';
import { getDefaultRedirectPath } from '@/lib/navigation';

export default function SelectRolePage() {
  const [role, setRole] = useState<'student' | 'landlord' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If not authenticated, redirect to login
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.replace('/auth/login');
      return;
    }

    // If user already has a valid role and is authenticated, redirect them
    if (user && user.role && ['student', 'landlord', 'staff', 'admin', 'super_admin'].includes(user.role)) {
      const redirectPath = getDefaultRedirectPath(user, null);
      router.replace(redirectPath);
    }
  }, [user, router]);

  const handleRoleSelect = async () => {
    if (!role) {
      setError('Please select a role');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Update user role via API (using profile endpoint)
      const response = await api.patch('/profile', {
        role,
      });

      if (response.data.success) {
        // Update local storage with new user data
        const updatedUser = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Reload the page to update auth context
        window.location.href = getDefaultRedirectPath(updatedUser, null);
      } else {
        setError(response.data.message || 'Failed to update role');
      }
    } catch (err: any) {
      console.error('Update role error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-comfort py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-large p-8 border border-accent-200">
            <h1 className="text-2xl font-bold text-center mb-2">Choose Your Role</h1>
            <p className="text-center text-gray-600 mb-6">
              Tell us how you&apos;ll use RoomRentalUSA
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <button
                onClick={() => setRole('student')}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  role === 'student'
                    ? 'border-accent-500 bg-accent-50'
                    : 'border-gray-200 hover:border-accent-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    role === 'student'
                      ? 'border-accent-500 bg-accent-500'
                      : 'border-gray-300'
                  }`}>
                    {role === 'student' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Student / Renter</h3>
                    <p className="text-sm text-gray-600">I&apos;m looking for a room to rent</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRole('landlord')}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  role === 'landlord'
                    ? 'border-accent-500 bg-accent-50'
                    : 'border-gray-200 hover:border-accent-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    role === 'landlord'
                      ? 'border-accent-500 bg-accent-500'
                      : 'border-gray-300'
                  }`}>
                    {role === 'landlord' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Landlord / Owner</h3>
                    <p className="text-sm text-gray-600">I want to list my rooms for rent</p>
                  </div>
                </div>
              </button>
            </div>

            <Button
              onClick={handleRoleSelect}
              disabled={!role || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Setting up your account...</span>
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

