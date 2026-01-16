'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Client-side validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      // Always show success message (security - don't reveal if email exists)
      setSuccess(true);
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
            <h1 className="text-2xl font-bold mb-2 text-center text-gradient">Forgot Password</h1>
            <p className="text-sm text-grey-600 text-center mb-6">
              Enter your email address and we'll send you a link to reset your password
            </p>

            {success ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Email Sent!</p>
                    <p>
                      If an account with that email exists, we've sent a password reset link. Please check your email and follow the instructions.
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-grey-600">
                  <p>Didn't receive the email?</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Check your spam/junk folder</li>
                    <li>Make sure you entered the correct email address</li>
                    <li>Wait a few minutes and try again</li>
                  </ul>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => router.push('/auth/login')}
                    className="flex-1"
                  >
                    Back to Login
                  </Button>
                  <Button
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Send Another
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
                        autoFocus
                        className="w-full pl-10 pr-4 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 text-sm text-accent-600 hover:text-accent-700 hover:underline transition-colors justify-center"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                  <p className="text-center text-sm text-grey-600">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" className="text-accent-600 font-semibold hover:text-accent-700 hover:underline transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}



