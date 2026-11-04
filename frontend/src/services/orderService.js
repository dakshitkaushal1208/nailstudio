import { USE_MOCK, endpoints } from '../config';
import { api, ApiError } from './apiClient';
import { db, commit, delay, logActivity, copy } from './mock/db';

// Returns a number only when the studio has configured a valid charge;
// null means "to be confirmed by the studio", and the UI says so.
export function deliveryFor(subtotal, policy) {
  const charge = policy?.charge;
  if (typeof charge !== 'number' || !Number.isFinite(charge) || charge < 0) return null;
  const free = policy.freeAbove;
  if (typeof free === 'number' && free > 0 && subtotal >= free) return 0;
  return charge;
}

const real = {
  place: ({ userId, ...payload }) => api.post(endpoints.orders, payload),
  listMine: () => api.get(endpoints.myOrders),
  getMine: ({ id }) => api.get(`${endpoints.orders}/${id}`),
};

const mock = {
  // items: [{ productId, variantId, qty }]. Prices are re-read from the catalogue,
  // never trusted from the client, which is also how the real API must behave.
  async place({ items, shipping, customer, userId }) {
    await delay(420);
    const store = db();
    if (!userId) throw new ApiError('Please sign in to place an order.', { status: 401 });
    if (!items?.length) throw new ApiError('Your order has no items.', { status: 400 });

    const lines = items.map((line) => {
      const product = store.products.find((p) => p.id === line.productId && p.active);
      const variant = product?.variants.find((v) => v.id === line.variantId && v.active);
      if (!product || !variant) throw new ApiError('One of the items is no longer available.', { status: 409 });
      if (line.qty < 1 || line.qty > variant.stock) {
        throw new ApiError(`Only ${variant.stock} of "${product.name}" (${Object.values(variant.options).join(', ')}) left in stock.`, { status: 409 });
      }
      return { product, variant, qty: line.qty };
    });

    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const deliveryCharge = deliveryFor(subtotal, store.settings.deliveryPolicy);
    const n = ++store.counters.order;
    const at = new Date().toISOString();

    lines.forEach((l) => {
      l.variant.stock -= l.qty;
    });

    const order = {
      id: `ord_${n}`,
      number: `NS-${n}`,
      userId,
      customer,
      items: lines.map((l) => ({
        productId: l.product.id,
        variantId: l.variant.id,
        name: l.product.name,
        image: l.product.images[0],
        price: l.product.price,
        qty: l.qty,
        options: l.variant.options,
      })),
      shipping,
      subtotal,
      deliveryCharge,
      total: subtotal + (deliveryCharge || 0),
      status: 'PLACED',
      paymentStatus: 'UNPAID',
      tracking: { carrier: '', number: '' },
      adminNote: '',
      createdAt: at,
      history: [{ status: 'PLACED', at }],
      mock: true,
    };
    store.orders.unshift(order);
    logActivity('order', `New order ${order.number} placed (sample)`);
    commit();
    return copy(order);
  },

  async listMine({ userId }) {
    await delay(160);
    return copy(db().orders.filter((o) => o.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async getMine({ id, userId }) {
    await delay(100);
    const o = db().orders.find((x) => (x.id === id || x.number === id) && x.userId === userId);
    return o ? copy(o) : null;
  },
};

export const orderService = USE_MOCK ? mock : real;
