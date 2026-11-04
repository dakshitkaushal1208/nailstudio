import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { productService } from '../services/productService';
import { clamp } from '../utils/format';

const KEY = 'nailstudio.cart';
const CartContext = createContext(null);

const read = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// A cart line keeps a snapshot of what the shopper saw (name, price, image,
// stock). The snapshot is refreshed from the catalogue, and the order service
// re-checks price and stock on submit, so the cart is a convenience only.
export const lineKey = (productId, variantId) => `${productId}:${variantId}`;

export const snapshotLine = (product, variant, qty) => ({
  key: lineKey(product.id, variant.id),
  productId: product.id,
  variantId: variant.id,
  qty,
  name: product.name,
  slug: product.slug,
  image: product.images[0],
  price: product.price,
  options: variant.options,
  stock: variant.stock,
  unavailable: false,
});

export function CartProvider({ children }) {
  const [lines, setLines] = useState(read);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* private mode: cart lasts for this visit only */
    }
  }, [lines]);

  const add = useCallback((product, variant, qty = 1) => {
    const existing = linesRef.current.find((l) => l.key === lineKey(product.id, variant.id));
    const have = existing ? existing.qty : 0;
    const room = variant.stock - have;
    if (variant.stock < 1) return { ok: false, message: 'This option is out of stock.' };
    if (room < 1) return { ok: false, message: `You already have all ${variant.stock} available in your cart.` };
    const add = Math.min(qty, room);
    setLines((list) =>
      existing
        ? list.map((l) => (l.key === existing.key ? { ...l, qty: l.qty + add, stock: variant.stock, price: product.price } : l))
        : [...list, snapshotLine(product, variant, add)]
    );
    return {
      ok: true,
      message: add < qty ? `Only ${add} more could be added: that is all the stock we have.` : 'Added to your cart.',
    };
  }, []);

  const setQty = useCallback(
    (key, qty) =>
      setLines((list) =>
        list.map((l) => (l.key === key ? { ...l, qty: clamp(Math.floor(qty) || 1, 1, Math.max(1, l.stock)) } : l))
      ),
    []
  );

  const remove = useCallback((key) => setLines((list) => list.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  // Pull current price/stock for everything in the cart.
  const refresh = useCallback(async () => {
    const current = linesRef.current;
    if (!current.length) return;
    try {
      const products = await productService.getMany([...new Set(current.map((l) => l.productId))]);
      setLines((list) =>
        list.map((l) => {
          const product = products.find((p) => p.id === l.productId);
          const variant = product?.variants.find((v) => v.id === l.variantId && v.active);
          if (!product || !product.active || !variant) return { ...l, unavailable: true, stock: 0 };
          return {
            ...l,
            name: product.name,
            image: product.images[0],
            price: product.price,
            stock: variant.stock,
            unavailable: variant.stock < 1,
            qty: variant.stock > 0 ? Math.min(l.qty, variant.stock) : l.qty,
          };
        })
      );
    } catch {
      /* offline: keep the snapshot */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => {
    const purchasable = lines.filter((l) => !l.unavailable);
    return {
      lines,
      purchasable,
      count: purchasable.reduce((n, l) => n + l.qty, 0),
      subtotal: purchasable.reduce((s, l) => s + l.price * l.qty, 0),
      add,
      setQty,
      remove,
      clear,
      refresh,
    };
  }, [lines, add, setQty, remove, clear, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
