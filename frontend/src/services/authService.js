import { USE_MOCK, endpoints } from '../config';
import { api, ApiError } from './apiClient';
import { db, commit, delay, uid, logActivity } from './mock/db';

/* ----------------------------------------------------------------------------
   Real implementation (Spring Security). The server sets an httpOnly session
   cookie on login; nothing sensitive is stored by the frontend.
---------------------------------------------------------------------------- */
const real = {
  me: () => api.get(endpoints.me).catch((e) => (e.status === 401 ? null : Promise.reject(e))),
  login: (credentials) => api.post(endpoints.login, credentials),
  register: (data) => api.post(endpoints.register, data),
  logout: () => api.post(endpoints.logout),
  updateProfile: (data) => api.put(endpoints.me, data),
  // The server emails a 6-digit code; it never says whether the email has an account.
  forgotPassword: ({ email }) => api.post(endpoints.forgotPassword, { email }),
  resetPassword: ({ email, code, newPassword }) => api.post(endpoints.resetPassword, { email, code, newPassword }),
};

/* ----------------------------------------------------------------------------
   Development mode. Passwords are salted + hashed (never stored in plain text)
   but this is still NOT secure authentication: it all runs in the browser.
---------------------------------------------------------------------------- */
const SESSION_KEY = 'nailstudio.devsession';

async function hash(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new ApiError('Development sign-in needs a secure context (use http://localhost).');
  }
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const DEV_ACCOUNTS = [
  { label: 'Customer', email: 'demo.customer@example.com', password: 'Customer2024' },
  { label: 'Studio owner (admin)', email: 'owner@example.com', password: 'Owner2024' },
];

async function ensureSeedUsers() {
  const store = db();
  if (store.usersSeeded) return;
  const make = async (id, name, email, password, role, phone) => {
    const salt = uid('salt');
    return { id, name, email, phone, role, salt, passwordHash: await hash(password, salt), createdAt: new Date().toISOString() };
  };
  store.users.push(
    await make('usr_demo', 'Demo Customer', DEV_ACCOUNTS[0].email, DEV_ACCOUNTS[0].password, 'CUSTOMER', '9876543210'),
    await make('usr_owner', 'Studio Owner', DEV_ACCOUNTS[1].email, DEV_ACCOUNTS[1].password, 'ADMIN', '')
  );
  store.usersSeeded = true;
  commit();
}

const publicUser = (u) => (u ? { id: u.id, name: u.name, email: u.email, phone: u.phone || '', role: u.role } : null);

const mock = {
  async me() {
    await delay(120);
    await ensureSeedUsers();
    let id = null;
    try {
      id = sessionStorage.getItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    return publicUser(db().users.find((u) => u.id === id));
  },

  async login({ email, password }) {
    await delay();
    await ensureSeedUsers();
    const user = db().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || (await hash(password, user.salt)) !== user.passwordHash) {
      throw new ApiError('That email and password do not match.', { status: 401 });
    }
    sessionStorage.setItem(SESSION_KEY, user.id);
    return publicUser(user);
  },

  async register({ name, email, phone, password }) {
    await delay();
    await ensureSeedUsers();
    const store = db();
    if (store.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new ApiError('An account with this email already exists.', { status: 409, fieldErrors: { email: 'This email is already registered.' } });
    }
    const salt = uid('salt');
    const user = {
      id: uid('usr'),
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      role: 'CUSTOMER',
      salt,
      passwordHash: await hash(password, salt),
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    logActivity('account', `New account: ${user.name} (sample)`);
    commit();
    sessionStorage.setItem(SESSION_KEY, user.id);
    return publicUser(user);
  },

  async logout() {
    await delay(80);
    sessionStorage.removeItem(SESSION_KEY);
  },

  // Demo only: no email exists in this mode, so the code is shown on screen (devCode). Real mode never does this.
  async forgotPassword({ email }) {
    await delay();
    await ensureSeedUsers();
    const user = db().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return { message: 'If an account exists for that email, a 6-digit verification code has been sent.' };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    MOCK_CODES.set(user.email.toLowerCase(), { code, expires: Date.now() + 10 * 60e3, attempts: 0 });
    return { message: 'Demo mode: no email is sent.', devCode: code };
  },

  async resetPassword({ email, code, newPassword }) {
    await delay();
    await ensureSeedUsers();
    const key = email.trim().toLowerCase();
    const entry = MOCK_CODES.get(key);
    const bad = new ApiError('That code is not correct or has expired. Please check it or request a new one.', { status: 400 });
    if (!entry || entry.expires < Date.now() || entry.attempts >= 5) throw bad;
    entry.attempts += 1;
    if (entry.code !== String(code).trim()) throw bad;
    const user = db().users.find((u) => u.email.toLowerCase() === key);
    if (!user) throw bad;
    user.salt = uid('salt');
    user.passwordHash = await hash(newPassword, user.salt);
    commit();
    MOCK_CODES.delete(key);
    return { message: 'Your password has been changed. You can sign in now.' };
  },

  async updateProfile({ name, phone }) {
    await delay();
    const id = sessionStorage.getItem(SESSION_KEY);
    const user = db().users.find((u) => u.id === id);
    if (!user) throw new ApiError('Please sign in to continue.', { status: 401 });
    user.name = name.trim();
    user.phone = (phone || '').trim();
    commit();
    return publicUser(user);
  },
};

const MOCK_CODES = new Map();

export const authService = USE_MOCK ? mock : real;
