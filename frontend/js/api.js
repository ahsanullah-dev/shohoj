// Lightweight fetch wrapper around the Shohoj backend.
(function () {
  const BASE = (window.SHOHOJ_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  function token() {
    return localStorage.getItem('shohoj_token') || '';
  }
  function setSession(token, user) {
    if (token) localStorage.setItem('shohoj_token', token);
    if (user) localStorage.setItem('shohoj_user', JSON.stringify(user));
  }
  function currentUser() {
    try {
      return JSON.parse(localStorage.getItem('shohoj_user') || 'null');
    } catch {
      return null;
    }
  }
  function logout() {
    localStorage.removeItem('shohoj_token');
    localStorage.removeItem('shohoj_user');
  }

  async function request(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const t = token();
    if (t) headers['Authorization'] = 'Bearer ' + t;

    const body =
      opts.body && !(opts.body instanceof FormData) && typeof opts.body !== 'string'
        ? JSON.stringify(opts.body)
        : opts.body;

    const res = await fetch(BASE + path, { ...opts, headers, body });
    let data = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) data = await res.json();
    else data = await res.text();

    if (!res.ok) {
      const msg = (data && data.error) || res.statusText || 'Request failed';
      throw new Error(msg);
    }
    return data;
  }

  window.API = {
    BASE,
    token,
    setSession,
    currentUser,
    logout,
    get: (p) => request(p, { method: 'GET' }),
    post: (p, body) => request(p, { method: 'POST', body }),
    patch: (p, body) => request(p, { method: 'PATCH', body }),
    del: (p) => request(p, { method: 'DELETE' }),
    upload: (p, formData) => request(p, { method: 'POST', body: formData }),
  };
})();
