'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { RefreshCw, Home, Building2, X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoleSwitcherProps {
  className?: string;
  variant?: 'compact' | 'full';
  onSwitchComplete?: () => void;
}

export function RoleSwitcher({ className = '', variant = 'full', onSwitchComplete }: RoleSwitcherProps) {
  const { user, switchRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || authLoading) {
    return null;
  }

  // Only show for students and landlords
  if (!['student', 'landlord'].includes(user.role)) {
    return null;
  }

  const isStudent = user.role === 'student';
  const targetRole = isStudent ? 'landlord' : 'student';
  const targetLabel = isStudent ? 'Landlord' : 'Student';
  const currentLabel = isStudent ? 'Student' : 'Landlord';

  const handleSwitchClick = () => {
    setShowModal(true);
    setError(null);
  };

  const handleConfirmSwitch = async () => {
    setIsSwitching(true);
    setError(null);

    try {
      await switchRole(targetRole);
      setShowModal(false);
      
      // Small delay to ensure localStorage and state are updated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to appropriate dashboard after successful switch
      // Use window.location for full page reload to prevent stale state issues
      if (targetRole === 'landlord') {
        window.location.href = '/landlord/dashboard';
      } else {
        window.location.href = `/profile/${user.id}`;
      }
      
      if (onSwitchComplete) {
        onSwitchComplete();
      }
    } catch (err: any) {
      console.error('Role switch error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to switch role. Please try again.');
      setIsSwitching(false);
    }
  };

  const handleCancelSwitch = () => {
    setShowModal(false);
    setError(null);
  };

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleSwitchClick}
          disabled={isSwitching}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            isStudent
              ? 'bg-coral-50 text-coral-700 hover:bg-coral-100 border border-coral-200'
              : 'bg-accent-50 text-accent-700 hover:bg-accent-100 border border-accent-200'
          } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
          title={`Switch to ${targetLabel} mode`}
        >
          <RefreshCw className={`w-4 h-4 ${isSwitching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Switch to {targetLabel}</span>
          <span className="sm:hidden">Switch</span>
        </button>

        {showModal && <SwitchRoleModal
          currentRole={currentLabel}
          targetRole={targetLabel}
          isStudent={isStudent}
          isSwitching={isSwitching}
          error={error}
          onConfirm={handleConfirmSwitch}
          onCancel={handleCancelSwitch}
        />}
      </>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-grey-50 rounded-lg border border-grey-200">
          {isStudent ? (
            <Home className="w-4 h-4 text-accent-600" />
          ) : (
            <Building2 className="w-4 h-4 text-coral-600" />
          )}
          <span className="text-sm font-medium text-grey-900">
            {currentLabel} Mode
          </span>
        </div>
        
        <button
          onClick={handleSwitchClick}
          disabled={isSwitching}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-soft hover:shadow-medium ${
            isStudent
              ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:from-coral-600 hover:to-coral-700'
              : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700'
          } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${isSwitching ? 'animate-spin' : ''}`} />
          <span>Switch to {targetLabel}</span>
        </button>
      </div>

      {showModal && <SwitchRoleModal
        currentRole={currentLabel}
        targetRole={targetLabel}
        isStudent={isStudent}
        isSwitching={isSwitching}
        error={error}
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
      />}
    </>
  );
}

interface SwitchRoleModalProps {
  currentRole: string;
  targetRole: string;
  isStudent: boolean;
  isSwitching: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function SwitchRoleModal({
  currentRole,
  targetRole,
  isStudent,
  isSwitching,
  error,
  onConfirm,
  onCancel,
}: SwitchRoleModalProps) {
  const features = isStudent
    ? [
        'Create and manage property listings',
        'Receive messages from potential tenants',
        'Track views and engagement on your listings',
        'Manage multiple properties from one dashboard',
      ]
    : [
        'Browse and search for rental properties',
        'Save favorite listings for later',
        'Message landlords about properties',
        'Track your search history and preferences',
      ];

  const preservedData = [
    'Your profile information and settings',
    'All your messages and conversations',
    'Your account preferences',
    isStudent ? 'Your saved searches and favorites' : 'Your active listings',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className={`p-6 border-b ${
          isStudent ? 'bg-gradient-to-r from-coral-50 to-coral-100' : 'bg-gradient-to-r from-accent-50 to-accent-100'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {isStudent ? (
                <Building2 className="w-8 h-8 text-coral-600" />
              ) : (
                <Home className="w-8 h-8 text-accent-600" />
              )}
              <div>
                <h2 className="text-xl font-bold text-grey-900">
                  Switch to {targetRole} Mode?
                </h2>
                <p className="text-sm text-grey-600 mt-1">
                  Currently in {currentRole} Mode
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isSwitching}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-grey-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error switching roles</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* What You Can Do */}
          <div>
            <h3 className="font-semibold text-grey-900 mb-3">
              As a {targetRole}, you can:
            </h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-grey-700">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What's Preserved */}
          <div className="p-4 bg-accent-50 rounded-lg border border-accent-200">
            <h3 className="font-semibold text-grey-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your data is safe
            </h3>
            <p className="text-sm text-grey-700 mb-2">
              Everything will be preserved:
            </p>
            <ul className="space-y-1">
              {preservedData.map((item, index) => (
                <li key={index} className="text-sm text-grey-600 flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent-600 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Switch Back Info */}
          <p className="text-sm text-grey-600 italic">
            💡 You can switch back to {currentRole} mode anytime from your profile settings.
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-grey-50 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSwitching}
            className="flex-1 px-4 py-2.5 border border-grey-300 rounded-lg font-medium text-grey-700 hover:bg-grey-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSwitching}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-all shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              isStudent
                ? 'bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700'
                : 'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700'
            }`}
          >
            {isSwitching ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Switching...
              </span>
            ) : (
              `Switch to ${targetRole}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
