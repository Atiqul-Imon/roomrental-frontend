'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { api } from '@/lib/api';
import { calculatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthBarColor, validatePassword } from '@/lib/utils/password';

export const dynamic = 'force-dynamic';

function ResetPasswordFormContent() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(decodeURIComponent(emailParam));

    if (!tokenParam || !emailParam) {
      setError('Invalid reset link. Please request a new password reset.');
      setIsValidatingToken(false);
      return;
    }

    // Validate token on page load
    validateTokenOnLoad(tokenParam, decodeURIComponent(emailParam));
  }, [searchParams]);

  const validateTokenOnLoad = async (tokenValue: string, emailValue: string) => {
    setIsValidatingToken(true);
    setError('');

    // Basic validation - token format check (32+ hex characters)
    if (tokenValue && emailValue && tokenValue.length >= 32 && /^[a-f0-9]+$/i.test(tokenValue)) {
      setTokenValid(true);
    } else {
      setError('Invalid reset link format. Please request a new password reset.');
      setTokenValid(false);
    }
    
    setIsValidatingToken(false);
  };

  useEffect(() => {
    // Calculate password strength
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        token,
        newPassword,
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to reset password. The link may have expired. Please request a new one.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-comfort relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral-200 rounded-full blur-3xl" />
          </div>
          <div className="w-full max-w-md relative z-10">
            <div className="bg-white/95 backdrop-blur-sm border border-accent-200 rounded-xl p-8 shadow-large text-center">
              <LoadingSpinner size="lg" text="Validating reset link..." />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!tokenValid) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-comfort relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral-200 rounded-full blur-3xl" />
          </div>
          <div className="w-full max-w-md relative z-10">
            <div className="bg-white/95 backdrop-blur-sm border border-accent-200 rounded-xl p-8 shadow-large">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2 text-gradient">Invalid Reset Link</h1>
                <p className="text-sm text-grey-600 mb-6">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => router.push('/auth/forgot-password')} className="w-full">
                    Request New Reset Link
                  </Button>
                  <Link
                    href="/auth/login"
                    className="block text-sm text-accent-600 hover:text-accent-700 hover:underline transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-comfort relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral-200 rounded-full blur-3xl" />
          </div>
          <div className="w-full max-w-md relative z-10">
            <div className="bg-white/95 backdrop-blur-sm border border-accent-200 rounded-xl p-8 shadow-large text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-gradient">Password Reset Successful!</h1>
              <p className="text-sm text-grey-600 mb-6">
                Your password has been reset successfully. You can now login with your new password.
              </p>
              <p className="text-xs text-grey-500 mb-4">
                Redirecting to login page...
              </p>
              <Button onClick={() => router.push('/auth/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-comfort relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral-200 rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-sm border border-accent-200 rounded-xl p-8 shadow-large">
            <h1 className="text-2xl font-bold mb-2 text-center text-gradient">Reset Password</h1>
            <p className="text-sm text-grey-600 text-center mb-6">
              Enter your new password below
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2 text-grey-700">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-400" />
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                    className="w-full pl-10 pr-10 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-grey-400 hover:text-grey-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-grey-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getPasswordStrengthBarColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${getPasswordStrengthLabel(passwordStrength).color}`}>
                      {getPasswordStrengthLabel(passwordStrength).label}
                    </span>
                    </div>
                    <p className="text-xs text-grey-500">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-grey-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2 border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 transition-all"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-grey-400 hover:text-grey-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !token || !email || isValidatingToken || !tokenValid}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-accent-600 hover:text-accent-700 hover:underline transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function ResetPasswordForm() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center py-12 px-4">
          <LoadingSpinner size="lg" text="Loading..." />
        </main>
      </>
    }>
      <ResetPasswordFormContent />
    </Suspense>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}

