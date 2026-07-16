/**
 * Seed the first admin user into D1 (local + remote).
 * Usage: npm run db:seed-admin
 */
import { execSync } from 'node:child_process';
import bcrypt from 'bcryptjs';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

async function seed(target) {
  const env = loadEnv();
  const email = (process.env.ADMIN_SEED_EMAIL || env.ADMIN_SEED_EMAIL || 'admin@gpipvtltd.com').toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD || env.ADMIN_SEED_PASSWORD || 'GPIAdmin2026!';
  const name = process.env.ADMIN_SEED_NAME || env.ADMIN_SEED_NAME || 'GPI Admin';
  const hash = await bcrypt.hash(password, 10);

  const flag = target === 'remote' ? '--remote' : '--local';
  const check = execSync(
    `npx wrangler d1 execute gpi-store ${flag} --command "SELECT id FROM users WHERE email = '${email}'" --json`,
    { cwd: ROOT, encoding: 'utf8' }
  );
  const parsed = JSON.parse(check);
  const existing = parsed?.[0]?.results?.[0];
  if (existing) {
    console.log(`Admin already exists (${email}), skipping.`);
    return;
  }

  const sql = `INSERT INTO users (email, password_hash, full_name, role) VALUES ('${email}', '${hash}', '${name.replace(/'/g, "''")}', 'admin')`;
  execSync(`npx wrangler d1 execute gpi-store ${flag} --command "${sql}"`, {
    cwd: ROOT,
    stdio: 'inherit',
  });
  console.log(`Seeded admin: ${email} (${target})`);
}

const target = process.argv.includes('--remote') ? 'remote' : 'local';
await seed(target);
if (!process.argv.includes('--local-only')) {
  await seed('remote');
}
