/**
 * Permission definitions matching backend
 */

export const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_USER_ROLES: 'manage_user_roles',
  
  // Admin Management
  VIEW_ADMINS: 'view_admins',
  CREATE_ADMINS: 'create_admins',
  EDIT_ADMINS: 'edit_admins',
  DELETE_ADMINS: 'delete_admins',
  MANAGE_SUPER_ADMINS: 'manage_super_admins',
  
  // Listing Management
  VIEW_LISTINGS: 'view_listings',
  CREATE_LISTINGS: 'create_listings',
  EDIT_LISTINGS: 'edit_listings',
  DELETE_LISTINGS: 'delete_listings',
  APPROVE_LISTINGS: 'approve_listings',
  REJECT_LISTINGS: 'reject_listings',
  
  // Review Management
  VIEW_REVIEWS: 'view_reviews',
  EDIT_REVIEWS: 'edit_reviews',
  DELETE_REVIEWS: 'delete_reviews',
  
  // Analytics & Reports
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // System Settings
  SYSTEM_SETTINGS: 'system_settings',
  MANAGE_EMAIL_TEMPLATES: 'manage_email_templates',
  MANAGE_NOTIFICATIONS: 'manage_notifications',
  
  // Content Management
  MANAGE_CONTENT: 'manage_content',
  MANAGE_FAQ: 'manage_faq',
  MANAGE_ANNOUNCEMENTS: 'manage_announcements',
} as const;

export const PERMISSION_GROUPS = {
  user_management: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.MANAGE_USER_ROLES,
  ],
  admin_management: [
    PERMISSIONS.VIEW_ADMINS,
    PERMISSIONS.CREATE_ADMINS,
    PERMISSIONS.EDIT_ADMINS,
    PERMISSIONS.DELETE_ADMINS,
    PERMISSIONS.MANAGE_SUPER_ADMINS,
  ],
  listing_management: [
    PERMISSIONS.VIEW_LISTINGS,
    PERMISSIONS.CREATE_LISTINGS,
    PERMISSIONS.EDIT_LISTINGS,
    PERMISSIONS.DELETE_LISTINGS,
    PERMISSIONS.APPROVE_LISTINGS,
    PERMISSIONS.REJECT_LISTINGS,
  ],
  review_management: [
    PERMISSIONS.VIEW_REVIEWS,
    PERMISSIONS.EDIT_REVIEWS,
    PERMISSIONS.DELETE_REVIEWS,
  ],
  analytics: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
  ],
  system_settings: [
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_EMAIL_TEMPLATES,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
  ],
  content_management: [
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MANAGE_FAQ,
    PERMISSIONS.MANAGE_ANNOUNCEMENTS,
  ],
} as const;

