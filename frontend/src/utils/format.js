const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatPrice = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? inr.format(value) : '';

export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');

export const titleCase = (s) => String(s).toLowerCase().replace(/(^|_)(\w)/g, (_, sp, c) => (sp ? ' ' : '') + c.toUpperCase());

export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

export const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

export const variantLabel = (options = {}) => Object.values(options).join(' · ');
