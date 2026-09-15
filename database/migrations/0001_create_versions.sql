-- Migration: 0001_create_versions.sql
-- Description: Create versions tracking table

CREATE TABLE IF NOT EXISTS `versions` (
  `product_name` varchar(50) NOT NULL,
  `source` varchar(50) NOT NULL,
  `version` varchar(10) NOT NULL,
  PRIMARY KEY (`product_name`, `source`)
);
