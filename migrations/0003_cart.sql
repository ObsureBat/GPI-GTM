-- Guest cart sessions (D1 / Worker API)
CREATE TABLE IF NOT EXISTS cart_sessions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cart_items (
  session_id TEXT NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (session_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
