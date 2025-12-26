import { create } from 'zustand';
import { Listing } from '@/types';

interface ComparisonStore {
  listings: Listing[];
  addListing: (listing: Listing) => void;
  removeListing: (listingId: string) => void;
  clearAll: () => void;
  isInComparison: (listingId: string) => boolean;
  canAddMore: () => boolean;
}

const MAX_COMPARISON_ITEMS = 5;

export const useComparisonStore = create<ComparisonStore>((set, get) => ({
  listings: [],
  addListing: (listing) => {
    const current = get().listings;
    if (current.length >= MAX_COMPARISON_ITEMS) {
      return; // Don't add if at max
    }
    if (current.some((l) => l._id === listing._id)) {
      return; // Don't add if already exists
    }
    set({ listings: [...current, listing] });
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('comparison-storage', JSON.stringify([...current, listing]));
    }
  },
  removeListing: (listingId) => {
    const newListings = get().listings.filter((l) => l._id !== listingId);
    set({ listings: newListings });
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('comparison-storage', JSON.stringify(newListings));
    }
  },
  clearAll: () => {
    set({ listings: [] });
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('comparison-storage');
    }
  },
  isInComparison: (listingId) => {
    return get().listings.some((l) => l._id === listingId);
  },
  canAddMore: () => {
    return get().listings.length < MAX_COMPARISON_ITEMS;
  },
}));

// Load from localStorage on mount
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('comparison-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        useComparisonStore.setState({ listings: parsed });
      }
    }
  } catch (e) {
    // Invalid JSON, ignore
  }
}

