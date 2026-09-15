-- Migration: 0004_create_product_vendor_listings.sql
-- Description: Create product_vendor_listings table and indexes

CREATE TABLE IF NOT EXISTS `product_vendor_listings` (
    `id` varchar(255) NOT NULL,
    `product_id` integer NOT NULL,
    `product_type` varchar(45) NOT NULL,
    `vendor_name` varchar(100) NOT NULL,
    `url` text NOT NULL,
    `price` decimal(12,2) DEFAULT NULL,
    `last_updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

CREATE INDEX IF NOT EXISTS idx_product_vendor_listings_product ON product_vendor_listings(product_id, product_type);
