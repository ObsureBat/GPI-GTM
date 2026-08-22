-- Add optional GTIN, MPN, and Google Product Category fields for Google Merchant Center feed compatibility
ALTER TABLE products ADD COLUMN gtin TEXT;
ALTER TABLE products ADD COLUMN mpn TEXT;
ALTER TABLE products ADD COLUMN google_product_category TEXT;
