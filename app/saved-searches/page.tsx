'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { savedSearchesApi, SavedSearch } from '@/lib/saved-searches-api';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Bookmark, Trash2, Mail, MailX, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const dynamic = 'force-dynamic';

export default function SavedSearchesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: savedSearches = [], isLoading } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: savedSearchesApi.getAll,
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: savedSearchesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const toggleEmailMutation = useMutation({
    mutationFn: ({ id, emailAlerts }: { id: string; emailAlerts: boolean }) =>
      savedSearchesApi.update(id, { emailAlerts }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const applySearch = (savedSearch: SavedSearch) => {
    const params = new URLSearchParams();
    
    Object.entries(savedSearch.searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, String(value));
      }
    });
    
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  };

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    router.push('/auth/login?redirect=/saved-searches');
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-grey-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-grey-900 mb-2">Saved Searches</h1>
            <p className="text-grey-600">Manage your saved searches and get notified when new listings match</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
              <p className="text-grey-600">Loading saved searches...</p>
            </div>
          ) : savedSearches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-grey-200">
              <Bookmark className="w-16 h-16 text-grey-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-grey-900 mb-2">No saved searches yet</h2>
              <p className="text-grey-600 mb-6">Save your searches to quickly access them later</p>
              <Button
                onClick={() => router.push('/listings')}
                variant="primary"
              >
                <Search className="w-4 h-4 mr-2" />
                Start Searching
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="bg-white rounded-xl border border-grey-200 p-6 hover:shadow-large transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bookmark className="w-5 h-5 text-primary-500" />
                        <h3 className="text-lg font-semibold text-grey-900">{search.name}</h3>
                        {search.emailAlerts && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Alerts On
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-grey-500 mb-4">
                        Saved on {new Date(search.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(search.searchParams).map(([key, value]) => {
                          if (!value || (Array.isArray(value) && value.length === 0)) return null;
                          const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                          return (
                            <span
                              key={key}
                              className="px-3 py-1 bg-grey-100 text-grey-700 text-xs font-medium rounded-full"
                            >
                              {key}: {displayValue}
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => applySearch(search)}
                          variant="primary"
                          className="flex items-center gap-2"
                        >
                          <Search className="w-4 h-4" />
                          Apply Search
                        </Button>
                        <Button
                          onClick={() => toggleEmailMutation.mutate({ id: search.id, emailAlerts: search.emailAlerts })}
                          variant="outline"
                          className="flex items-center gap-2"
                          disabled={toggleEmailMutation.isPending}
                        >
                          {search.emailAlerts ? (
                            <>
                              <MailX className="w-4 h-4" />
                              Disable Alerts
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4" />
                              Enable Alerts
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this saved search?')) {
                              deleteMutation.mutate(search.id);
                            }
                          }}
                          variant="outline"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

