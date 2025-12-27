'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const sortOptions = [
  { value: 'date', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'squareFeet', label: 'Largest First' },
  { value: 'squareFeet-asc', label: 'Smallest First' },
  { value: 'distance', label: 'Distance (Nearest)' },
];

export function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentSort = searchParams.get('sort') || 'date';
  const currentLabel = sortOptions.find((opt) => opt.value === currentSort)?.label || 'Sort';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1'); // Reset to first page
    router.push(`/listings?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-grey-300 rounded-lg hover:bg-grey-50 transition min-h-[44px] sm:min-h-0 touch-target text-xs sm:text-sm font-medium"
      >
        <span className="hidden sm:inline">Sort: </span>
        <span>{currentLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 sm:w-48 bg-white border border-grey-200 rounded-lg shadow-large z-50 max-h-[60vh] sm:max-h-96 overflow-y-auto">
          <ul className="py-1 sm:py-2">
            {sortOptions.map((option) => (
              <li key={option.value}>
                <button
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-2 text-sm hover:bg-grey-50 transition min-h-[44px] sm:min-h-0 flex items-center ${
                    currentSort === option.value ? 'bg-primary-50 text-primary-600 font-medium' : 'text-grey-700'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

