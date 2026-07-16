import { COOKIE_NAME, REMEMBER_MAX_AGE, SESSION_MAX_AGE } from './jwt.js';

function isSecure(request) {
  const url = new URL(request.url);
  return url.protocol === 'https:';
}

export function readCookie(request, name = COOKIE_NAME) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function setAuthCookie(token, request, rememberMe = false) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
  ];
  if (isSecure(request)) parts.push('Secure');
  if (rememberMe) parts.push(`Max-Age=${REMEMBER_MAX_AGE}`);
  else parts.push(`Max-Age=${SESSION_MAX_AGE}`);
  return parts.join('; ');
}

export function clearAuthCookie(request) {
  const parts = [
    `${COOKIE_NAME}=`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isSecure(request)) parts.push('Secure');
  return parts.join('; ');
}
