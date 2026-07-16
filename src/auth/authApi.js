const base = '';

async function authFetch(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'Request failed');
    err.errors = data.errors;
    throw err;
  }
  return data;
}

export const authApi = {
  signup: (body) => authFetch('/api/auth/signup', { method: 'POST', body }),
  login: (body) => authFetch('/api/auth/login', { method: 'POST', body }),
  logout: () => authFetch('/api/auth/logout', { method: 'POST', body: {} }),
  me: () => authFetch('/api/auth/me'),
};
