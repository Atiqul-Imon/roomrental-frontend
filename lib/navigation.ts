/**
 * Navigation utilities for role-based routing
 * Enterprise-standard navigation logic with proper error handling
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'landlord' | 'staff' | 'admin' | 'super_admin';
  profileImage?: string;
  bio?: string;
  adminMetadata?: {
    isActive: boolean;
    permissions?: string[];
  };
}

export type UserRole = 'student' | 'landlord' | 'staff' | 'admin' | 'super_admin';

/**
 * Get the default redirect path for a user after login/registration
 * @param user - User object with role and id
 * @param redirectParam - Optional redirect parameter from URL
 * @returns Redirect path
 */
export function getDefaultRedirectPath(
  user: User | null,
  redirectParam?: string | null
): string {
  // If redirect parameter exists and is valid, use it
  if (redirectParam && isValidRedirectPath(redirectParam, user)) {
    return redirectParam;
  }

  // If no user, redirect to login
  if (!user) {
    return '/auth/login';
  }

  // Role-based default redirects
  switch (user.role) {
    case 'student':
      // Students go to their profile page after registration
      if (user.id) {
        return `/profile/${user.id}`;
      }
      // Fallback if ID is missing (shouldn't happen, but safety check)
      console.warn('User ID missing for student, redirecting to dashboard');
      return '/dashboard';
    
    case 'landlord':
      // Landlords go to dashboard (they manage listings)
      return '/dashboard';
    
    case 'staff':
    case 'admin':
    case 'super_admin':
      // Admin users go to admin dashboard
      return '/admin/dashboard';
    
    default:
      // Fallback to dashboard for unknown roles
      console.warn(`Unknown user role: ${user.role}, redirecting to dashboard`);
      return '/dashboard';
  }
}

/**
 * Validate redirect path to prevent open redirect vulnerabilities
 * @param path - Path to validate
 * @param user - Current user for role-based validation
 * @returns True if path is valid and safe
 */
export function isValidRedirectPath(path: string, user: User | null): boolean {
  // Must be a relative path (starts with /)
  if (!path.startsWith('/')) {
    return false;
  }

  // Must not be an external URL
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return false;
  }

  // Must not contain dangerous patterns
  const dangerousPatterns = ['javascript:', 'data:', 'vbscript:'];
  if (dangerousPatterns.some(pattern => path.toLowerCase().includes(pattern))) {
    return false;
  }

  // Admin routes require admin role
  if (path.startsWith('/admin')) {
    if (!user) return false;
    const adminRoles: UserRole[] = ['staff', 'admin', 'super_admin'];
    return adminRoles.includes(user.role as UserRole);
  }

  // Profile routes should match user's own profile or be accessible
  if (path.startsWith('/profile/')) {
    // Allow if accessing own profile or if user is admin
    if (user) {
      const profileId = path.split('/profile/')[1]?.split('/')[0];
      if (profileId === user.id) return true;
      
      const adminRoles: UserRole[] = ['staff', 'admin', 'super_admin'];
      if (adminRoles.includes(user.role as UserRole)) return true;
    }
  }

  // Allow common public routes
  const allowedRoutes = [
    '/',
    '/dashboard',
    '/listings',
    '/favorites',
    '/settings',
    '/profile/edit',
    '/auth/login',
    '/auth/register',
  ];

  if (allowedRoutes.some(route => path === route || path.startsWith(route + '/'))) {
    return true;
  }

  // Default: allow if it's a relative path (but log for security)
  console.warn('Unvalidated redirect path:', path);
  return true;
}

/**
 * Navigate to user's profile page
 * @param userId - User ID
 * @returns Profile page path
 */
export function getProfilePath(userId: string | undefined | null): string {
  if (!userId) {
    console.error('Cannot generate profile path: userId is missing');
    return '/dashboard';
  }
  return `/profile/${userId}`;
}

/**
 * Navigate to edit profile page
 * @returns Edit profile path
 */
export function getEditProfilePath(): string {
  return '/profile/edit';
}

