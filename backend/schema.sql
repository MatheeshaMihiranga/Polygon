-- ============================================================
-- Employee Task Management Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS employee_task_db;
USE employee_task_db;

-- ------------------------------------------------------------
-- Users Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  department  VARCHAR(255),
  phone       VARCHAR(20),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Tasks Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
  priority    ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  assigned_to INT,
  created_by  INT NOT NULL,
  due_date    DATE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE CASCADE
);
