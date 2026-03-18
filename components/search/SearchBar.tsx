'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { BodySmall } from '@/components/ui/Typography';

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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    'Boston, MA',
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'San Francisco, CA',
  ]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // For the portal-rendered dropdown: keep it aligned to the input.
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideSearch = !!searchRef.current && searchRef.current.contains(target);
      const clickedInsideDropdown = !!dropdownRef.current && dropdownRef.current.contains(target);

      if (!clickedInsideSearch && !clickedInsideDropdown) setShowSuggestions(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.length >= 2) {
      // Show loading state immediately
      setIsLoading(true);
      setShowSuggestions(true);
      
      debounceRef.current = setTimeout(async () => {
        try {
          const response = await api.get('/search/suggestions', {
            params: { q: searchTerm },
          });
          if (response.data.success) {
            setSuggestions(response.data.data);
          } else {
            setSuggestions({ cities: [], states: [] });
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions({ cities: [], states: [] });
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else if (searchTerm.length > 0) {
      // Show suggestions even for single character (might have recent/popular)
      setSuggestions({ cities: [], states: [] });
      setIsLoading(false);
      // Keep suggestions visible if there are recent or popular searches
      if (recentSearches.length > 0 || popularSearches.length > 0) {
        setShowSuggestions(true);
      }
    } else {
      setSuggestions({ cities: [], states: [] });
      setIsLoading(false);
      // Don't auto-hide - let onFocus handle showing recent/popular
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, recentSearches.length, popularSearches.length]);

  useEffect(() => {
    if (!showSuggestions) return;
    if (typeof window === 'undefined') return;

    const updatePosition = () => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();

      // Tailwind mt-2 (8px) and sm:mt-3 (12px). Approximate based on sm breakpoint.
      const isSm = window.matchMedia('(min-width: 640px)').matches;
      const offset = isSm ? 12 : 8;

      setDropdownPosition({
        top: rect.bottom + offset,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    // Capture scroll on any ancestor to keep dropdown aligned.
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [showSuggestions, isLoading, searchTerm, recentSearches.length, popularSearches.length, suggestions.cities.length, suggestions.states.length]);

  const handleSearch = (value?: string) => {
    const term = value || searchTerm;
    const params = new URLSearchParams(searchParams.toString());
    
    if (term.trim()) {
      params.set('search', term.trim());
      // Save to recent searches
      const updated = [term.trim(), ...recentSearches.filter(s => s !== term.trim())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
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
    <div ref={searchRef} className="relative w-full max-w-3xl mx-auto z-[100000]">
      <div className="relative">
        <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-10">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-grey-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            // Always show suggestions when input is focused
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          placeholder="Search by location, city, or keywords..."
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white border-2 border-grey-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-medium text-sm sm:text-base !text-grey-900 placeholder:text-grey-400 min-h-[44px]"
          aria-label="Search listings by location, city, or keywords"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
          aria-describedby="search-description"
        />
        <span id="search-description" className="sr-only">
          Search for rooms by entering a city name, state, or keywords. Suggestions will appear as you type.
        </span>
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-grey-400 hover:text-grey-600 transition-colors duration-200 p-1.5 sm:p-1 rounded-full hover:bg-grey-100 touch-target"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {showSuggestions &&
        (isLoading ||
          allSuggestions.length > 0 ||
          (searchTerm.length === 0 && (recentSearches.length > 0 || popularSearches.length > 0))) &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                ref={dropdownRef}
                id="search-suggestions"
                className="bg-white border border-grey-200 rounded-xl shadow-large max-h-[60vh] sm:max-h-96 overflow-y-auto"
                role="listbox"
                aria-label="Search suggestions"
                style={{
                  position: 'fixed',
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  zIndex: 100000,
                }}
              >
                {isLoading ? (
                  <div className="p-6 text-center text-grey-500" role="status" aria-live="polite">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
                    <p className="mt-2 text-sm">Searching...</p>
                  </div>
                ) : (
                  <>
                    {/* Location Suggestions */}
                    {allSuggestions.length > 0 && (
                      <div className="py-2">
                        <div className="px-5 py-2">
                          <BodySmall className="text-grey-500 font-medium uppercase tracking-wider">
                            Locations
                          </BodySmall>
                        </div>
                        <ul>
                          {allSuggestions.map((suggestion, index) => (
                            <li key={index} role="option">
                              <button
                                onClick={() => handleSuggestionClick(suggestion.type, suggestion.value)}
                                className="w-full text-left px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-primary-50 transition-colors duration-200 focus:bg-primary-50 focus:outline-none group min-h-[44px] flex items-center"
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
                      </div>
                    )}

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && searchTerm.length === 0 && (
                      <div className="py-2 border-t border-grey-200">
                        <div className="px-5 py-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-grey-400" />
                          <BodySmall className="text-grey-500 font-medium">Recent Searches</BodySmall>
                        </div>
                        <ul>
                          {recentSearches.map((search, index) => (
                            <li key={index} role="option">
                              <button
                                onClick={() => {
                                  setSearchTerm(search);
                                  handleSearch(search);
                                }}
                                className="w-full text-left px-5 py-2.5 hover:bg-grey-50 transition-colors duration-200 focus:bg-grey-50 focus:outline-none text-sm text-grey-700"
                              >
                                {search}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Popular Searches */}
                    {searchTerm.length === 0 && allSuggestions.length === 0 && recentSearches.length === 0 && (
                      <div className="py-2">
                        <div className="px-5 py-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-grey-400" />
                          <BodySmall className="text-grey-500 font-medium">Popular Searches</BodySmall>
                        </div>
                        <ul>
                          {popularSearches.map((search, index) => (
                            <li key={index} role="option">
                              <button
                                onClick={() => {
                                  setSearchTerm(search);
                                  handleSearch(search);
                                }}
                                className="w-full text-left px-5 py-2.5 hover:bg-grey-50 transition-colors duration-200 focus:bg-grey-50 focus:outline-none text-sm text-grey-700"
                              >
                                {search}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* No Results Message */}
                    {searchTerm.length >= 2 && allSuggestions.length === 0 && !isLoading && (
                      <div className="p-6 text-center text-grey-500">
                        <p className="text-sm">No location suggestions found for "{searchTerm}"</p>
                        <p className="text-xs mt-1 text-grey-400">Try a different search term</p>
                      </div>
                    )}
                  </>
                )}
              </div>,
              document.body
            )
          : null)}
    </div>
  );
}

