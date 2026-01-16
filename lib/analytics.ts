/**
 * Google Analytics utility functions
 * Use these functions to track events throughout your application
 */

/**
 * Track page views (for client-side navigation)
 */
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
        page_path: url,
      });
    } catch (error) {
      // Silently fail if analytics is not available
      console.debug('Analytics tracking error:', error);
    }
  }
}

/**
 * Track custom events
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', eventName, eventParams);
    } catch (error) {
      // Silently fail if analytics is not available
      console.debug('Analytics tracking error:', error);
    }
  }
}

/**
 * Track listing views
 */
export function trackListingView(listingId: string, listingTitle: string) {
  trackEvent('view_listing', {
    listing_id: listingId,
    listing_title: listingTitle,
  });
}

/**
 * Track listing contact clicks
 */
export function trackListingContact(listingId: string) {
  trackEvent('contact_listing', {
    listing_id: listingId,
  });
}

/**
 * Track listing favorites
 */
export function trackListingFavorite(listingId: string, action: 'add' | 'remove') {
  trackEvent('favorite_listing', {
    listing_id: listingId,
    action: action,
  });
}

/**
 * Track search events
 */
export function trackSearch(searchQuery: string, filters?: Record<string, any>) {
  trackEvent('search', {
    search_term: searchQuery,
    ...filters,
  });
}

/**
 * Track user registration
 */
export function trackRegistration(method: 'email' | 'google' | 'facebook') {
  trackEvent('sign_up', {
    method: method,
  });
}

/**
 * Track user login
 */
export function trackLogin(method: 'email' | 'google' | 'facebook') {
  trackEvent('login', {
    method: method,
  });
}

/**
 * Track listing creation
 */
export function trackListingCreate(listingId: string) {
  trackEvent('create_listing', {
    listing_id: listingId,
  });
}

/**
 * Track form submissions
 */
export function trackFormSubmit(formName: string, success: boolean) {
  trackEvent(success ? 'form_submit_success' : 'form_submit_error', {
    form_name: formName,
  });
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

