/**
 * Tiered Caching Strategy for React Query
 * 
 * Different data types have different cache requirements:
 * - Static data: Long cache (30 minutes)
 * - Listings: Medium cache (5 minutes)
 * - User data: Medium cache (10 minutes)
 * - Reviews: Short cache (2 minutes)
 * - Search: Very short cache (1 minute)
 */

export const queryConfig = {
  // Static data - rarely changes
  staticData: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (garbage collection)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },

  // Listings list - changes moderately
  listings: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },

  // Listing detail - changes frequently
  listingDetail: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },

  // User profile - changes infrequently
  userProfile: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },

  // Reviews - changes frequently
  reviews: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },

  // Search results - changes very frequently
  search: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },

  // Favorites - user-specific, changes moderately
  favorites: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },

  // Dashboard data - changes frequently
  dashboard: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },
};

/**
 * Helper function to get query config by key
 */
export function getQueryConfig(key: keyof typeof queryConfig) {
  return queryConfig[key];
}















