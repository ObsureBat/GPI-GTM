import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { openDb, ensureSchema } from './db.js';
import { seedIfEmpty, seedData, getCatalogProducts } from './seed.js';
import { productsRouter } from './routes/products.js';
import { collectionsRouter } from './routes/collections.js';
import { cartRouter } from './routes/cart.js';
import { checkoutRouter } from './routes/checkout.js';
import { searchRouter } from './routes/search.js';
import { configRouter } from './routes/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 4000;

const db = openDb();
ensureSchema(db);
seedIfEmpty(db);

function catalogMatchesDb() {
  const catalog = getCatalogProducts();
  if (!catalog.length) return true;
  const rows = db.prepare('SELECT handle FROM products').all();
  if (rows.length !== catalog.length) return false;
  const dbHandles = new Set(rows.map((r) => r.handle));
  return catalog.every((p) => dbHandles.has(p.handle));
}

if (!catalogMatchesDb()) {
  console.log('[catalog] Syncing SQLite from Shopify CSV export…');
  seedData(db);
}

const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
console.log(`[catalog] ${productCount} products in store`);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.locals.db = db;

app.use('/api', configRouter);
app.use('/api/products', productsRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/search', searchRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});
