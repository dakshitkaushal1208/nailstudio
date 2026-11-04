import { USE_MOCK, USE_REAL_GALLERY, endpoints, assetUrl } from '../config';
import { api } from './apiClient';
import { db, delay, copy } from './mock/db';
import { defaultGalleryCategories } from '../data/mockGallery';

/* ----------------------------------------------------------------------------
   Spring Boot gallery rows -> the shape the UI uses.

   Backend field   UI field
   id              id (string)
   displayOrder    order
   imageUrl        imageUrl (relative /uploads/... paths made absolute)
   active          active   (if the backend has no "active" column yet, the
   featured                  "featured" flag is used instead; see adminService)
---------------------------------------------------------------------------- */
export function fromBackend(row) {
  return {
    ...row,
    id: String(row.id),
    title: row.title || '',
    description: row.description || '',
    category: row.category || '',
    imageUrl: assetUrl(row.imageUrl || ''),
    active: row.active ?? row.featured ?? true,
    order: Number(row.displayOrder ?? row.order ?? 0) || 0,
  };
}

const byOrder = (a, b) => a.order - b.order || Number(a.id) - Number(b.id);

export async function fetchAllGallery() {
  const rows = await api.get(endpoints.gallery);
  return (Array.isArray(rows) ? rows : []).map(fromBackend).sort(byOrder);
}

// Standard categories first, then any custom ones found on entries.
// `withDefaults` keeps the standard list available in the admin even when
// the gallery is empty, so the first image can always be given a category.
export function galleryCategories(items, withDefaults) {
  const used = new Set(items.map((g) => g.category).filter(Boolean));
  const base = defaultGalleryCategories.filter((c) => withDefaults || used.has(c));
  return [...base, ...[...used].filter((c) => !base.includes(c))];
}

const backend = {
  async list({ category } = {}) {
    const all = await fetchAllGallery();
    return all.filter((g) => g.active && (!category || g.category === category));
  },
  async categories() {
    return galleryCategories((await fetchAllGallery()).filter((g) => g.active), false);
  },
};

const mock = {
  async list({ category } = {}) {
    await delay(140);
    return copy(
      db()
        .gallery.filter((g) => g.active && (!category || g.category === category))
        .sort((a, b) => a.order - b.order)
    );
  },
  async categories() {
    await delay(60);
    return [...db().galleryCategories];
  },
};

export const galleryService = USE_MOCK && !USE_REAL_GALLERY ? mock : backend;