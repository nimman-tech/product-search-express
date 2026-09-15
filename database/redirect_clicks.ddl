CREATE TABLE IF NOT EXISTS `redirect_clicks` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `product_id` varchar(255) DEFAULT NULL,
    `product_type` varchar(45) DEFAULT NULL,
    `vendor` varchar(100) DEFAULT NULL,
    `target_url` text NOT NULL,
    `monetized_url` text NOT NULL,
    `subid` varchar(100) DEFAULT NULL,
    `referrer` text DEFAULT NULL,
    `user_agent` text DEFAULT NULL,
    `ip_address` varchar(100) DEFAULT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_redirect_clicks_created_at ON redirect_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_redirect_clicks_product ON redirect_clicks(product_type, product_id);
CREATE INDEX IF NOT EXISTS idx_redirect_clicks_subid ON redirect_clicks(subid);
