CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX product_name_trgm_idx ON "Product" USING gin (name gin_trgm_ops);
