import { USE_MOCK, endpoints } from '../config';
import { api } from './apiClient';
import { db, delay, copy } from './mock/db';

const real = {
  list: (query = {}) => api.get(endpoints.products, { params: query }),
  getBySlug: (slug) => api.get(`${endpoints.products}/${encodeURIComponent(slug)}`),
  getMany: (ids) => api.get(endpoints.products, { params: { ids: ids.join(',') } }),
};

const totalStock = (p) => p.variants.filter((v) => v.active).reduce((s, v) => s + v.stock, 0);

const mock = {
  async list({ search = '', category = '', shape = '', sort = 'newest', availableOnly = false } = {}) {
    await delay(160);
    const q = search.trim().toLowerCase();
    let items = db().products.filter((p) => p.active);
    if (q) items = items.filter((p) => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
    if (category) items = items.filter((p) => p.category === category);
    if (shape) items = items.filter((p) => p.options.some((o) => o.name === 'Shape' && o.values.includes(shape)));
    if (availableOnly) items = items.filter((p) => totalStock(p) > 0);
    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
    };
    return copy(items.sort(sorters[sort] || sorters.newest));
  },

  async getBySlug(slug) {
    await delay(140);
    const p = db().products.find((x) => x.slug === slug && x.active);
    return p ? copy(p) : null;
  },

  async getMany(ids) {
    await delay(60);
    return copy(db().products.filter((p) => ids.includes(p.id)));
  },
};

export const productService = USE_MOCK ? mock : real;

// Shared by the shop UI: stock helpers that work on any product object.
export const productStock = totalStock;
export const findVariant = (product, selection) =>
  product.variants.find((v) => v.active && Object.entries(selection).every(([k, val]) => v.options[k] === val));
