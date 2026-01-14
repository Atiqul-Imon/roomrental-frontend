'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    pushNotifications: user?.preferences?.pushNotifications ?? true,
    smsNotifications: user?.preferences?.smsNotifications ?? false,
  });

  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        emailNotifications: user.preferences.emailNotifications ?? true,
        pushNotifications: user.preferences.pushNotifications ?? true,
        smsNotifications: user.preferences.smsNotifications ?? false,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (prefs: typeof preferences) => {
      const response = await api.put('/profile', {
        preferences: prefs,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert('Settings saved successfully!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(preferences);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <div className="max-w-2xl space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Notification Preferences */}
              <div className="border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium">Email Notifications</span>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          emailNotifications: e.target.checked,
                        }))
                      }
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium">Push Notifications</span>
                      <p className="text-sm text-muted-foreground">
                        Receive browser push notifications
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          pushNotifications: e.target.checked,
                        }))
                      }
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium">SMS Notifications</span>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          smsNotifications: e.target.checked,
                        }))
                      }
                      className="w-5 h-5"
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6 pt-4 border-t border-border">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>

                {updateMutation.isError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    Failed to save settings. Please try again.
                  </div>
                )}
              </div>
            </form>

            {/* Account Settings */}
            <div className="border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Account</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-1">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Role</p>
                  <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                </div>
                <Link
                  href="/profile/edit"
                  className="text-primary hover:underline text-sm"
                >
                  Edit Profile →
                </Link>
              </div>
            </div>

            {/* Change Password */}
            <ChangePasswordForm />
          </div>
        </div>
      </main>
    </>
  );
}

