'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getDefaultRedirectPath } from '@/lib/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';

export const dynamic = 'force-dynamic';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      
      // Get user data after login
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const redirectPath = getDefaultRedirectPath(user, redirectParam);
        router.push(redirectPath);
      } else {
        // Fallback if user data not available
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-comfort relative overflow-hidden">
        {/* Warm decorative background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral-200 rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-sm border border-accent-200 rounded-xl p-8 shadow-large">
            <h1 className="text-2xl font-bold mb-2 text-center text-gradient">Welcome Back</h1>
            <p className="text-sm text-grey-600 text-center mb-6">
              Sign in to continue your journey to finding the perfect home
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-grey-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-grey-700">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-accent-600 hover:text-accent-700 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-grey-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-grey-500">Or continue with</span>
              </div>
            </div>

            <SocialLoginButtons 
              onError={(error) => setError(error)}
              redirect={redirectParam || null}
            />

            <p className="mt-6 text-center text-sm text-grey-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-accent-600 font-semibold hover:text-accent-700 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function LoginForm() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center py-12 px-4">
          <LoadingSpinner size="lg" text="Loading..." />
        </main>
      </>
    }>
      <LoginFormContent />
    </Suspense>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
