import { hashPassword, verifyPassword } from '../auth/password.js';
import { signToken } from '../auth/jwt.js';
import { clearAuthCookie, setAuthCookie } from '../auth/cookies.js';
import { getAuthUser, json, parseBody } from '../auth/middleware.js';
import { userResponse } from '../utils.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignup(body) {
  const errors = {};
  if (!body?.name?.trim()) errors.name = 'Full name is required';
  if (!body?.email?.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(body.email.trim())) errors.email = 'Invalid email address';
  if (!body?.password) errors.password = 'Password is required';
  else if (body.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (body?.password !== body?.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}

function validateLogin(body) {
  const errors = {};
  if (!body?.email?.trim()) errors.email = 'Email is required';
  if (!body?.password) errors.password = 'Password is required';
  return errors;
}

export async function handleAuth(request, env, pathname) {
  const method = request.method;

  if (pathname === '/api/auth/signup' && method === 'POST') {
    const body = await parseBody(request);
    const errors = validateSignup(body);
    if (Object.keys(errors).length) return json({ error: 'Validation failed', errors }, 400);

    const email = body.email.trim().toLowerCase();
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();
    if (existing) return json({ error: 'Email already registered' }, 409);

    const password_hash = await hashPassword(body.password);
    const result = await env.DB.prepare(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES (?, ?, ?, 'customer')`
    )
      .bind(email, password_hash, body.name.trim())
      .run();

    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    const token = await signToken(user, env, true);
    return json(
      { user: userResponse(user), message: 'Account created successfully' },
      201,
      { 'Set-Cookie': setAuthCookie(token, request, true) }
    );
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await parseBody(request);
    const errors = validateLogin(body);
    if (Object.keys(errors).length) return json({ error: 'Validation failed', errors }, 400);

    const email = body.email.trim().toLowerCase();
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user || !(await verifyPassword(body.password, user.password_hash))) {
      return json({ error: 'Invalid email or password' }, 401);
    }

    const rememberMe = !!body.rememberMe;
    const token = await signToken(user, env, rememberMe);
    return json(
      { user: userResponse(user), message: 'Signed in successfully' },
      200,
      { 'Set-Cookie': setAuthCookie(token, request, rememberMe) }
    );
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    return json({ ok: true, message: 'Signed out' }, 200, {
      'Set-Cookie': clearAuthCookie(request),
    });
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    const auth = await getAuthUser(request, env);
    if (!auth) return json({ error: 'Unauthorized' }, 401);

    const user = await env.DB.prepare(
      'SELECT id, email, full_name, role FROM users WHERE id = ?'
    )
      .bind(auth.id)
      .first();
    if (!user) return json({ error: 'Unauthorized' }, 401);
    return json({ user: userResponse(user) });
  }

  return null;
}
