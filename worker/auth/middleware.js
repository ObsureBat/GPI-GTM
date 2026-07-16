import { readCookie } from './cookies.js';
import { verifyToken } from './jwt.js';

export async function getAuthUser(request, env) {
  const token = readCookie(request);
  return verifyToken(token, env);
}

export async function requireAuth(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return { error: json({ error: 'Unauthorized' }, 401) };
  return { user };
}

export async function requireRole(request, env, role) {
  const result = await requireAuth(request, env);
  if (result.error) return result;
  if (result.user.role !== role) {
    return { error: json({ error: 'Forbidden' }, 403) };
  }
  return result;
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export async function parseBody(request) {
  const ct = request.headers.get('Content-Type') || '';
  if (ct.includes('application/json')) {
    try {
      return await request.json();
    } catch {
      return null;
    }
  }
  return null;
}
