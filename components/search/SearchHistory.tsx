'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { searchHistoryApi, SearchHistory } from '@/lib/search-history-api';
import { Clock, X, Trash2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SearchHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchHistorySidebar({ isOpen, onClose }: SearchHistoryProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: searchHistory = [], isLoading } = useQuery({
    queryKey: ['search-history'],
    queryFn: () => searchHistoryApi.getAll(20),
    enabled: isAuthenticated && isOpen,
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
        } else {
          params.set(key, String(value));
        }
      });
    }
    
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
    onClose();
  };

  const formatFilters = (filters?: Record<string, any>): string => {
    if (!filters || Object.keys(filters).length === 0) return '';
    
    const parts: string[] = [];
    if (filters.city) parts.push(`City: ${filters.city}`);
    if (filters.state) parts.push(`State: ${filters.state}`);
    if (filters.minPrice) parts.push(`Min: $${filters.minPrice}`);
    if (filters.maxPrice) parts.push(`Max: $${filters.maxPrice}`);
    if (filters.propertyType) parts.push(`Type: ${filters.propertyType}`);
    if (filters.petFriendly) parts.push('Pet Friendly');
    
    return parts.join(', ');
  };

  // Prevent body scroll when sidebar is open
  // Must be called before any early returns to follow React hooks rules
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (isOpen && isAuthenticated) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar/Drawer */}
      <div
        className="fixed top-0 h-screen bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out"
        style={{ 
          width: 'min(85vw, 320px)',
          maxWidth: '320px',
          right: isOpen ? '0' : '-100%',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        <div className="flex flex-col h-full max-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-grey-200 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <h2 className="text-lg font-semibold text-grey-900 truncate">Search History</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-grey-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              aria-label="Close search history"
            >
              <X className="w-5 h-5 text-grey-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-3 text-grey-300" />
                <p className="text-sm font-medium text-grey-700 mb-1">No search history</p>
                <p className="text-xs text-grey-500">Your recent searches will appear here</p>
              </div>
            ) : (
              <>
                {searchHistory.length > 0 && (
                  <div className="mb-4">
                    <Button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all search history?')) {
                          clearAllMutation.mutate();
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={clearAllMutation.isPending}
                    >
                      {clearAllMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear All
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  {searchHistory.map((history) => (
                    <div
                      key={history.id}
                      className="p-3 bg-grey-50 rounded-lg hover:bg-grey-100 transition-colors cursor-pointer group"
                      onClick={() => applySearch(history)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {history.searchQuery && (
                            <div className="flex items-center gap-2 mb-1">
                              <Search className="w-4 h-4 text-primary-500 flex-shrink-0" />
                              <p className="text-sm font-medium text-grey-900 truncate">
                                {history.searchQuery}
                              </p>
                            </div>
                          )}
                          {history.filters && Object.keys(history.filters).length > 0 && (
                            <p className="text-xs text-grey-600 mb-1">
                              {formatFilters(history.filters)}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-grey-500">
                              {new Date(history.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-grey-500">
                              {history.resultsCount} results
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(history.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all text-red-500"
                          aria-label="Delete search history"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}



