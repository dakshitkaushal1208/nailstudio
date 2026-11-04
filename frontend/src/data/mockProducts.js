import { sampleImage as img } from './assets';

// Each product declares its own option set, so a set can be sold by size only,
// or by size + shape + length. Variants are the combinations, each with its own
// stock. SAMPLE data: replace with the catalogue from the API.

export const buildVariants = (productId, options, stockFor = () => 5) => {
  let combos = [{}];
  options.forEach((opt) => {
    combos = combos.flatMap((c) => opt.values.map((v) => ({ ...c, [opt.name]: v })));
  });
  return combos.map((values, i) => ({
    id: `${productId}_v${i + 1}`,
    options: values,
    stock: stockFor(values, i),
    sku: `${productId.replace('prd_', '').toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
    active: true,
  }));
};

const days = (n) => new Date(Date.now() - n * 86400000).toISOString();

const defs = [
  {
    id: 'prd_01',
    name: 'Soft French',
    category: 'French',
    price: 1450,
    created: 4,
    description:
      'A sheer milky base with a slim white edge, sized to wear with everything. Each set includes ten nails in your size, nail glue, adhesive tabs, a mini file and a prep pad.',
    details: ['Ten nails per set', 'Reusable with care', 'Hand-finished, not machine-printed'],
    options: [
      { name: 'Shape', values: ['Almond', 'Coffin'] },
      { name: 'Size', values: ['XS', 'S', 'M', 'L'] },
    ],
    stock: (v) => (v.Shape === 'Coffin' && v.Size === 'XS' ? 0 : v.Size === 'L' ? 2 : 6),
    images: ['p01-a', 'p01-b'],
  },
  {
    id: 'prd_02',
    name: 'Quiet Nude',
    category: 'Minimal',
    price: 1250,
    created: 12,
    description:
      'One even rose-beige wash on a soft oval. The set to keep in a drawer for the days that need nothing else.',
    details: ['Ten nails per set', 'Soft satin finish', 'Prep kit included'],
    options: [
      { name: 'Size', values: ['XS', 'S', 'M', 'L'] },
      { name: 'Shape', values: ['Oval', 'Square'] },
    ],
    stock: (v) => (v.Size === 'M' ? 8 : 4),
    images: ['p02-a', 'p02-b'],
  },
  {
    id: 'prd_03',
    name: 'Garden Party',
    category: 'Floral',
    price: 1850,
    created: 2,
    description:
      'Tiny hand-painted blossoms with gold centres on an ivory ground. Slightly more finish work per nail, which shows.',
    details: ['Ten nails per set', 'Hand-painted detail', 'Prep kit included'],
    options: [
      { name: 'Shape', values: ['Almond'] },
      { name: 'Size', values: ['S', 'M', 'L'] },
    ],
    stock: (v) => (v.Size === 'S' ? 1 : 3),
    images: ['p03-a', 'p03-b'],
  },
  {
    id: 'prd_04',
    name: 'Liquid Gold',
    category: 'Chrome',
    price: 1950,
    created: 20,
    description:
      'A warm gold chrome over a sheer base. It moves from champagne to amber as the light changes.',
    details: ['Ten nails per set', 'Mirror-chrome finish', 'Prep kit included'],
    options: [
      { name: 'Shape', values: ['Almond', 'Coffin'] },
      { name: 'Length', values: ['Short', 'Long'] },
      { name: 'Size', values: ['S', 'M'] },
    ],
    stock: (v) => (v.Length === 'Long' && v.Shape === 'Coffin' ? 0 : 3),
    images: ['p04-a', 'p04-b'],
  },
  {
    id: 'prd_05',
    name: 'Cocoa Square',
    category: 'Minimal',
    price: 1350,
    created: 30,
    description: 'Short, squared and milk-chocolate brown: practical enough for every day and still unmistakably considered.',
    details: ['Ten nails per set', 'High-gloss finish', 'Prep kit included'],
    options: [
      { name: 'Shape', values: ['Square', 'Coffin'] },
      { name: 'Size', values: ['S', 'M', 'L'] },
    ],
    stock: () => 5,
    images: ['p05-a', 'p05-b'],
  },
  {
    id: 'prd_06',
    name: 'Rosette',
    category: 'Glam',
    price: 2250,
    created: 8,
    description:
      'Gold flecks scattered across a dusty-rose base, with a set pearl on every accent nail. Made for evenings.',
    details: ['Ten nails per set', 'Set crystal accents', 'Prep kit included'],
    options: [
      { name: 'Shape', values: ['Coffin', 'Almond'] },
      { name: 'Size', values: ['XS', 'S', 'M', 'L'] },
    ],
    stock: (v) => (v.Shape === 'Almond' ? 2 : 4),
    images: ['p06-a', 'p06-b'],
  },
  {
    id: 'prd_07',
    name: 'Blush & Bloom',
    category: 'Floral',
    price: 1650,
    created: 45,
    description: 'A soft French on one hand and florals on the accent nails of the other. A mixed set that wears like a whole look.',
    details: ['Ten nails per set', 'Mixed French and floral', 'Prep kit included'],
    options: [{ name: 'Size', values: ['S', 'M', 'L'] }],
    stock: (v) => (v.Size === 'M' ? 5 : 0),
    images: ['p07-a', 'p07-b'],
  },
  {
    id: 'prd_08',
    name: 'Champagne Mirror',
    category: 'Chrome',
    price: 1750,
    created: 60,
    description: 'A pale champagne chrome with a polished, reflective finish. Quiet and bright at the same time.',
    details: ['Ten nails per set', 'Mirror-chrome finish', 'Prep kit included'],
    options: [
      { name: 'Shape', values: ['Almond'] },
      { name: 'Size', values: ['XS', 'S', 'M', 'L'] },
    ],
    stock: () => 4,
    images: ['p08-a', 'p08-b'],
  },
];

export const seedProducts = defs.map((d) => ({
  id: d.id,
  slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  name: d.name,
  category: d.category,
  price: d.price,
  description: d.description,
  details: d.details,
  images: d.images.map(img),
  options: d.options,
  variants: buildVariants(d.id, d.options, d.stock),
  active: true,
  createdAt: days(d.created),
  sample: true,
}));
