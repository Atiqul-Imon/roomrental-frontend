'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import { Download, Trash2, FileText, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type RequestType = 'export' | 'deletion' | null;

export default function DataRequestPage() {
  const { user, isAuthenticated } = useAuth();
  const [requestType, setRequestType] = useState<RequestType>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  const handleDataExport = async () => {
    if (!isAuthenticated || !user) {
      showError('Please log in to request your data');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.get('/users/data-export');
      
      if (response.data.success) {
        // Create a downloadable JSON file
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `roomrentalusa-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showSuccess('Your data has been exported successfully');
        setRequestSubmitted(true);
      } else {
        throw new Error(response.data.error || 'Failed to export data');
      }
    } catch (error: any) {
      console.error('Data export error:', error);
      showError(
        error.response?.data?.error || 'Failed to export your data. Please try again or contact support.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataDeletion = async () => {
    if (!isAuthenticated || !user) {
      showError('Please log in to request data deletion');
      return;
    }

    if (!confirm(
      'Are you sure you want to delete your account and all associated data? This action cannot be undone. ' +
      'All your listings, messages, and account information will be permanently deleted.'
    )) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.delete('/users/account');
      
      if (response.data.success) {
        showSuccess('Your account and data have been deleted successfully');
        setRequestSubmitted(true);
        
        // Redirect to home page after a delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('Data deletion error:', error);
      showError(
        error.response?.data?.error || 'Failed to delete your account. Please try again or contact support.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-comfort">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
              <Shield className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-grey-900 mb-4">Data Rights Portal</h1>
              <p className="text-grey-700 mb-6">
                Please log in to access your data rights and manage your personal information.
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Log In
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-comfort">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12">
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
                <h1 className="text-3xl sm:text-4xl font-bold text-grey-900">
                  Your Data Rights
                </h1>
              </div>
              <p className="text-grey-600">
                Under GDPR and CCPA, you have the right to access, export, and delete your personal data.
              </p>
            </header>

            {requestSubmitted && requestType === 'export' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Data Export Complete</h3>
                </div>
                <p className="text-green-700">
                  Your data has been downloaded. If you need additional information, please contact our support team.
                </p>
              </div>
            ) : requestSubmitted && requestType === 'deletion' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Account Deletion Request Submitted</h3>
                </div>
                <p className="text-blue-700">
                  Your account deletion request has been processed. You will be redirected shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Data Export Section */}
                <section className="border border-grey-200 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Download className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-grey-900 mb-2">Export Your Data</h2>
                      <p className="text-grey-700 mb-4">
                        Download a copy of all your personal data stored on our platform. This includes your profile 
                        information, listings, messages, and activity history.
                      </p>
                      <button
                        onClick={handleDataExport}
                        disabled={isProcessing}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Export My Data
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Data Deletion Section */}
                <section className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-grey-900 mb-2">Delete Your Account</h2>
                      <p className="text-grey-700 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone. 
                        All your listings, messages, and account information will be permanently removed.
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Warning:</strong> This action is irreversible. Make sure you have exported any 
                          data you want to keep before proceeding.
                        </p>
                      </div>
                      <button
                        onClick={handleDataDeletion}
                        disabled={isProcessing}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Delete My Account
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Additional Rights Section */}
                <section className="border border-grey-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-grey-100 rounded-lg">
                      <FileText className="h-6 w-6 text-grey-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-grey-900 mb-2">Other Data Rights</h2>
                      <p className="text-grey-700 mb-4">
                        You also have the right to:
                      </p>
                      <ul className="list-disc list-inside text-grey-700 space-y-2 mb-4">
                        <li>Request correction of inaccurate data</li>
                        <li>Object to processing of your personal data</li>
                        <li>Request restriction of processing</li>
                        <li>Withdraw consent at any time</li>
                        <li>Lodge a complaint with a supervisory authority</li>
                      </ul>
                      <p className="text-grey-700">
                        To exercise these rights, please contact us at{' '}
                        <a href="mailto:privacy@roomrentalusa.com" className="text-primary-600 hover:text-primary-700 underline">
                          privacy@roomrentalusa.com
                        </a>
                        {' '}or review our{' '}
                        <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

