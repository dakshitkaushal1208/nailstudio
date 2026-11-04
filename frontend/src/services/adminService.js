
import { USE_MOCK, USE_REAL_GALLERY, endpoints, storedUrl } from '../config';
import { api, ApiError } from './apiClient';
import {
  db,
  commit,
  delay,
  uid,
  logActivity,
  copy,
  resetDevData,
} from './mock/db';
import { fetchAllGallery, galleryCategories } from './galleryService';
import { todayISO } from '../utils/date';
import { slugify, variantLabel } from '../utils/format';
import { ORDER_TRANSITIONS } from '../utils/status';

// Multipart gallery upload.
async function uploadGalleryImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const result = await api.upload('/gallery/upload', formData);

  if (!result?.imageUrl) {
    throw new ApiError(
      'The server saved the file but did not return its address.'
    );
  }

  return result.imageUrl;
}

const A = endpoints.admin;

const USE_REAL_APPOINTMENTS =
  import.meta.env.VITE_REAL_APPOINTMENTS === 'true';

// Shared create/update helper for real API resources.
const save = (base) => (item) =>
  item.id
    ? api.put(`${base}/${item.id}`, item)
    : api.post(base, item);

/* --------------------------------------------------------------------------
   REAL API IMPLEMENTATION
-------------------------------------------------------------------------- */

const real = {
  overview: () => api.get(A.overview),

  // Appointments
  listAppointments: (filters = {}) =>
    api.get(A.appointments, { params: filters }),

  setAppointmentStatus: ({ id, status, note = '' }) =>
    api.patch(`${A.appointments}/${id}`, {
      status,
      adminNote: note,
    }),

  // Products
  listProducts: () => api.get(A.products),

  getProduct: (id) => api.get(`${A.products}/${id}`),

  saveProduct: save(A.products),

  setProductActive: ({ id, active }) =>
    api.patch(`${A.products}/${id}`, { active }),

  // Orders
  listOrders: (filters = {}) =>
    api.get(A.orders, { params: filters }),

  getOrder: (id) => api.get(`${A.orders}/${id}`),

  updateOrder: ({ id, ...changes }) =>
    api.patch(`${A.orders}/${id}`, changes),

  // Gallery
  listGallery: fetchAllGallery,

  async saveGalleryItem(item) {
    const visible = item.active !== false;

    const payload = {
      title: (item.title || '').trim(),
      description: (item.description || '').trim(),
      imageUrl: storedUrl((item.imageUrl || '').trim()),
      category: item.category,
      featured: visible,
      active: visible,
      displayOrder: item.order ?? 0,
    };

    return item.id
      ? api.put(`/gallery/${item.id}`, payload)
      : api.post('/gallery', payload);
  },

  removeGalleryItem: (id) =>
    api.del(`/gallery/${id}`),

  async reorderGallery() {
    throw new ApiError(
      'Gallery reordering needs a backend endpoint that is not implemented yet.'
    );
  },

  async getGalleryCategories() {
    return galleryCategories(await fetchAllGallery(), true);
  },

  async saveGalleryCategories() {
    throw new ApiError(
      'Category management needs a backend endpoint that is not implemented yet.'
    );
  },

  // Services
  listServices: () => api.get(A.services),

  saveService: save(A.services),

  removeService: (id) =>
    api.del(`${A.services}/${id}`),

  // Availability
  getAvailability: () => api.get(A.availability),

  saveAvailability: (data) =>
    api.put(A.availability, data),

  // Settings
  getSettings: () => api.get(A.settings),

  saveSettings: (data) =>
    api.put(A.settings, data),

  uploadGalleryImage,
};

/* --------------------------------------------------------------------------
   MOCK IMPLEMENTATION
-------------------------------------------------------------------------- */

const BOOKING_MOVES = {
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['COMPLETED', 'CANCELLED'],
};

const byDateTime = (a, b) =>
  (a.date + a.time).localeCompare(b.date + b.time);

