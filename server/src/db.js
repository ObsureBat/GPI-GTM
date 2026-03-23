import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const dbPath = process.env.SQLITE_PATH || join(dataDir, 'store.db');

export function openDb() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function migrate(db) {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  db.exec(sql);
}

/** Create tables if this is a new database (does not drop existing data). */
export function ensureSchema(db) {
  const row = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='products'`)
    .get();
  if (!row) migrate(db);
}
