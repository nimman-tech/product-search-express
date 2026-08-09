CREATE TABLE `product_purchase_urls` (
    `id` varchar(255) NOT NULL,
    `product_id` integer NOT NULL,
    `product_type` varchar(45) NOT NULL,
    `vendor_name` varchar(100) NOT NULL,
    `url` text NOT NULL,
    `last_updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

CREATE INDEX idx_product_purchase_urls_product ON product_purchase_urls(product_id, product_type);
