-- products.versions definition

CREATE TABLE `versions` (
  `product_name` varchar(50) NOT NULL,
  `source` varchar(50) NOT NULL,
  `version` varchar(10) NOT NULL,
  PRIMARY KEY (`product_name`, `source`)
);
