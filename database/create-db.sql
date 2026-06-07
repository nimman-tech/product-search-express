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
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `make` varchar(135) NOT NULL,
  `model` varchar(135) NOT NULL,
  `variant` varchar(45) NOT NULL,
  `price` REAL NOT NULL,
  `seats` INTEGER NOT NULL,
  `year` INTEGER NOT NULL,
  `body_type` varchar(45) NOT NULL,
  `body_length` INTEGER NOT NULL,
  `body_width` INTEGER NOT NULL,
  `body_height` INTEGER NOT NULL,
  `body_wheel_base` INTEGER NOT NULL,
  `body_wheel_size` INTEGER NOT NULL,
  `body_ground_clearance` INTEGER NOT NULL,
  `transmission_type` varchar(45) NOT NULL,
  `transmission_gears` INTEGER,
  `safety_ncap` INTEGER,
  `safety_airbags` INTEGER,
  `engine_type` varchar(45) NOT NULL,
  `engine_displacement` REAL NOT NULL,
  `engine_hp` INTEGER NOT NULL,
  `engine_torque` INTEGER NOT NULL,
  `engine_time0to100` INTEGER NOT NULL,
  `fuel_type` varchar(45) NOT NULL,
  `kmpl_city` REAL NOT NULL,
  `kmpl_highway` REAL NOT NULL,
  `full_tank_drive_capacity` INTEGER NOT NULL,
  `drivetrain_type` varchar(45) NOT NULL,
  `feature_sunroof` INTEGER NOT NULL DEFAULT 0,
  `feature_ventilated_seats` INTEGER NOT NULL DEFAULT 0,
  `feature_wireless_charger` INTEGER NOT NULL DEFAULT 0,
  `feature_reverse_camera` INTEGER NOT NULL DEFAULT 0,
  `feature_view360` INTEGER NOT NULL DEFAULT 0,
  `feature_watch_connect` INTEGER NOT NULL DEFAULT 0,
  `infotainment_available` INTEGER NOT NULL DEFAULT 0,
  `infotainment_size` INTEGER NOT NULL,
  `infotainment_android` INTEGER NOT NULL DEFAULT 0,
  `infotainment_apple` INTEGER NOT NULL DEFAULT 0,
  `aesthetic_noise` INTEGER NOT NULL,
  `aesthetic_leg_space` INTEGER NOT NULL,
  `expense_ppk INTEGER` NOT NULL,
  `expense_insurance` INTEGER NOT NULL,
  `expense_service` INTEGER NOT NULL,
  `expense_service_frequency` INTEGER NOT NULL,
  `url` varchar(255),
  `mrp` integer NOT NULL,
  `last_updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `validation_status` varchar(45) NOT NULL,
  `version` varchar(45) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

--
-- Table structure for table `mobiles`
--

DROP TABLE IF EXISTS `mobiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobiles` (
    `id` varchar(255) NOT NULL,
    `name` varchar(135) NOT NULL,
    `make` varchar(45) NOT NULL,
    `model` varchar(45) NOT NULL,
    `variant` varchar(45) NOT NULL,
    `year` integer NOT NULL,
    `price` integer NOT NULL,
    `mrp` decimal(10,2) DEFAULT NULL,
    `url` varchar(255) DEFAULT NULL,
    `official_buy_url` varchar(255) DEFAULT NULL,
    `value_for_money` decimal(2,1),
    `after_sales_service` decimal(2,1),
    `battery_life_usage` integer NOT NULL,
    `battery_life_standby` integer NOT NULL,
    `battery_life_talk_time` integer NOT NULL,
    `battery_life_gaming` integer NOT NULL,
    `battery_life_video_playback` integer NOT NULL,
    `battery_capacity` integer NOT NULL,
    `battery_charging_wired` integer NOT NULL,
    `battery_charging_wireless` integer NOT NULL,
    `battery_reverse_charging` integer NOT NULL DEFAULT 0,
    `battery_removable` integer NOT NULL DEFAULT 0,
    `battery_charging_time_wired` integer NOT NULL,
    `battery_charging_time_wireless` integer NOT NULL DEFAULT 0,
    `cameras_main_megapixel` integer NOT NULL,
    `cameras_main_aperture` varchar(45) NOT NULL,
    `cameras_main_focal_length` integer NOT NULL,
    `cameras_main_optical_zoom` integer NOT NULL,
    `cameras_main_digital_zoom` integer NOT NULL,
    `cameras_front_megapixel` integer NOT NULL,
    `cameras_front_focal_length` integer NOT NULL,
    `cameras_front_type` varchar(45) NOT NULL,
    `cameras_front_aperture` varchar(45) NOT NULL,
    `connectivity_sim_count` integer NOT NULL,
    `features_face_unlock` integer NOT NULL DEFAULT 0,
    `features_fingerprint_sensor` integer NOT NULL DEFAULT 0,
    `features_always_on_display` integer NOT NULL DEFAULT 0,
    `features_de_x_support` integer NOT NULL DEFAULT 0,
    `features_stylus_support` integer NOT NULL DEFAULT 0,
    `features_fast_charging` integer NOT NULL DEFAULT 0,
    `features_reverse_charging` integer NOT NULL DEFAULT 0,
    `features_audio_jack` integer NOT NULL DEFAULT 0,
    `features_stereo_speakers` integer NOT NULL DEFAULT 0,
    `features_hi_res_audio` integer NOT NULL DEFAULT 0,
    `features_gps` integer NOT NULL DEFAULT 0,
    `features_nfc` integer NOT NULL DEFAULT 0,
    `features_infrared` integer NOT NULL DEFAULT 0,
    `features_support5g` integer NOT NULL DEFAULT 0,
    `features_wifi` integer NOT NULL DEFAULT 0,
    `features_bluetooth` integer NOT NULL DEFAULT 0,
    `features_usb` integer NOT NULL DEFAULT 0,
    `features_water_resistance` integer NOT NULL DEFAULT 0,
    `features_e_sim` integer NOT NULL DEFAULT 0,
    `display_type` varchar(45) NOT NULL,
    `display_size` integer NOT NULL,
    `display_resolution_width` integer NOT NULL,
    `display_resolution_height` integer NOT NULL,
    `display_refresh_rate` integer NOT NULL,
    `display_brightness` integer NOT NULL,
    `dimensions_height` integer NOT NULL,
    `dimensions_width` integer NOT NULL,
    `dimensions_thickness` integer NOT NULL,
    `dimensions_weight` integer NOT NULL,
    `display_screen_to_body_ratio` integer NOT NULL,
    `error_message` varchar(255) NOT NULL,
    `platform_os` varchar(45) NOT NULL,
    `platform_os_version` varchar(10) NOT NULL,
    `memory_ram` integer NOT NULL,
    `mrp` integer NOT NULL,
    `memory_storage` integer NOT NULL,
    `memory_expandable` integer NOT NULL DEFAULT 0,
    `memory_storage_type` varchar(45) NOT NULL,
    `official_buy_url` varchar(45) NOT NULL,
    `validation_status` varchar(45) NOT NULL,
    `version` varchar(45) NOT NULL,
    `last_updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-16 22:22:03


