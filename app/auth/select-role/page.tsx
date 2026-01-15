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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth context to finish loading
    if (authLoading) {
      return;
    }

    setIsCheckingAuth(false);

    // Check authentication - look in localStorage first (might be set but context not updated yet)
    const accessToken = localStorage.getItem('accessToken');
    const storedUserStr = localStorage.getItem('user');
    
    if (!accessToken) {
      console.log('[SelectRole] No access token found, redirecting to login');
      router.replace('/auth/login');
      return;
    }

    // Parse user from localStorage if auth context hasn't loaded it yet
    let currentUser = user;
    if (!currentUser && storedUserStr) {
      try {
        currentUser = JSON.parse(storedUserStr);
        console.log('[SelectRole] Loaded user from localStorage:', currentUser);
      } catch (e) {
        console.error('[SelectRole] Error parsing stored user:', e);
      }
    }

    // If user already has a valid role and is authenticated, redirect them
    if (currentUser && currentUser.role && ['student', 'landlord', 'staff', 'admin', 'super_admin'].includes(currentUser.role)) {
      console.log('[SelectRole] User already has role:', currentUser.role, 'redirecting to dashboard');
      const redirectPath = getDefaultRedirectPath(currentUser, null);
      router.replace(redirectPath);
    } else {
      console.log('[SelectRole] User needs to select role. Current user:', currentUser);
    }
  }, [user, authLoading, router]);

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

  // Show loading while checking authentication
  if (isCheckingAuth || authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-gradient-comfort">
          <div className="text-center bg-white/95 backdrop-blur-sm border border-accent-200 rounded-xl p-8 shadow-large max-w-md">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
      </>
    );
  }

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

