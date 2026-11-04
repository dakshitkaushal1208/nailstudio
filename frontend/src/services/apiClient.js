import { API_BASE_URL } from '../config';

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const DEFAULT_TIMEOUT_MS = 20000;
const UPLOAD_TIMEOUT_MS = 60000;

const buildUrl = (path, params) => {
  const url = new URL(API_BASE_URL + path);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  return url.toString();
};

const FALLBACK = {
  401: 'Please sign in to continue.',
  403: 'You do not have permission to do that.',
  404: 'We could not find what you were looking for.',
  408: 'The server took too long to respond. Please try again.',
  413: 'That file is too large for the server.',
};

async function request(method, path, { body, params, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  // Every request has a deadline, so a stalled server can never leave the UI spinning.
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    const headers = { Accept: 'application/json' };
    // JSON bodies get a Content-Type. FormData must not: the browser adds
    // "multipart/form-data; boundary=..." itself.
    if (body && !isForm) headers['Content-Type'] = 'application/json';

    const res = await fetch(buildUrl(path, params), {
      method,
      signal: controller.signal,
      // Session lives in an httpOnly cookie set by the server; the browser
      // attaches it, and no token is ever kept in JavaScript-readable storage.
      credentials: 'include',
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });

    let payload = null;
    if (res.status !== 204) {
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }
    }

    if (!res.ok) {
      // Spring handlers in this project answer { "error": "..." }; Spring's own
      // error page uses { "message": "..." }. Accept both.
      const serverMessage = payload?.message || (res.status < 500 ? payload?.error : '');
      throw new ApiError(serverMessage || FALLBACK[res.status] || 'Something went wrong on our side. Please try again.', {
        status: res.status,
        fieldErrors: payload?.errors || {},
      });
    }
    return payload;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (timedOut) throw new ApiError(FALLBACK[408], { status: 408 });
    if (err.name === 'AbortError') throw err;
    throw new ApiError('We could not reach the studio server. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  del: (path, opts) => request('DELETE', path, opts),
  upload: (path, formData, opts) => request('POST', path, { timeoutMs: UPLOAD_TIMEOUT_MS, ...opts, body: formData }),
};