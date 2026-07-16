/**
 * Upload local images to Cloudflare R2 (gpi-assets bucket).
 *
 * Structure:
 *   products/   — product photos (from public/products/)
 *   banners/    — hero images + logo (from public/banners/)
 *   categories/ — placeholder for future category art
 *
 * Usage:
 *   npm run r2:sync
 *   npm run r2:setup   (create bucket + public URL + upload)
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const ROOT = join(__dirname, '..');
const BUCKET = 'gpi-assets';
const PUBLIC_DIR = join(ROOT, 'public');

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

function ensureBannersLocal() {
  const bannersDir = join(PUBLIC_DIR, 'banners');
  mkdirSync(bannersDir, { recursive: true });

  const copies = [
    [join(PUBLIC_DIR, 'hero', 'gtm-hero.png'), join(bannersDir, 'gtm-hero.png')],
    [join(PUBLIC_DIR, 'hero', 'gpi-hero.png'), join(bannersDir, 'gpi-hero.png')],
    [join(PUBLIC_DIR, 'products', 'GPI Logo.png'), join(bannersDir, 'gpi-logo.png')],
  ];

  for (const [src, dest] of copies) {
    if (existsSync(src) && !existsSync(dest)) {
      copyFileSync(src, dest);
      console.log(`Copied ${basename(src)} → banners/${basename(dest)}`);
    }
  }
}

function listImages(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => extname(f).toLowerCase() in MIME);
}

function uploadFile(localPath, r2Key) {
  const ext = extname(localPath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const file = localPath.replace(/\\/g, '/');
  const key = r2Key.replace(/\\/g, '/');
  run(
    `npx wrangler r2 object put ${BUCKET}/${key} --file="${file}" --content-type="${type}" --remote`
  );
}

function writeEnvCdnUrl(publicUrl) {
  const envPath = join(ROOT, '.env');
  const line = `VITE_CDN_URL=${publicUrl.replace(/\/$/, '')}`;
  let content = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
  if (/^VITE_CDN_URL=/m.test(content)) {
    content = content.replace(/^VITE_CDN_URL=.*$/m, line);
  } else {
    content = content.trimEnd() + (content ? '\n' : '') + line + '\n';
  }
  writeFileSync(envPath, content);
  console.log(`\nWrote ${line} to .env`);
}

function getPublicDevUrl() {
  try {
    const out = execSync(`npx wrangler r2 bucket dev-url get ${BUCKET}`, {
      cwd: ROOT,
      encoding: 'utf8',
    });
    const match = out.match(/https:\/\/[^\s]+/);
    return match ? match[0].replace(/\/$/, '') : null;
  } catch {
    return null;
  }
}

async function main() {
  const setup = process.argv.includes('--setup');

  ensureBannersLocal();

  if (setup) {
    try {
      run(`npx wrangler r2 bucket create ${BUCKET}`);
    } catch {
      console.log('Bucket may already exist, continuing…');
    }
    try {
      run(`npx wrangler r2 bucket cors set ${BUCKET} --file=scripts/r2-cors.json`);
    } catch (e) {
      console.warn('CORS setup skipped:', e.message);
    }
    try {
      run(`npx wrangler r2 bucket dev-url enable ${BUCKET}`);
    } catch {
      console.log('Public dev URL may already be enabled.');
    }
  }

  const uploads = [];

  for (const file of listImages(join(PUBLIC_DIR, 'products'))) {
    uploads.push([join(PUBLIC_DIR, 'products', file), `products/${file}`]);
  }

  for (const file of listImages(join(PUBLIC_DIR, 'banners'))) {
    uploads.push([join(PUBLIC_DIR, 'banners', file), `banners/${file}`]);
  }

  mkdirSync(join(PUBLIC_DIR, 'categories'), { recursive: true });
  const placeholder = join(PUBLIC_DIR, 'categories', '.keep');
  if (!existsSync(placeholder)) writeFileSync(placeholder, '');
  uploads.push([placeholder, 'categories/.keep']);

  console.log(`\nUploading ${uploads.length} objects to R2 bucket "${BUCKET}"…\n`);

  for (const [local, key] of uploads) {
    uploadFile(local, key);
  }

  const publicUrl = getPublicDevUrl();
  if (publicUrl) {
    writeEnvCdnUrl(publicUrl);
    console.log(`\nPublic CDN URL: ${publicUrl}`);
    console.log('Example: ' + publicUrl + '/products/GPI%20Black%20Salt%201Kg.png');
  } else if (setup) {
    console.log('\nEnable public access: npx wrangler r2 bucket dev-url enable gpi-assets');
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
