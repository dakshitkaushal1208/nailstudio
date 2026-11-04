import { USE_MOCK, endpoints } from '../config';
import { api } from './apiClient';
import { db, delay, copy } from './mock/db';

const real = {
  getSettings: () => api.get(endpoints.settings),
  listServices: () => api.get(endpoints.services),
  getService: (id) => api.get(`${endpoints.services}/${id}`),
};

const mock = {
  async getSettings() {
    await delay(80);
    return copy(db().settings);
  },
  async listServices() {
    await delay(120);
    return copy(db().services.filter((s) => s.active).sort((a, b) => a.order - b.order));
  },
  async getService(id) {
    await delay(80);
    const s = db().services.find((x) => x.id === id);
    return s ? copy(s) : null;
  },
};

export const studioService = USE_MOCK ? mock : real;
