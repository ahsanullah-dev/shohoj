// In dev, use relative /api (proxied by Vite to bypass CORS).
// In production on Vercel, point directly to Render backend.
const API_BASE = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || 'https://shohoj-api.onrender.com').replace(/\/$/, '');

export function resolveImageUrl(img) {
  if (!img) return '';
  if (typeof img === 'object' && img.url) return img.url;
  if (typeof img === 'string') {
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    return `https://shohoj-api.onrender.com${img.startsWith('/') ? '' : '/'}${img}`;
  }
  return '';
}

function getToken() {
  return localStorage.getItem('shohoj_token') || '';
}

export function setSession(token, user) {
  if (token) localStorage.setItem('shohoj_token', token);
  if (user) localStorage.setItem('shohoj_user', JSON.stringify(user));
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('shohoj_user') || 'null');
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('shohoj_token');
  localStorage.removeItem('shohoj_user');
}

export async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const body =
    options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body,
  });

  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg = (data && data.error) || res.statusText || 'Request failed';
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path, opts) => apiRequest(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => apiRequest(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => apiRequest(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => apiRequest(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => apiRequest(path, { ...opts, method: 'DELETE' }),
  upload: async (file) => {
    const fd = new FormData();
    fd.append('images', file);
    const res = await apiRequest('/api/uploads/images', { method: 'POST', body: fd });
    return res.images && res.images[0] ? res.images[0] : res;
  },
  uploadAvatar: async (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    const res = await apiRequest('/api/uploads/avatar', { method: 'POST', body: fd });
    return res.image || res;
  }
};
