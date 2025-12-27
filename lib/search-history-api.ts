import { api } from './api';

export interface SearchHistory {
  id: string;
  userId?: string;
  searchQuery?: string;
  filters?: Record<string, any>;
  resultsCount: number;
  clickedListingId?: string;
  createdAt: string;
}

export const searchHistoryApi = {
  // Get all search history for current user
  getAll: async (limit?: number): Promise<SearchHistory[]> => {
    const params = limit ? { limit: limit.toString() } : {};
    const response = await api.get('/search-history', { params });
    return response.data.data;
  },

  // Create a search history entry
  create: async (data: {
    searchQuery?: string;
    filters?: Record<string, any>;
    resultsCount?: number;
    clickedListingId?: string;
  }): Promise<SearchHistory> => {
    const response = await api.post('/search-history', data);
    return response.data.data;
  },

  // Delete a search history entry
  delete: async (id: string): Promise<void> => {
    await api.delete(`/search-history/${id}`);
  },

  // Clear all search history
  clearAll: async (): Promise<void> => {
    await api.delete('/search-history');
  },

  // Get search analytics
  getAnalytics: async (): Promise<{
    totalSearches: number;
    uniqueSearches: number;
    popularQueries: string[];
    popularFilters: Array<{ filter: string; count: number }>;
  }> => {
    const response = await api.get('/search-history/analytics');
    return response.data.data;
  },
};





