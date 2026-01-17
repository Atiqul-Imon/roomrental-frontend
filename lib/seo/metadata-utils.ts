/**
 * Utility functions for generating SEO-friendly metadata
 */

/**
 * Convert search params to canonical URL
 */
export function searchParamsToMetadata(
  params: { [key: string]: string | string[] | undefined },
  baseUrl: string
): string {
  const searchParams = new URLSearchParams();
  
  // Only include relevant search params for canonical URL
  const relevantParams = ['city', 'state', 'minPrice', 'maxPrice', 'propertyType'];
  
  relevantParams.forEach((key) => {
    const value = params[key];
    if (value && typeof value === 'string') {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate location-based title
 */
export function generateLocationTitle(city?: string, state?: string): string {
  if (city && state) {
    return `Rooms for Rent in ${city}, ${state}`;
  }
  if (state) {
    return `Rooms for Rent in ${state}`;
  }
  if (city) {
    return `Rooms for Rent in ${city}`;
  }
  return 'Browse Available Rooms for Rent';
}

/**
 * Generate location-based description
 */
export function generateLocationDescription(city?: string, state?: string): string {
  if (city && state) {
    return `Find rooms for rent in ${city}, ${state}. Browse verified listings with photos, prices, and amenities. Perfect for students and professionals.`;
  }
  if (state) {
    return `Find rooms for rent in ${state}. Browse verified listings with photos, prices, and amenities.`;
  }
  if (city) {
    return `Find rooms for rent in ${city}. Browse verified listings with photos, prices, and amenities.`;
  }
  return 'Search and filter through thousands of rooms to find your ideal space. Find verified listings across the United States.';
}