const mock = {
  async overview() {
    await delay(160);

    const s = db();
    const today = todayISO();
    const lowStock = [];

    s.products
      .filter((p) => p.active)
      .forEach((p) =>
        p.variants
          .filter((v) => v.active && v.stock <= 2)
          .forEach((v) =>
            lowStock.push({
              productId: p.id,
              name: p.name,
              variant: variantLabel(v.options),
              stock: v.stock,
            })
          )
      );

    return copy({
      pendingAppointments: s.bookings
        .filter((b) => b.status === 'PENDING')
        .sort(byDateTime),

      todaysAppointments: s.bookings
        .filter(
          (b) =>
            b.date === today &&
            ['APPROVED', 'PENDING'].includes(b.status)
        )
        .sort(byDateTime),

      newOrders: s.orders.filter(
        (o) => Date.now() - new Date(o.createdAt) < 72 * 3600e3
      ).length,

      awaitingOrders: s.orders.filter(
        (o) => o.status === 'PLACED'
      ),

      lowStock: lowStock.sort((a, b) => a.stock - b.stock),

      activity: s.activity.slice(0, 8),
    });
  },

  /* ---- appointments ---- */

  async listAppointments({ status = '', date = '' } = {}) {
    await delay(160);

    return copy(
      db()
        .bookings.filter(
          (b) =>
            (!status || b.status === status) &&
            (!date || b.date === date)
        )
        .sort(byDateTime)
    );
  },

  async setAppointmentStatus({ id, status, note = '' }) {
    await delay(260);

    const b = db().bookings.find((x) => x.id === id);

    if (!b) {
      throw new ApiError('Appointment not found.', { status: 404 });
    }

    if (!(BOOKING_MOVES[b.status] || []).includes(status)) {
      throw new ApiError(
        'That change is not allowed for this appointment.',
        { status: 409 }
      );
    }

    b.status = status;

    if (note) {
      b.adminNote = note;
    }

    logActivity(
      'booking',
      `Appointment ${b.serviceName} (${b.date}) marked ${status.toLowerCase()} (sample)`
    );

    commit();

    return copy(b);
  },

  /* ---- products ---- */

  async listProducts() {
    await delay(140);
    return copy(db().products);
  },

  async getProduct(id) {
    await delay(100);

    const p = db().products.find((x) => x.id === id);

    return p ? copy(p) : null;
  },

  async saveProduct(input) {
    await delay(320);

    const s = db();
    const errors = {};

    if (!input.name?.trim()) {
      errors.name = 'Give the product a name.';
    }

    if (!(Number(input.price) > 0)) {
      errors.price = 'Enter a price above zero.';
    }

    if (!input.images?.some((u) => u.trim())) {
      errors.images = 'Add at least one image URL.';
    }

    const slug = slugify(input.slug || input.name || '');

    if (!slug) {
      errors.slug = 'A web address is required.';
    } else if (
      s.products.some(
        (p) => p.slug === slug && p.id !== input.id
      )
    ) {
      errors.slug =
        'Another product already uses this web address.';
    }

    if (Object.keys(errors).length) {
      throw new ApiError('Please fix the highlighted fields.', {
        status: 422,
        fieldErrors: errors,
      });
    }

    const clean = {
      ...input,
      slug,
      name: input.name.trim(),
      price: Number(input.price),
      images: input.images.map((u) => u.trim()).filter(Boolean),
      details: (input.details || [])
        .map((d) => d.trim())
        .filter(Boolean),
      variants: input.variants.map((v) => ({
        ...v,
        stock: Math.max(0, parseInt(v.stock, 10) || 0),
      })),
    };

    if (clean.id) {
      const i = s.products.findIndex((p) => p.id === clean.id);

      if (i < 0) {
        throw new ApiError('Product not found.', { status: 404 });
      }

      s.products[i] = { ...s.products[i], ...clean };
    } else {
      clean.id = uid('prd');
      clean.createdAt = new Date().toISOString();
      clean.active = clean.active !== false;
      s.products.unshift(clean);
    }

    commit();

    return copy(s.products.find((p) => p.id === clean.id));
  },

  async setProductActive({ id, active }) {
    await delay(160);

    const p = db().products.find((x) => x.id === id);

    if (p) {
      p.active = active;
    }

    commit();

    return copy(p);
  },

  /* ---- orders ---- */

  async listOrders({
    status = '',
    paymentStatus = '',
    search = '',
  } = {}) {
    await delay(160);

    const q = search.trim().toLowerCase();

    return copy(
      db()
        .orders.filter(
          (o) =>
            (!status || o.status === status) &&
            (!paymentStatus || o.paymentStatus === paymentStatus) &&
            (!q ||
              `${o.number} ${o.customer.name} ${o.customer.email}`
                .toLowerCase()
                .includes(q))
        )
        .sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        )
    );
  },

  async getOrder(id) {
    await delay(100);

    const o = db().orders.find((x) => x.id === id);

    return o ? copy(o) : null;
  },

  async updateOrder({
    id,
    status,
    paymentStatus,
    tracking,
    adminNote,
  }) {
    await delay(260);

    const s = db();
    const o = s.orders.find((x) => x.id === id);

    if (!o) {
      throw new ApiError('Order not found.', { status: 404 });
    }

    if (status && status !== o.status) {
      if (!(ORDER_TRANSITIONS[o.status] || []).includes(status)) {
        throw new ApiError(
          'That status change is not allowed for this order.',
          { status: 409 }
        );
      }

      // Return stock when an order is rejected or cancelled.
      if (['REJECTED', 'CANCELLED'].includes(status)) {
        o.items.forEach((it) => {
          const v = s.products
            .find((p) => p.id === it.productId)
            ?.variants.find((x) => x.id === it.variantId);

          if (v) {
            v.stock += it.qty;
          }
        });
      }

      o.status = status;
      o.history.push({
        status,
        at: new Date().toISOString(),
      });
    }

    if (paymentStatus) {
      o.paymentStatus = paymentStatus;
    }

    if (tracking) {
      o.tracking = {
        carrier: tracking.carrier?.trim() || '',
        number: tracking.number?.trim() || '',
      };
    }

    if (typeof adminNote === 'string') {
      o.adminNote = adminNote;
    }

    logActivity('order', `Order ${o.number} updated (sample)`);

    commit();

    return copy(o);
  },

  /* ---- gallery: sample mode ---- */

  async uploadGalleryImage(file) {
    if (file.size > 1.5 * 1024 * 1024) {
      throw new ApiError(
        'Sample mode keeps images in the browser: please use an image under 1.5 MB.'
      );
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);

      reader.onerror = () =>
        reject(new ApiError('That image could not be read.'));

      reader.readAsDataURL(file);
    });
  },

  async listGallery() {
    await delay(120);

    return copy(
      db().gallery.sort((a, b) => a.order - b.order)
    );
  },

  async saveGalleryItem(input) {
    await delay(260);

    const s = db();
    const errors = {};

    if (!input.title?.trim()) {
      errors.title = 'Add a title.';
    }

    if (!input.imageUrl?.trim()) {
      errors.imageUrl = 'An image URL is required.';
    }

    if (!input.category) {
      errors.category = 'Choose a category.';
    }

    if (Object.keys(errors).length) {
      throw new ApiError('Please fix the highlighted fields.', {
        status: 422,
        fieldErrors: errors,
      });
    }

    if (input.id) {
      const i = s.gallery.findIndex((g) => g.id === input.id);

      if (i < 0) {
        throw new ApiError('Gallery item not found.', {
          status: 404,
        });
      }

      s.gallery[i] = {
        ...s.gallery[i],
        ...input,
        sample: false,
      };
    } else {
      s.gallery.push({
        ...input,
        id: uid('gal'),
        order: s.gallery.length + 1,
        active: input.active !== false,
        sample: false,
      });
    }

    commit();

    return true;
  },

  async removeGalleryItem(id) {
    await delay(200);

    const s = db();

    s.gallery = s.gallery.filter((g) => g.id !== id);

    s.gallery
      .sort((a, b) => a.order - b.order)
      .forEach((g, i) => {
        g.order = i + 1;
      });

    commit();
  },

  async reorderGallery(ids) {
    await delay(120);

    const s = db();

    ids.forEach((id, i) => {
      const g = s.gallery.find((x) => x.id === id);

      if (g) {
        g.order = i + 1;
      }
    });

    commit();
  },

  async getGalleryCategories() {
    await delay(60);
    return [...db().galleryCategories];
  },

  async saveGalleryCategories(list) {
    await delay(160);

    db().galleryCategories = [
      ...new Set(list.map((c) => c.trim()).filter(Boolean)),
    ];

    commit();
  },

  /* ---- services ---- */

  async listServices() {
    await delay(120);

    return copy(
      db().services.sort((a, b) => a.order - b.order)
    );
  },

  async saveService(input) {
    await delay(260);

    const s = db();
    const errors = {};

    if (!input.name?.trim()) {
      errors.name = 'Give the service a name.';
    }

    if (!(Number(input.durationMin) >= 15)) {
      errors.durationMin = 'Duration must be at least 15 minutes.';
    }

    if (
      input.price !== '' &&
      input.price !== null &&
      !(Number(input.price) >= 0)
    ) {
      errors.price = 'Enter a valid price, or leave blank.';
    }

    if (Object.keys(errors).length) {
      throw new ApiError('Please fix the highlighted fields.', {
        status: 422,
        fieldErrors: errors,
      });
    }

    const clean = {
      ...input,
      name: input.name.trim(),
      durationMin: Number(input.durationMin),
      price:
        input.price === '' || input.price === null
          ? null
          : Number(input.price),
    };

    if (clean.id) {
      const i = s.services.findIndex((x) => x.id === clean.id);

      if (i < 0) {
        throw new ApiError('Service not found.', { status: 404 });
      }

      s.services[i] = { ...s.services[i], ...clean };
    } else {
      s.services.push({
        ...clean,
        id: uid('svc'),
        order: s.services.length + 1,
        active: clean.active !== false,
      });
    }

    commit();

    return true;
  },

  async removeService(id) {
    await delay(200);

    const s = db();

    s.services = s.services.filter((x) => x.id !== id);

    commit();
  },

  /* ---- availability and settings ---- */

  async getAvailability() {
    await delay(100);
    return copy(db().availability);
  },

  async saveAvailability(data) {
    await delay(260);

    db().availability = copy(data);

    commit();

    return copy(data);
  },

  async getSettings() {
    await delay(100);
    return copy(db().settings);
  },

  async saveSettings(data) {
    await delay(260);

    db().settings = copy(data);

    commit();

    return copy(data);
  },
};

