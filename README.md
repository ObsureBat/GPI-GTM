# GPI E‑commerce (Node + React + SQLite)

Standalone storefront modeled after your Shopify theme (GPI Industries — salts, spices, essentials).

- **Server:** Express REST API, **SQLite** (`server/data/store.db`), cookie‑based cart
- **Client:** React (Vite), shop pages, cart, checkout (orders saved in SQL — add a payment provider for production)

## What you need to run locally

- [Node.js](https://nodejs.org/) 18+ (includes npm)
- On Windows, `better-sqlite3` may need **Visual Studio Build Tools** (C++) if `npm install` fails; install “Desktop development with C++” from Visual Studio Installer, then retry.

## Commands (run these yourself)

Open PowerShell or Command Prompt and run:

```powershell
cd d:\GPI\ecommerce-app
npm install
```

Start **API + React dev** together (recommended):

```powershell
npm run dev
```

Then open **http://localhost:5173** (Vite proxies `/api` to the API on port **4000**).

- First server start creates the DB and **seeds products** if the catalog is empty.
- To **reset** the catalog and re‑import everything:

```powershell
npm run db:seed
```

### Production-style run (single port)

Build the client, then start the server (serves API + static UI):

```powershell
npm run build
npm start
```

Open **http://localhost:4000** (or set `PORT`).

Optional env:

- `SQLITE_PATH` — path to the SQLite file (default: `server/data/store.db`)
- `CLIENT_ORIGIN` — CORS origin if the API is on another host

## Project layout

| Path | Role |
|------|------|
| `server/src` | Express app, routes, SQLite schema & seed |
| `client/src` | React UI (home, collections, product, cart, checkout) |

Your original Shopify theme files stay in `d:\GPI` (Liquid); this app is under `d:\GPI\ecommerce-app`.
