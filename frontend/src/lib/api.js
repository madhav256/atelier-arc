const API = import.meta.env.VITE_API_URL || '/api/v1';

const csrf = () => document.cookie.split('; ').find((c) => c.startsWith('csrfToken='))?.split('=')[1];

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && !csrf()) await fetch(`${API}/auth/csrf`, { credentials: 'include' }).catch(() => {});
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(method !== 'GET' && { 'X-CSRF-Token': csrf() || '' }), ...options.headers },
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const error = new Error(payload.error?.message || 'The request could not be completed.');
    error.code = payload.error?.code;
    error.details = payload.error?.details;
    error.status = res.status;
    throw error;
  }
  return res.status === 204 ? null : res.json().then((x) => x.data);
}

export const money = (value, currency = 'INR') =>
  value == null ? 'Price on Request' : new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
