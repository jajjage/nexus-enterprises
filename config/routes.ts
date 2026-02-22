/**
 * Centralized routing configuration for Nexus Enterprises
 * Organized by domain: Public, Tracking, Admin
 */

// Public domain routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/#who-we-are',
  SERVICES: '/#services',
  BLOG: '/blog',
  TRACK_LOGIN: '/track/login',
} as const;

// Tracking domain routes
export const TRACKING_ROUTES = {
  LOGIN: '/track/login',
  DASHBOARD: '/track',
  TRACK_BY_TOKEN: (token: string) => `/track/${token}`,
} as const;

// Admin domain routes
export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin',
  ORDERS: '/admin/orders',
  SERVICES: '/admin/services',
  BLOG: '/admin/blog',
  BLOG_NEW: '/admin/blog/new',
  BLOG_EDIT: (id: string) => `/admin/blog/${id}`,
} as const;

// Navigation items for main header
export const NAV_ITEMS = [
  { label: 'Home', href: PUBLIC_ROUTES.HOME },
  { label: 'About', href: PUBLIC_ROUTES.ABOUT },
  { label: 'Services', href: PUBLIC_ROUTES.SERVICES },
  { label: 'Resources', href: PUBLIC_ROUTES.BLOG },
] as const;

// Primary CTA buttons
export const CTA_BUTTONS = {
  REGISTER_BUSINESS: PUBLIC_ROUTES.SERVICES,
  TRACK_APPLICATION: TRACKING_ROUTES.LOGIN,
} as const;

// Footer quick links
export const FOOTER_LINKS = {
  HOME: PUBLIC_ROUTES.HOME,
  ABOUT: PUBLIC_ROUTES.ABOUT,
  SERVICES: PUBLIC_ROUTES.SERVICES,
  BLOG: PUBLIC_ROUTES.BLOG,
  TRACK: TRACKING_ROUTES.LOGIN,
} as const;

// External social links (will be moved to content.ts for dynamic management)
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com',
  LINKEDIN: 'https://linkedin.com',
  FACEBOOK: 'https://facebook.com',
  INSTAGRAM: 'https://instagram.com',
} as const;

// Admin navigation
export const ADMIN_NAV = [
  { label: 'Orders', href: ADMIN_ROUTES.ORDERS },
  { label: 'Services', href: ADMIN_ROUTES.SERVICES },
  { label: 'Blog', href: ADMIN_ROUTES.BLOG },
] as const;
