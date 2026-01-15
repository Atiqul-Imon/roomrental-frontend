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
  const [isProcessing, setIsProcessing] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Get redirect parameter from URL (preserved through OAuth flow)
  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple executions
      if (!isProcessing) return;
      
      try {
        // Set initial status to show loading state immediately
        setStatus('Processing authentication...');

        // Initial delay to ensure hash is available (browser may need a moment)
        await new Promise(resolve => setTimeout(resolve, 200));

        let accessToken: string | null = null;
        let retryCount = 0;
        const maxRetries = 3;

        // Try to get access token from hash (may take a moment for browser to set it)
        while (!accessToken && retryCount < maxRetries) {
          const hash = window.location.hash || window.location.href.split('#')[1] || '';
          
          if (hash) {
            // Parse hash fragment: #access_token=xxx&token_type=xxx&expires_in=xxx
            const params = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
            accessToken = params.get('access_token');
            
            // Clean up the hash fragment from URL for security
            if (accessToken) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
              break;
            }
          }

          // Check for code in query params (alternative flow)
          const code = searchParams.get('code');
          if (code && !accessToken) {
            // Found code, will exchange it below
            break;
          }

          // Wait a bit before retry (hash might not be available immediately)
          if (!accessToken && retryCount < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
            retryCount++;
          } else {
            break;
          }
        }

        // If still no access token, try code exchange
        if (!accessToken) {
          const code = searchParams.get('code');

          if (!code) {
            // Only show error after all retries failed
            setError('No authorization code or access token received');
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

          accessToken = session.access_token;
        }

        setStatus('Verifying with backend...');

        // Send to your backend to verify and sync
        let response;
        try {
          response = await api.post('/auth/supabase/verify', {
            accessToken,
          });
        } catch (apiError: any) {
          // Handle rate limiting (429) or other API errors
          if (apiError.response?.status === 429) {
            setError('Too many login attempts. Please try again in an hour.');
            setTimeout(() => router.push('/auth/login?error=rate_limit'), 3000);
            return;
          }
          
          // Re-throw to be caught by outer catch block
          throw apiError;
        }

        if (response.data.success) {
          // Mark as redirecting to prevent error display
          setIsRedirecting(true);
          setIsProcessing(false);
          
          // Store tokens and user data
          localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
          
          setStatus('Redirecting...');

          // Redirect based on user role
          const user = response.data.data.user;
          const isNewOAuthUser = response.data.data.isNewUser || false;
          
          // If this is a new OAuth user, set a flag and redirect them to role selection
          // Otherwise, redirect to their default dashboard (preserving redirect param if provided)
          let redirectPath;
          if (isNewOAuthUser) {
            // Set a flag to indicate this user needs to select a role
            // Even if they have a default 'student' role, they should confirm it
            // Store redirect param for use after role selection
            if (redirectParam) {
              localStorage.setItem('pendingRedirect', redirectParam);
            }
            localStorage.setItem('needsRoleSelection', 'true');
            redirectPath = '/auth/select-role';
          } else {
            // Clear the flag if user is not new
            localStorage.removeItem('needsRoleSelection');
            // Use redirect param if provided, otherwise use default redirect path
            redirectPath = getDefaultRedirectPath(user, redirectParam);
          }
          
          // Use window.location immediately for full page reload to ensure auth context updates
          // No delay to prevent intermediate page flashes
          window.location.href = redirectPath;
        } else {
          setIsProcessing(false);
          setError('Failed to authenticate');
          setTimeout(() => router.push('/auth/login?error=auth_failed'), 2000);
        }
      } catch (err: any) {
        // Only set error if we're not already redirecting
        if (!isRedirecting) {
          setIsProcessing(false);
          console.error('Callback error:', err);
          const errorMessage = err.response?.data?.message || 
                              err.response?.data?.error || 
                              err.message || 
                              'Authentication failed';
          console.error('Full error details:', {
            message: errorMessage,
            status: err.response?.status,
            data: err.response?.data,
            stack: err.stack
          });
          setError(errorMessage);
          setTimeout(() => router.push(`/auth/login?error=${encodeURIComponent(errorMessage)}`), 2000);
        }
      }
    };

    handleCallback();
  }, [searchParams, router, isProcessing, isRedirecting]);

  // Don't show error if we're redirecting (prevents error flash)
  if (error && !isRedirecting) {
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

  // Always show loading state while processing or redirecting
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

