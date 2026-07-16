-- Admin dashboard extras (stock tracking + visitor counter)
ALTER TABLE products ADD COLUMN stock_qty INTEGER NOT NULL DEFAULT 100;

CREATE TABLE IF NOT EXISTS site_stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO site_stats (key, value) VALUES ('visitors', 0);
