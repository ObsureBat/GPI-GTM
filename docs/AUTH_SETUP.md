# Unified Authentication Setup (Cloudflare Free Tier)

This project uses **JWT + HttpOnly cookies** stored in **Cloudflare D1**, served by a **Cloudflare Worker**.

## Prerequisites

- Cloudflare account with D1 and R2 enabled
- Wrangler logged in: `npx wrangler login`
- Node.js 20+

## 1. Install dependencies

```bash
npm install
```

## 2. Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Signs auth tokens (min 32 chars) |
| `ADMIN_SEED_EMAIL` | First admin email |
| `ADMIN_SEED_PASSWORD` | First admin password |
| `CDN_URL` | R2 public CDN for images |

For production, set the secret in Cloudflare:

```bash
npx wrangler secret put JWT_SECRET
```

## 3. Apply D1 migrations

```bash
npm run db:migrate          # local D1
npm run db:migrate:remote   # production D1
```

## 4. Seed the admin user

Creates one admin in D1 (local + remote):

```bash
npm run db:seed-admin
```

Default credentials (change in `.env`):

- Email: `admin@gpipvtltd.com`
- Password: `GPIAdmin2026!`

## 5. Seed catalog (products + categories into D1)

```bash
npm run db:seed-catalog          # remote D1 (Cloudflare)
npm run db:seed-catalog:local    # local D1 only
```

Images resolve from the R2 public CDN (`CDN_URL` / `VITE_CDN_URL`).

## 6. Run locally (remote D1 + R2)

```bash
npm run dev
```

Open:

- Store: http://localhost:5173/
- Sign up: http://localhost:5173/sign-up
- Sign in: http://localhost:5173/sign-in
- Admin: http://localhost:5173/admin/dashboard (admin login required)

API routes are handled by the Cloudflare Worker (no Express proxy).

## 7. Deploy

```bash
npm run deploy
```

Re-attach your custom domain in Cloudflare when ready to go live.

## Auth API

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Create customer account |
| POST | `/api/auth/login` | Sign in (supports `rememberMe`) |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |

## Roles

| Role | Access |
|------|--------|
| `customer` | Checkout, store browsing |
| `admin` | `/admin/*` dashboard |

- Sign up always creates **customer** accounts
- Admins are seeded manually (no public admin registration)
- Admins and customers use the same **Sign In** page

## Troubleshooting

**401 on /api/auth/me** — Not signed in (expected when logged out).

**403 on /admin** — Signed in as customer; use admin credentials.

**Worker API not responding in dev** — Restart `npm run dev` after changing `wrangler.jsonc`.

**D1 migration failed on stock_qty** — Column may already exist; safe to ignore if `0002_admin_extras` was applied.
