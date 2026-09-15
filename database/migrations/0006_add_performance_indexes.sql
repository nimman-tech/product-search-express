-- Migration: 0006_add_performance_indexes.sql
-- Description: Add performance indexes for cars, mobiles, and product vendor listings based on application query patterns

-- ============================================================================
-- Cars Table Indexes
-- ============================================================================

-- Fast range scans and ordering on launch year and price (used in default scan threshold & budget sorting)
CREATE INDEX IF NOT EXISTS idx_cars_year_price ON cars (year, price);

-- Fast filtering by make and model
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON cars (make, model);

-- Fast price range filtering
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars (price);

-- Fast filtering by body type and fuel type
CREATE INDEX IF NOT EXISTS idx_cars_body_fuel ON cars (body_type, fuel_type);

-- ============================================================================
-- Mobiles Table Indexes
-- ============================================================================

-- Fast range scans and ordering on launch year and price (used in default scan threshold & budget sorting)
CREATE INDEX IF NOT EXISTS idx_mobiles_year_price ON mobiles (year, price);

-- Fast filtering by make and model
CREATE INDEX IF NOT EXISTS idx_mobiles_make_model ON mobiles (make, model);

-- Fast price range filtering
CREATE INDEX IF NOT EXISTS idx_mobiles_price ON mobiles (price);

-- Fast specs filtering by RAM and storage
CREATE INDEX IF NOT EXISTS idx_mobiles_ram_storage ON mobiles (memory_ram, memory_storage);
