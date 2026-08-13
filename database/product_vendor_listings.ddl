CREATE TABLE `product_vendor_listings` (
    `id` varchar(255) NOT NULL,
    `product_id` varchar(255) NOT NULL,
    `product_type` varchar(45) NOT NULL,
    `vendor_name` varchar(100) NOT NULL,
    `url` text NOT NULL,
    `price` decimal(12,2) DEFAULT NULL,
    `last_updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

CREATE INDEX idx_product_vendor_listings_product ON product_vendor_listings(product_id, product_type);
