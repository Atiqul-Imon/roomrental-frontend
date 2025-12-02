'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface SearchResult {
  id: string;
  type: 'user' | 'listing' | 'review' | 'admin';
  title: string;
  subtitle?: string;
  url: string;
  icon: React.ReactNode;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const performSearch = (searchQuery: string): SearchResult[] => {
    // This is a placeholder - replace with actual API call
    const lowerQuery = searchQuery.toLowerCase();
    const mockResults: SearchResult[] = [];

    // Mock user results
    if (lowerQuery.includes('user') || lowerQuery.includes('student') || lowerQuery.includes('landlord')) {
      mockResults.push({
        id: 'user-1',
        type: 'user',
        title: 'John Doe',
        subtitle: 'john.doe@example.com',
        url: '/admin/users/user-1',
        icon: <Search className="w-4 h-4" />,
      });
    }

    // Mock listing results
    if (lowerQuery.includes('listing') || lowerQuery.includes('room') || lowerQuery.includes('property')) {
      mockResults.push({
        id: 'listing-1',
        type: 'listing',
        title: 'Cozy Room in Downtown',
        subtitle: 'New York, NY',
        url: '/admin/listings/listing-1',
        icon: <Search className="w-4 h-4" />,
      });
    }

    return mockResults;
  };

  const handleResultClick = useCallback((result: SearchResult) => {
    router.push(result.url);
    onClose();
    setQuery('');
  }, [router, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    // Simulate API call - replace with actual API call
    const searchResults = performSearch(query);
    
    setTimeout(() => {
      setResults(searchResults);
      setIsLoading(false);
      setSelectedIndex(0);
    }, 300);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results, onClose, handleResultClick]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-400';
      case 'listing':
        return 'text-green-400';
      case 'review':
        return 'text-yellow-400';
      case 'admin':
        return 'text-purple-400';
      default:
        return 'text-dark-text-secondary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, listings, reviews..."
            className="w-full pl-10 pr-10 py-3 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-muted hover:text-dark-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : results.length === 0 && query ? (
            <div className="text-center py-8 text-dark-text-secondary">
              No results found for &quot;{query}&quot;
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-dark-text-secondary">
              Start typing to search...
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    index === selectedIndex
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-dark-bg-tertiary text-dark-text-secondary'
                  }`}
                >
                  <div className={getTypeColor(result.type)}>{result.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-text-primary truncate">
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="text-sm text-dark-text-muted truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getTypeColor(result.type)} bg-opacity-20`}>
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-border-default text-xs text-dark-text-muted">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-dark-bg-tertiary rounded border border-dark-border-default">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-dark-bg-tertiary rounded border border-dark-border-default">
                Enter
              </kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-dark-bg-tertiary rounded border border-dark-border-default">
                Esc
              </kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

