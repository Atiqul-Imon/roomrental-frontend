'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Search, X } from 'lucide-react';

interface LocationSuggestion {
  cities: string[];
  states: string[];
}

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState<LocationSuggestion>({ cities: [], states: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const response = await api.get('/search/suggestions', {
            params: { q: searchTerm },
          });
          if (response.data.success) {
            setSuggestions(response.data.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions({ cities: [], states: [] });
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  const handleSearch = (value?: string) => {
    const term = value || searchTerm;
    const params = new URLSearchParams(searchParams.toString());
    
    if (term.trim()) {
      params.set('search', term.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to first page on new search
    
    router.push(`/listings?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (type: 'city' | 'state', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  const clearSearch = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`/listings?${params.toString()}`);
  };

  const allSuggestions = [
    ...suggestions.cities.map((city) => ({ type: 'city' as const, value: city })),
    ...suggestions.states.map((state) => ({ type: 'state' as const, value: state })),
  ].slice(0, 8);

  return (
    <div ref={searchRef} className="relative w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <Search className="w-5 h-5 text-grey-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          placeholder="Search by location, city, or keywords..."
          className="w-full pl-12 pr-12 py-4 bg-white border-2 border-grey-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-medium text-base"
          aria-label="Search listings"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-grey-400 hover:text-grey-600 transition-colors duration-200 p-1 rounded-full hover:bg-grey-100"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && allSuggestions.length > 0 && (
        <div 
          id="search-suggestions"
          className="absolute z-50 w-full mt-3 bg-white border border-grey-200 rounded-xl shadow-large max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Search suggestions"
        >
          {isLoading ? (
            <div className="p-6 text-center text-grey-500" role="status" aria-live="polite">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : (
            <ul className="py-2">
              {allSuggestions.map((suggestion, index) => (
                <li key={index} role="option">
                  <button
                    onClick={() => handleSuggestionClick(suggestion.type, suggestion.value)}
                    className="w-full text-left px-5 py-3 hover:bg-primary-50 transition-colors duration-200 focus:bg-primary-50 focus:outline-none group"
                    aria-label={`Select ${suggestion.value} (${suggestion.type})`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-grey-900 group-hover:text-primary-600">
                        {suggestion.value}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-grey-100 text-grey-600 group-hover:bg-primary-100 group-hover:text-primary-600">
                        {suggestion.type === 'city' ? 'City' : 'State'}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

