'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { searchHistoryApi, SearchHistory } from '@/lib/search-history-api';
import { Clock, Trash2, Search, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SearchHistoryTab() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: searchHistory = [], isLoading } = useQuery({
    queryKey: ['search-history'],
    queryFn: () => searchHistoryApi.getAll(50),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: searchHistoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: searchHistoryApi.clearAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
    },
  });

  const applySearch = (history: SearchHistory) => {
    const params = new URLSearchParams();
    
    if (history.searchQuery) {
      params.set('search', history.searchQuery);
    }
    
    if (history.filters) {
      Object.entries(history.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else if (value !== null && value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
    }
    
    router.push(`/listings?${params.toString()}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 text-grey-500">
        <p>Please sign in to view your search history</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (searchHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 mx-auto text-grey-300 mb-4" />
        <p className="text-grey-600 font-medium mb-2">No search history yet</p>
        <p className="text-sm text-grey-500">Your recent searches will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-grey-900">
            {searchHistory.length} {searchHistory.length === 1 ? 'Search' : 'Searches'}
          </h3>
        </div>
        {searchHistory.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to clear all search history?')) {
                clearAllMutation.mutate();
              }
            }}
            disabled={clearAllMutation.isPending}
            className="text-xs sm:text-sm min-h-[36px] sm:min-h-0"
          >
            {clearAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Search History List */}
      <div className="space-y-2">
        {searchHistory.map((history) => (
          <div
            key={history.id}
            className="bg-grey-50 border border-grey-200 rounded-lg p-3 sm:p-4 hover:bg-grey-100 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                onClick={() => applySearch(history)}
                className="flex-1 text-left min-w-0"
              >
                <div className="flex items-start gap-2 sm:gap-3 mb-2">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    {history.searchQuery && (
                      <p className="font-semibold text-sm sm:text-base text-grey-900 mb-1 truncate">
                        {history.searchQuery}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-grey-600">
                      {history.filters?.city && (
                        <span className="px-2 py-0.5 bg-white rounded border border-grey-200">
                          City: {history.filters.city}
                        </span>
                      )}
                      {history.filters?.state && (
                        <span className="px-2 py-0.5 bg-white rounded border border-grey-200">
                          State: {history.filters.state}
                        </span>
                      )}
                      {history.filters?.minPrice && (
                        <span className="px-2 py-0.5 bg-white rounded border border-grey-200">
                          Min: ${history.filters.minPrice}
                        </span>
                      )}
                      {history.filters?.maxPrice && (
                        <span className="px-2 py-0.5 bg-white rounded border border-grey-200">
                          Max: ${history.filters.maxPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-grey-500 mt-2">
                      {new Date(history.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(history.id);
                }}
                disabled={deleteMutation.isPending}
                className="p-1.5 sm:p-2 text-grey-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target opacity-0 group-hover:opacity-100 sm:opacity-100"
                aria-label="Delete search"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