/* --------------------------------------------------------------------------
   FEATURE-SPECIFIC API OVERRIDES

   Keep the gallery connected to Spring Boot independently.
   Appointment calls can be switched to Spring Boot independently too.
-------------------------------------------------------------------------- */

const galleryApi = {
  listGallery: real.listGallery,
  saveGalleryItem: real.saveGalleryItem,
  removeGalleryItem: real.removeGalleryItem,
  reorderGallery: real.reorderGallery,
  getGalleryCategories: real.getGalleryCategories,
  saveGalleryCategories: real.saveGalleryCategories,
  uploadGalleryImage: real.uploadGalleryImage,
};

const appointmentApi = {
  listAppointments: real.listAppointments,
  setAppointmentStatus: real.setAppointmentStatus,
};

const mockWithGallery = USE_REAL_GALLERY
  ? { ...mock, ...galleryApi }
  : mock;

const mockWithAppointments = USE_REAL_APPOINTMENTS
  ? {
      ...mockWithGallery,
      ...appointmentApi,

      async overview() {
        const dashboard = await mockWithGallery.overview();
        const appointments = await real.listAppointments();
        const today = todayISO();

        const normalized = appointments.map((a) => ({
          ...a,
          serviceName: a.serviceName || a.serviceId,
          customer: a.customer || {
            name: a.contact?.name || a.customerName || '',
            phone: a.contact?.phone || a.customerPhone || '',
            email: a.contact?.email || a.customerEmail || '',
          },
        }));

        return {
          ...dashboard,

          pendingAppointments: normalized.filter(
            (a) => a.status === 'PENDING'
          ),

          todaysAppointments: normalized.filter(
            (a) =>
              a.date === today &&
              ['PENDING', 'APPROVED', 'CONFIRMED'].includes(a.status)
          ),
        };
      },
    }
  : mockWithGallery;

const realWithGallery = {
  ...real,
  ...galleryApi,
};

export const adminService = USE_MOCK
  ? mockWithAppointments
  : realWithGallery;

export { resetDevData };
