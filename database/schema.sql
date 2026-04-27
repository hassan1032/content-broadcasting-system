CREATE DATABASE IF NOT EXISTS content_broadcasting;
USE content_broadcasting;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('principal', 'teacher') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_slots (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  subject VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  subject VARCHAR(80) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  uploaded_by BIGINT UNSIGNED NOT NULL,
  status ENUM('uploaded', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT NULL,
  approved_by BIGINT UNSIGNED NULL,
  approved_at TIMESTAMP NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_content_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id),
  CONSTRAINT fk_content_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
  INDEX idx_content_live (uploaded_by, subject, status, start_time, end_time),
  INDEX idx_content_status (status)
);

CREATE TABLE IF NOT EXISTS content_schedule (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  content_id BIGINT UNSIGNED NOT NULL UNIQUE,
  slot_id BIGINT UNSIGNED NOT NULL,
  rotation_order INT UNSIGNED NOT NULL,
  duration_minutes INT UNSIGNED NOT NULL DEFAULT 5,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedule_content FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  CONSTRAINT fk_schedule_slot FOREIGN KEY (slot_id) REFERENCES content_slots(id),
  INDEX idx_schedule_slot_order (slot_id, rotation_order)
);
