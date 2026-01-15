'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getDefaultRedirectPath } from '@/lib/navigation';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Completing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');

        if (!code) {
          setError('No authorization code received');
          setTimeout(() => router.push('/auth/login?error=no_code'), 2000);
          return;
        }

        setStatus('Exchanging code for session...');

        // Exchange code for session
        const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setTimeout(() => router.push(`/auth/login?error=${encodeURIComponent(sessionError.message)}`), 2000);
          return;
        }

        if (!session?.access_token) {
          setError('No access token received');
          setTimeout(() => router.push('/auth/login?error=no_token'), 2000);
          return;
        }

        setStatus('Verifying with backend...');

        // Send to your backend to verify and sync
        const response = await api.post('/auth/supabase/verify', {
          accessToken: session.access_token,
        });

        if (response.data.success) {
          // Store tokens and user data
          localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
          
          setStatus('Redirecting...');

          // Redirect based on user role
          const user = response.data.data.user;
          const isNewOAuthUser = response.data.data.isNewUser || false;
          
          // If this is a new OAuth user, redirect them to role selection
          // Otherwise, redirect to their default dashboard
          let redirectPath;
          if (isNewOAuthUser) {
            redirectPath = '/auth/select-role';
          } else {
            redirectPath = getDefaultRedirectPath(user, null);
          }
          
          // Small delay to show success message
          setTimeout(() => {
            router.push(redirectPath);
          }, 500);
        } else {
          setError('Failed to authenticate');
          setTimeout(() => router.push('/auth/login?error=auth_failed'), 2000);
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.response?.data?.message || err.message || 'Authentication failed');
        setTimeout(() => router.push('/auth/login?error=callback_error'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-comfort">
        <div className="text-center bg-white/95 backdrop-blur-sm border border-accent-200 rounded-xl p-8 shadow-large max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-comfort">
      <div className="text-center bg-white/95 backdrop-blur-sm border border-accent-200 rounded-xl p-8 shadow-large max-w-md">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-comfort">
        <div className="text-center bg-white/95 backdrop-blur-sm border border-accent-200 rounded-xl p-8 shadow-large max-w-md">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

