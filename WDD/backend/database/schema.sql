CREATE DATABASE IF NOT EXISTS `wdd_store`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `wdd_store`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username_key` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(60) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(40) NOT NULL DEFAULT 'customer',
  `address` VARCHAR(255) NOT NULL DEFAULT '',
  `city` VARCHAR(120) NOT NULL DEFAULT '',
  `zip_code` VARCHAR(40) NOT NULL DEFAULT '',
  `added_by` VARCHAR(191) NOT NULL DEFAULT '',
  `registered_at` DATETIME NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username_key` (`username_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `profiles` (
  `username_key` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL DEFAULT '',
  `email` VARCHAR(255) NOT NULL DEFAULT '',
  `phone` VARCHAR(60) NOT NULL DEFAULT '',
  `address` VARCHAR(255) NOT NULL DEFAULT '',
  `city` VARCHAR(120) NOT NULL DEFAULT '',
  `zip_code` VARCHAR(40) NOT NULL DEFAULT '',
  `image` TEXT NOT NULL,
  `role` VARCHAR(40) NOT NULL DEFAULT '',
  `updated_at` DATETIME NOT NULL,
  `row_updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`username_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_products` (
  `product_id` VARCHAR(191) NOT NULL,
  `product_json` LONGTEXT NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `catalog_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` VARCHAR(191) NOT NULL,
  `source_group` VARCHAR(80) NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  `gender` VARCHAR(60) NOT NULL DEFAULT '',
  `type` VARCHAR(80) NOT NULL DEFAULT '',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `product_json` LONGTEXT NOT NULL,
  `seeded_at` DATETIME NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_catalog_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `removed_base_products` (
  `product_id` VARCHAR(191) NOT NULL,
  `removed_at` DATETIME NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` VARCHAR(40) NOT NULL,
  `order_seq` INT UNSIGNED NOT NULL,
  `role` VARCHAR(40) NOT NULL DEFAULT 'customer',
  `username` VARCHAR(191) NOT NULL DEFAULT '',
  `status` VARCHAR(40) NOT NULL DEFAULT 'Pending',
  `customer_name` VARCHAR(191) NOT NULL DEFAULT '',
  `customer_email` VARCHAR(255) NOT NULL DEFAULT '',
  `customer_phone` VARCHAR(60) NOT NULL DEFAULT '',
  `customer_address` VARCHAR(255) NOT NULL DEFAULT '',
  `customer_city` VARCHAR(120) NOT NULL DEFAULT '',
  `customer_zip_code` VARCHAR(40) NOT NULL DEFAULT '',
  `subtotal_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `shipping_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `item_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uq_orders_seq` (`order_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` VARCHAR(40) NOT NULL,
  `line_no` INT UNSIGNED NOT NULL DEFAULT 1,
  `product_id` VARCHAR(191) NOT NULL DEFAULT '',
  `product_name` VARCHAR(255) NOT NULL DEFAULT '',
  `product_brand` VARCHAR(120) NOT NULL DEFAULT '',
  `size` VARCHAR(60) NOT NULL DEFAULT '',
  `color` VARCHAR(60) NOT NULL DEFAULT '',
  `qty` INT UNSIGNED NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `line_total` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cart_items` (
  `username_key` VARCHAR(191) NOT NULL,
  `item_key` VARCHAR(255) NOT NULL,
  `product_id` VARCHAR(191) NOT NULL,
  `qty` INT UNSIGNED NOT NULL DEFAULT 1,
  `size` VARCHAR(60) NOT NULL DEFAULT '',
  `color` VARCHAR(60) NOT NULL DEFAULT '',
  `added_at` DATETIME NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`username_key`, `item_key`),
  KEY `idx_cart_items_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wishlist_items` (
  `username_key` VARCHAR(191) NOT NULL,
  `product_id` VARCHAR(191) NOT NULL,
  `added_at` DATETIME NOT NULL,
  PRIMARY KEY (`username_key`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `messages` (
  `message_id` VARCHAR(80) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `app_meta` (
  `meta_key` VARCHAR(120) NOT NULL,
  `meta_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`meta_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
