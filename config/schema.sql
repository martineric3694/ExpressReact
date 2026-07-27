-- ============================================================
-- File: config/schema.sql
-- Jalankan: mysql -u root -p < config/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS express_mvc_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE express_mvc_db;

-- -------------------------------------------------------
-- Tabel users
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Tabel products
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          INT            NOT NULL AUTO_INCREMENT,
  name        VARCHAR(150)   NOT NULL,
  description TEXT,
  price       DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  stock       INT            NOT NULL DEFAULT 0,
  image_url   VARCHAR(500)   DEFAULT NULL,               -- URL gambar dari Cloudinary
  user_id     INT            NOT NULL,                   -- pemilik / yang input
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_products_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Migration: tambah kolom image_url jika belum ada
-- Jalankan query ini jika tabel products sudah ada:
-- ALTER TABLE products ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER stock;
-- -------------------------------------------------------

-- -------------------------------------------------------
-- Data awal: satu user admin (password: admin123)
-- Hash bcrypt dari "admin123"
-- -------------------------------------------------------
INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Admin', 'admin@example.com',
   '$2a$10$sEBf1eE6bWP1u4p1xaadweqhfyFZIALXq.LEgf5HWE16jYneAK3Fi',
   'admin');
