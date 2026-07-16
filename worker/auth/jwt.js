import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'gpi_token';
const SESSION_MAX_AGE = 60 * 60 * 24; // 1 day default
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secretKey(env) {
  const secret = env.JWT_SECRET || 'dev-jwt-secret-change-in-production-min-32-chars';
  return new TextEncoder().encode(secret);
}

export async function signToken(user, env, rememberMe = false) {
  const maxAge = rememberMe ? REMEMBER_MAX_AGE : SESSION_MAX_AGE;
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secretKey(env));
}

export async function verifyToken(token, env) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(env));
    return {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME, REMEMBER_MAX_AGE, SESSION_MAX_AGE };
