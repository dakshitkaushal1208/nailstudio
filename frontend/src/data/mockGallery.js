import { sampleImage as img } from './assets';

// Categories are configuration, not code: the admin can edit them.
export const defaultGalleryCategories = ['French', 'Minimal', 'Floral', 'Chrome', 'Glam', 'Press-on Sets'];

// Sample entries only. `sample: true` marks artwork that is not the studio's
// own work so the UI can say so while in development.
export const seedGallery = [
  { id: 'gal_01', imageUrl: img('g01-soft-french'), title: 'Soft French', category: 'French', description: 'A sheer milky base with a fine, hand-painted white edge.', order: 1, active: true, sample: true },
  { id: 'gal_04', imageUrl: img('g04-liquid-gold'), title: 'Liquid Gold', category: 'Chrome', description: 'Gold chrome pressed over a warm sheer base.', order: 2, active: true, sample: true },
  { id: 'gal_03', imageUrl: img('g03-garden'), title: 'Garden Party', category: 'Floral', description: 'Tiny hand-painted blossoms on an ivory ground.', order: 3, active: true, sample: true },
  { id: 'gal_02', imageUrl: img('g02-quiet-nude'), title: 'Quiet Nude', category: 'Minimal', description: 'A single, even rose-beige wash. Nothing more.', order: 4, active: true, sample: true },
  { id: 'gal_05', imageUrl: img('g05-rosette'), title: 'Rosette', category: 'Glam', description: 'Gold flecks and a single pearl accent per hand.', order: 5, active: true, sample: true },
  { id: 'gal_07', imageUrl: img('g07-coffin-french'), title: 'Coffin French', category: 'French', description: 'The classic French line, cut long and clean.', order: 6, active: true, sample: true },
  { id: 'gal_12', imageUrl: img('g12-pressons'), title: 'Rose Dust Set', category: 'Press-on Sets', description: 'A ready-to-wear set in dusty rose.', order: 7, active: true, sample: true },
  { id: 'gal_06', imageUrl: img('g06-flatlay'), title: 'Cocoa Square', category: 'Minimal', description: 'Short squared nails in a deep milk-chocolate gel.', order: 8, active: true, sample: true },
  { id: 'gal_08', imageUrl: img('g08-mirror'), title: 'Mirror Finish', category: 'Chrome', description: 'A high-shine champagne chrome.', order: 9, active: true, sample: true },
  { id: 'gal_09', imageUrl: img('g09-short-bloom'), title: 'Short Bloom', category: 'Floral', description: 'Short, practical, and in flower.', order: 10, active: true, sample: true },
  { id: 'gal_10', imageUrl: img('g10-milk'), title: 'Milk Bath', category: 'Minimal', description: 'Opaque ivory on an oval shape.', order: 11, active: true, sample: true },
  { id: 'gal_11', imageUrl: img('g11-candlelight'), title: 'Candlelight', category: 'Glam', description: 'Warm crystal-set nails made for evenings.', order: 12, active: true, sample: true },
];
