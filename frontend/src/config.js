// Runtime configuration. Everything here can be overridden in .env.local.

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

// Gallery talks to the real Spring Boot API even while everything else is in
// mock mode. Set VITE_REAL_GALLERY=false to use sample gallery data instead.
export const USE_REAL_GALLERY = import.meta.env.VITE_REAL_GALLERY !== 'false';

// Uploaded files are served by the backend (e.g. /uploads/abc.jpg). The
// database keeps the relative path; the browser needs the full address.
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
export const assetUrl = (path) => (typeof path === 'string' && path.startsWith('/uploads/') ? API_ORIGIN + path : path);
export const storedUrl = (url) => (typeof url === 'string' && API_ORIGIN && url.startsWith(`${API_ORIGIN}/uploads/`) ? url.slice(API_ORIGIN.length) : url);

// Proposed REST contract for the Spring Boot service. These paths do not exist
// yet; change them here (not in components) when the real routes are decided.
export const endpoints = {
  register: '/auth/register',
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/auth/me',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  services: '/services',
  gallery: '/gallery',
  galleryCategories: '/gallery/categories',
  products: '/products',
  availability: '/availability',
  appointments: '/appointments',
  myAppointments: '/appointments/my',
  orders: '/orders',
  myOrders: '/orders/my',
  settings: '/settings',
  admin: {
    overview: '/admin/overview',
    appointments: '/admin/appointments',
    products: '/admin/products',
    orders: '/admin/orders',
    gallery: '/admin/gallery',
    services: '/admin/services',
    availability: '/admin/availability',
    settings: '/admin/settings',
  },
};