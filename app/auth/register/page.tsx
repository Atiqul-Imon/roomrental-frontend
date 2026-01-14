'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getDefaultRedirectPath } from '@/lib/navigation';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

function RegisterFormContent() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student' as 'student' | 'landlord',
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
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

  const handleFormSubmit = async (e: React.FormEvent) => {
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

    setIsSendingOtp(true);
    setError('');

    try {
      // Send OTP to email
      const response = await api.post('/auth/send-otp', {
        email: formData.email.trim().toLowerCase(),
        purpose: 'registration',
      });

      if (response.data.success) {
        setStep('otp');
      } else {
        setError(response.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setIsVerifyingOtp(true);

    try {
      // Register with OTP verification
      const response = await api.post('/auth/register-with-otp', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        name: formData.name.trim(),
        role: formData.role,
        otpCode: otpCode.trim(),
      });

      if (response.data.success) {
        const { user: userData, tokens } = response.data.data;
        
        // Store tokens and user data
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Validate user data before redirect
        if (!userData || !userData.id) {
          throw new Error('Registration succeeded but user data is incomplete. Please try logging in.');
        }

        // Determine redirect path based on role
        const redirectPath = getDefaultRedirectPath(userData, redirectParam);
        
        // Validate redirect path before navigating
        if (!redirectPath || !redirectPath.startsWith('/')) {
          console.error('Invalid redirect path:', redirectPath);
          setIsVerifyingOtp(false);
          router.replace('/dashboard');
          return;
        }
        
        // Set redirecting state
        setIsRedirecting(true);
        
        // Wait a moment for auth context to update, then navigate
        setTimeout(() => {
          try {
            if (typeof window !== 'undefined') {
              window.location.href = redirectPath;
            } else {
              router.replace(redirectPath);
            }
          } catch (navError) {
            console.error('Navigation error:', navError);
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard';
            } else {
              router.replace('/dashboard');
            }
          }
        }, 500);
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsSendingOtp(true);

    try {
      const response = await api.post('/auth/send-otp', {
        email: formData.email.trim().toLowerCase(),
        purpose: 'registration',
      });

      if (response.data.success) {
        setError('');
        alert('New OTP code sent! Please check your email.');
      } else {
        setError(response.data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
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
      <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-comfort relative overflow-hidden">
        {/* Warm decorative background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral-200 rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-md relative z-10">
          <div className="border border-accent-200 rounded-lg p-8 bg-white/95 backdrop-blur-sm shadow-large">
            <h1 className="text-2xl font-bold mb-2 text-center text-gradient">Create Account</h1>
            <p className="text-sm text-grey-600 text-center mb-6">
              Join our community and find your perfect, cozy home
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <span className="font-semibold">Error:</span>
                <span>{error}</span>
              </div>
            )}

            {step === 'form' ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
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
                  className="w-full px-4 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all"
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
                  className="w-full px-4 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all"
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
                  autoComplete="new-password"
                  className="w-full px-4 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all"
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
                  className="w-full px-4 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all"
                >
                  <option value="student">Student</option>
                  <option value="landlord">Landlord</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp || isRedirecting}
                className="w-full px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-medium"
              >
                {isSendingOtp ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Sending verification code...</span>
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                  </p>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                    className="w-full px-4 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp || isRedirecting}
                  className="w-full px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-medium"
                >
                  {isVerifyingOtp ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify & Create Account'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                    className="text-sm text-accent-600 hover:text-accent-700 hover:underline transition-colors disabled:opacity-50"
                  >
                    {isSendingOtp ? 'Sending...' : "Didn't receive code? Resend"}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setOtpCode('');
                      setError('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-700 hover:underline transition-colors"
                  >
                    ← Back to form
                  </button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-accent-600 font-semibold hover:text-accent-700 hover:underline transition-colors">
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

