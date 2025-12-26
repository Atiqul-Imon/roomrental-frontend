import { api } from './api';

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  searchParams: Record<string, any>;
  emailAlerts: boolean;
  createdAt: string;
  updatedAt: string;
}

export const savedSearchesApi = {
  // Get all saved searches for current user
  getAll: async (): Promise<SavedSearch[]> => {
    const response = await api.get('/saved-searches');
    return response.data.data;
  },

  // Create a new saved search
  create: async (name: string, searchParams: Record<string, any>, emailAlerts: boolean = true): Promise<SavedSearch> => {
    const response = await api.post('/saved-searches', {
      name,
      searchParams,
      emailAlerts,
    });
    return response.data.data;
  },

  // Update a saved search
  update: async (id: string, updates: { name?: string; emailAlerts?: boolean }): Promise<SavedSearch> => {
    const response = await api.patch(`/saved-searches/${id}`, updates);
    return response.data.data;
  },

  // Delete a saved search
  delete: async (id: string): Promise<void> => {
    await api.delete(`/saved-searches/${id}`);
  },
};

