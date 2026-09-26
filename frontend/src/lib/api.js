const API = import.meta.env.VITE_API_URL || '/api/v1';

const readCsrf = () => document.cookie.split('; ').find((c) => c.startsWith('csrfToken='))?.split('=')[1];

async function ensureCsrf() {
  if (!readCsrf()) await fetch(`${API}/auth/csrf`, { credentials: 'include' }).catch(() => {});
  return readCsrf() || '';
}

let refreshing = null;
async function refreshSession() {
  refreshing ??= (async () => {
    const res = await fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': await ensureCsrf() } });
    return res.ok;
  })().finally(() => setTimeout(() => (refreshing = null), 0));
  return refreshing;
}

export class ApiError extends Error {
  constructor(status, payload = {}) {
    super(payload.error?.message || 'The request could not be completed.');
    this.status = status;
    this.code = payload.error?.code;
    this.details = payload.error?.details;
    this.fieldErrors = { ...(payload.error?.details?.body?.fieldErrors || {}), ...(payload.error?.details?.fieldErrors || {}) };
  }
}

// JSON API helper: cookies, CSRF header, one silent refresh on expired access tokens.
export async function api(path, { body, method = body ? 'POST' : 'GET', raw, blob, headers, retry = true, ...rest } = {}) {
  const unsafe = method !== 'GET';
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(`${API}${path}`, {
    method,
    credentials: 'include',
    ...rest,
    headers: {
      ...(!isForm && body !== undefined && { 'Content-Type': 'application/json' }),
      ...(unsafe && { 'X-CSRF-Token': await ensureCsrf() }),
      ...headers,
    },
    body: body === undefined ? undefined : isForm || typeof body === 'string' ? body : JSON.stringify(body),
  });
  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    if (await refreshSession()) return api(path, { body, method, raw, blob, headers, retry: false, ...rest });
  }
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => ({})));
  if (res.status === 204) return null;
  if (blob) return res.blob();
  const json = await res.json();
  return raw ? json : json.data;
}

export const apiUrl = (path) => `${API}${path}`;

// Authenticated file download: fetch with the session, then hand the blob to the browser.
export async function download(path, filename) {
  const file = await api(path, { blob: true });
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const money = (value, currency = 'INR') =>
  value == null ? 'Price on Request' : new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export const date = (value, opts = { dateStyle: 'medium' }) => (value ? new Intl.DateTimeFormat('en-IN', opts).format(new Date(value)) : '');

const STATUS_LABELS = { payment_failed: 'payment not enabled' };

export const label = (s) => STATUS_LABELS[s] || String(s || '').replaceAll('_', ' ');

