-- MySQL dump 10.13  Distrib 8.0.40, for macos14 (arm64)
--
-- Host: localhost    Database: products
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cars`
--

DROP TABLE IF EXISTS `cars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cars` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(135) NOT NULL,
  `make` varchar(45) NOT NULL,
  `model` varchar(45) NOT NULL,
  `variant` varchar(45) NOT NULL,
  `price` decimal(10,2) unsigned NOT NULL,
  `seats` tinyint unsigned NOT NULL,
  `year` smallint unsigned NOT NULL,
  `body_type` varchar(45) NOT NULL,
  `body_length` smallint unsigned NOT NULL COMMENT 'In mm',
  `body_width` smallint unsigned NOT NULL COMMENT 'In mm',
  `body_height` smallint unsigned NOT NULL COMMENT 'In mm',
  `body_wheel_base` smallint unsigned NOT NULL COMMENT 'In mm',
  `body_wheel_size` smallint unsigned NOT NULL COMMENT 'In mm',
  `body_ground_clearance` smallint unsigned NOT NULL COMMENT 'In mm',
  `transmission_type` varchar(45) NOT NULL,
  `transmission_gears` tinyint unsigned DEFAULT NULL,
  `safety_ncap` tinyint DEFAULT NULL,
  `safety_airbags` tinyint DEFAULT NULL,
  `engine_type` varchar(45) NOT NULL,
  `engine_displacement` decimal(4,1) NOT NULL,
  `engine_hp` smallint unsigned NOT NULL,
  `engine_torque` smallint unsigned NOT NULL,
  `engine_time0to100` tinyint unsigned NOT NULL,
  `fuel_type` varchar(45) NOT NULL,
  `kmpl_city` decimal(4,1) unsigned NOT NULL,
  `kmpl_highway` decimal(4,1) unsigned NOT NULL,
  `full_tank_drive_capacity` smallint unsigned NOT NULL,
  `drivetrain_type` varchar(3) NOT NULL,
  `feature_sunroof` tinyint(1) NOT NULL DEFAULT '0',
  `feature_ventilated_seats` tinyint(1) NOT NULL DEFAULT '0',
  `feature_wireless_charger` tinyint(1) NOT NULL DEFAULT '0',
  `feature_reverse_camera` tinyint(1) NOT NULL DEFAULT '0',
  `feature_view360` tinyint(1) NOT NULL DEFAULT '0',
  `feature_watch_connect` tinyint(1) NOT NULL DEFAULT '0',
  `infotainment_available` tinyint(1) NOT NULL DEFAULT '0',
  `infotainment_size` tinyint NOT NULL,
  `infotainment_android` tinyint(1) NOT NULL DEFAULT '0',
  `infotainment_apple` tinyint(1) NOT NULL DEFAULT '0',
  `aesthetic_noise` tinyint unsigned NOT NULL,
  `aesthetic_leg_space` smallint unsigned NOT NULL,
  `expense_ppk` tinyint unsigned NOT NULL,
  `expense_insurance` mediumint unsigned NOT NULL,
  `expense_service` mediumint unsigned NOT NULL,
  `expense_service_frequency` tinyint unsigned NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `last_updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=29201 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-16 22:22:03
