'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { savedSearchesApi, SavedSearch } from '@/lib/saved-searches-api';
import { Bookmark, ChevronDown, Trash2, Mail, MailX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SavedSearchesDropdown() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applySearch = (savedSearch: SavedSearch) => {
    const params = new URLSearchParams();
    
    // Apply all saved search parameters
    Object.entries(savedSearch.searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, String(value));
      }
    });
    
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this saved search?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleEmail = (e: React.MouseEvent, id: string, currentValue: boolean) => {
    e.stopPropagation();
    toggleEmailMutation.mutate({ id, emailAlerts: !currentValue });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
      >
        <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Saved Searches</span>
        <span className="sm:hidden">Saved</span>
        {savedSearches.length > 0 && (
          <span className="bg-primary-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
            {savedSearches.length}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] sm:max-w-none bg-white border border-grey-200 rounded-lg shadow-xl z-50 max-h-[60vh] sm:max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
              <p className="text-sm text-grey-600">Loading saved searches...</p>
            </div>
          ) : savedSearches.length === 0 ? (
            <div className="p-6 text-center">
              <Bookmark className="w-12 h-12 mx-auto mb-3 text-grey-300" />
              <p className="text-sm font-medium text-grey-700 mb-1">No saved searches</p>
              <p className="text-xs text-grey-500">Save your searches to quickly access them later</p>
            </div>
          ) : (
            <ul className="py-1 sm:py-2">
              {savedSearches.map((search) => (
                <li
                  key={search.id}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-grey-50 transition-colors cursor-pointer border-b border-grey-100 last:border-b-0 min-h-[44px] sm:min-h-0 flex items-center"
                  onClick={() => applySearch(search)}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm text-grey-900 mb-0.5 sm:mb-1 truncate">
                        {search.name}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-grey-500">
                        {new Date(search.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => handleToggleEmail(e, search.id, search.emailAlerts)}
                        className="p-1.5 sm:p-1.5 hover:bg-grey-200 rounded transition-colors touch-target"
                        title={search.emailAlerts ? 'Disable email alerts' : 'Enable email alerts'}
                      >
                        {search.emailAlerts ? (
                          <Mail className="w-4 h-4 text-primary-500" />
                        ) : (
                          <MailX className="w-4 h-4 text-grey-400" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, search.id)}
                        className="p-1.5 sm:p-1.5 hover:bg-red-50 rounded transition-colors text-red-500 touch-target"
                        title="Delete saved search"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

