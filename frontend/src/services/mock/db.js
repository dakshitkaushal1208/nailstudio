// DEVELOPMENT-ONLY data store.
//
// Stands in for the Spring Boot + MySQL backend while the API is being built.
// Everything lives in this browser's localStorage, is visible to anyone using
// the browser, and is NOT a real bookings/orders database. Do not collect real
// customer data through it. Turn it off with VITE_USE_MOCK=false.

import { seedGallery, defaultGalleryCategories } from '../../data/mockGallery';
import { seedServices } from '../../data/mockServices';
import { seedProducts } from '../../data/mockProducts';
import { seedSettings, seedAvailability } from '../../data/mockStudio';
import { toISODate, addDays } from '../../utils/date';

const KEY = 'nailstudio.devdata';
const VERSION = 3;

const clone = (v) => JSON.parse(JSON.stringify(v));
export const delay = (ms = 240) => new Promise((r) => setTimeout(r, ms));
export const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

function seedBookings() {
  const today = new Date();
  const d = (n) => toISODate(addDays(today, n));
  const base = { mock: true, adminNote: '' };
  const mk = (id, userId, name, svc, date, time, status, createdAgo, extra = {}) => ({
    ...base,
    id,
    userId,
    serviceId: svc.id,
    serviceName: svc.name,
    durationMin: svc.durationMin,
    price: svc.price,
    date,
    time,
    status,
    contact: { name, phone: '9876543210', email: 'sample@example.com' },
    notes: '',
    createdAt: new Date(Date.now() - createdAgo * 3600e3).toISOString(),
    ...extra,
  });
  const [gel, ext, french, art, removal] = seedServices;
  return [
    mk('bk_1001', 'usr_demo', 'Demo Customer', french, d(4), '11:00', 'PENDING', 5, { notes: 'Short almond shape, please.' }),
    mk('bk_1002', 'usr_demo', 'Demo Customer', gel, d(9), '15:00', 'APPROVED', 30),
    mk('bk_1003', 'usr_demo', 'Demo Customer', art, d(-12), '10:30', 'COMPLETED', 400),
    mk('bk_1004', 'usr_demo', 'Demo Customer', removal, d(-25), '16:00', 'CANCELLED', 700),
    mk('bk_1005', 'usr_c1', 'Sample Customer A', ext, d(2), '12:00', 'PENDING', 2),
    mk('bk_1006', 'usr_c2', 'Sample Customer B', gel, toISODate(today), '15:00', 'APPROVED', 50),
    mk('bk_1007', 'usr_c3', 'Sample Customer C', art, d(6), '10:00', 'PENDING', 8, { notes: 'Reference photo to be shared.' }),
    mk('bk_1008', 'usr_c1', 'Sample Customer A', french, d(-3), '14:30', 'REJECTED', 120, { adminNote: 'Sample: requested time unavailable.' }),
  ];
}

function seedOrders() {
  const prod = (i, variantIdx, qty) => {
    const p = seedProducts[i];
    const v = p.variants[variantIdx];
    return { productId: p.id, variantId: v.id, name: p.name, image: p.images[0], price: p.price, qty, options: v.options };
  };
  const ship = (name, city, state, pin) => ({
    name,
    phone: '9876543210',
    street: '12, Sample Lane',
    locality: 'Sample Colony',
    city,
    state,
    pin,
  });
  const mk = (n, userId, customer, items, shipping, status, paymentStatus, agoH, extra = {}) => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const at = new Date(Date.now() - agoH * 3600e3).toISOString();
    return {
      id: `ord_${n}`,
      number: `NS-${n}`,
      userId,
      customer,
      items,
      shipping,
      subtotal,
      deliveryCharge: null,
      total: subtotal,
      status,
      paymentStatus,
      tracking: { carrier: '', number: '' },
      adminNote: '',
      createdAt: at,
      history: [{ status, at }],
      mock: true,
      ...extra,
    };
  };
  const demo = { name: 'Demo Customer', email: 'demo.customer@example.com', phone: '9876543210' };
  return [
    mk(1038, 'usr_demo', demo, [prod(0, 2, 1), prod(1, 1, 1)], ship('Demo Customer', 'Chandigarh', 'Chandigarh', '160017'), 'DELIVERED', 'PAID', 24 * 20, {
      tracking: { carrier: 'Sample Courier', number: 'SC0012345' },
    }),
    mk(1041, 'usr_demo', demo, [prod(2, 1, 1)], ship('Demo Customer', 'Chandigarh', 'Chandigarh', '160017'), 'PLACED', 'UNPAID', 6),
    mk(1040, 'usr_c1', { name: 'Sample Customer A', email: 'a@example.com', phone: '9876500001' }, [prod(5, 0, 1)], ship('Sample Customer A', 'Jaipur', 'Rajasthan', '302001'), 'CONFIRMED', 'UNPAID', 30),
    mk(1039, 'usr_c2', { name: 'Sample Customer B', email: 'b@example.com', phone: '9876500002' }, [prod(3, 0, 2)], ship('Sample Customer B', 'Pune', 'Maharashtra', '411001'), 'DISPATCHED', 'PAID', 24 * 4, {
      tracking: { carrier: 'Sample Courier', number: 'SC0099871' },
    }),
  ];
}

function seed() {
  return {
    version: VERSION,
    settings: clone(seedSettings),
    availability: clone(seedAvailability),
    galleryCategories: [...defaultGalleryCategories],
    gallery: clone(seedGallery),
    services: clone(seedServices),
    products: clone(seedProducts),
    users: [],
    usersSeeded: false,
    bookings: seedBookings(),
    orders: seedOrders(),
    activity: [
      { id: 'act_1', type: 'order', text: 'New order NS-1041 placed (sample)', at: new Date(Date.now() - 6 * 3600e3).toISOString() },
      { id: 'act_2', type: 'booking', text: 'Booking request received: French Manicure (sample)', at: new Date(Date.now() - 5 * 3600e3).toISOString() },
    ],
    counters: { order: 1041, booking: 1008 },
  };
}

let cache = null;

export function db() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === VERSION) cache = parsed;
    }
  } catch {
    /* unreadable store: fall through to a fresh seed */
  }
  if (!cache) {
    cache = seed();
    commit();
  }
  return cache;
}

export function commit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

export function resetDevData() {
  cache = seed();
  commit();
}

export function logActivity(type, text) {
  const store = db();
  store.activity.unshift({ id: uid('act'), type, text, at: new Date().toISOString() });
  store.activity = store.activity.slice(0, 30);
}

export const copy = clone;
