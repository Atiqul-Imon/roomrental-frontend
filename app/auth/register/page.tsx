'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getDefaultRedirectPath } from '@/lib/navigation';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

function RegisterFormContent() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student' as 'student' | 'landlord',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { register, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  // Redirect if already authenticated (but not during registration process)
  useEffect(() => {
    if (!authLoading && user && !isLoading && !isRedirecting) {
      const redirectPath = getDefaultRedirectPath(user, redirectParam);
      router.replace(redirectPath);
    }
  }, [user, authLoading, redirectParam, router, isLoading, isRedirecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one number');
      return;
    }

    setIsLoading(true);

    try {
      const userData = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      );

      // Validate user data before redirect
      if (!userData || !userData.id) {
        throw new Error('Registration succeeded but user data is incomplete. Please try logging in.');
      }

      // Determine redirect path based on role
      const redirectPath = getDefaultRedirectPath(userData, redirectParam);
      
      // Validate redirect path before navigating
      if (!redirectPath || !redirectPath.startsWith('/')) {
        console.error('Invalid redirect path:', redirectPath);
        setIsLoading(false);
        router.replace('/dashboard');
        return;
      }
      
      // Set redirecting state
      setIsRedirecting(true);
      
      // Wait a moment for auth context to update, then navigate
      // This ensures the user state is properly set before redirecting
      setTimeout(() => {
        try {
          // Use window.location as fallback if router.replace doesn't work
          if (typeof window !== 'undefined') {
            window.location.href = redirectPath;
          } else {
            router.replace(redirectPath);
          }
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback to dashboard if navigation fails
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard';
          } else {
            router.replace('/dashboard');
          }
        }
      }, 500);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  // Show loading state during auth check or redirect
  if (authLoading || isRedirecting) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <LoadingSpinner 
              size="lg" 
              text={isRedirecting ? "Setting up your account..." : "Loading..."} 
            />
          </div>
        </main>
      </>
    );
  }

  // Don't render form if already authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-grey-50">
        <div className="w-full max-w-md">
          <div className="border border-border rounded-lg p-8 bg-background shadow-medium">
            <h1 className="text-2xl font-bold mb-2 text-center">Create Account</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Join our community and find your perfect room
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <span className="font-semibold">Error:</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className={`text-xs ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                    </div>
                    <div className={`text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[A-Z]/.test(formData.password) ? '✓' : '○'} One uppercase letter
                    </div>
                    <div className={`text-xs ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[a-z]/.test(formData.password) ? '✓' : '○'} One lowercase letter
                    </div>
                    <div className={`text-xs ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[0-9]/.test(formData.password) ? '✓' : '○'} One number
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-2">
                  I am a
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as 'student' | 'landlord' })
                  }
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="student">Student</option>
                  <option value="landlord">Landlord</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || isRedirecting}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function RegisterForm() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center py-12 px-4">
          <LoadingSpinner size="lg" text="Loading..." />
        </main>
      </>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}

export default function RegisterPage() {
  return <RegisterForm />;
}

