const DEFAULT_CDN = 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev';

export function mediaUrl(path, env) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cdn = (env?.CDN_URL || env?.VITE_CDN_URL || DEFAULT_CDN).replace(/\/$/, '');
  const key = String(path).trim().replace(/^\//, '');
  return `${cdn}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function userResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role,
  };
}
