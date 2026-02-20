'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { RefreshCw, Home, Building2, AlertCircle } from 'lucide-react';

interface RoleSwitcherProps {
  className?: string;
  variant?: 'compact' | 'full';
  onSwitchComplete?: () => void;
}

export function RoleSwitcher({ className = '', variant = 'full', onSwitchComplete }: RoleSwitcherProps) {
  const { user, switchRole, isLoading: authLoading } = useAuth();
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

  const handleSwitchClick = async () => {
    setIsSwitching(true);
    setError(null);

    try {
      await switchRole(targetRole);
      
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

  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-2">
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
          <span className="hidden sm:inline">
            {isSwitching ? `Switching to ${targetLabel}...` : `Switch to ${targetLabel}`}
          </span>
          <span className="sm:hidden">
            {isSwitching ? 'Switching...' : 'Switch'}
          </span>
        </button>
        
        {error && (
          <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
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
          <span>{isSwitching ? `Switching to ${targetLabel}...` : `Switch to ${targetLabel}`}</span>
        </button>
      </div>
      
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
