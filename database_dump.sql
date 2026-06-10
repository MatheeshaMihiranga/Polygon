-- ============================================================
-- Employee Task Management Database - Complete SQL Dump
-- ============================================================
-- Generated: 2026-06-10
-- Database: employee_task_db
-- MySQL Version: 8.0+
-- ============================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ============================================================
-- Create Database
-- ============================================================
DROP DATABASE IF EXISTS `employee_task_db`;
CREATE DATABASE `employee_task_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `employee_task_db`;

-- ============================================================
-- Table structure for `users`
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','employee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'employee',
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table structure for `tasks`
-- ============================================================
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','in_progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `priority` enum('low','medium','high') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `assigned_to` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Dump of data for table `users`
-- ============================================================
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `department`, `phone`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@company.com', '$2b$10$YourHashedPasswordHere123456789', 'admin', 'Management', '555-0001', '2026-06-01 10:00:00', '2026-06-01 10:00:00'),
(2, 'John Doe', 'john@company.com', '$2b$10$YourHashedPasswordHere123456789', 'employee', 'Development', '555-0002', '2026-06-01 10:00:00', '2026-06-01 10:00:00'),
(3, 'Jane Smith', 'jane@company.com', '$2b$10$YourHashedPasswordHere123456789', 'employee', 'Design', '555-0003', '2026-06-01 10:00:00', '2026-06-01 10:00:00'),
(4, 'Bob Johnson', 'bob@company.com', '$2b$10$YourHashedPasswordHere123456789', 'employee', 'QA', '555-0004', '2026-06-01 10:00:00', '2026-06-01 10:00:00');

-- ============================================================
-- Dump of data for table `tasks`
-- ============================================================
INSERT INTO `tasks` (`id`, `title`, `description`, `status`, `priority`, `assigned_to`, `created_by`, `due_date`, `created_at`, `updated_at`) VALUES
(1, 'Design Landing Page', 'Create a responsive landing page design for the website', 'completed', 'high', 3, 1, '2026-06-15', '2026-06-01 10:00:00', '2026-06-08 15:30:00'),
(2, 'Implement User Authentication', 'Add JWT-based authentication to the backend API', 'in_progress', 'high', 2, 1, '2026-06-20', '2026-06-02 10:00:00', '2026-06-09 14:00:00'),
(3, 'Write API Documentation', 'Complete API endpoint documentation with examples', 'pending', 'medium', 2, 1, '2026-06-25', '2026-06-03 10:00:00', '2026-06-03 10:00:00'),
(4, 'Test Payment Gateway', 'Integration testing for Stripe payment system', 'in_progress', 'high', 4, 1, '2026-06-22', '2026-06-04 10:00:00', '2026-06-08 11:20:00'),
(5, 'Database Optimization', 'Add indexes and optimize slow queries', 'pending', 'medium', 2, 1, '2026-06-30', '2026-06-05 10:00:00', '2026-06-05 10:00:00'),
(6, 'Mobile App UI Refinement', 'Improve UI responsiveness and visual hierarchy', 'completed', 'medium', 3, 1, '2026-06-10', '2026-06-06 10:00:00', '2026-06-09 16:45:00'),
(7, 'Security Audit', 'Conduct comprehensive security review of codebase', 'pending', 'high', 4, 1, '2026-06-28', '2026-06-07 10:00:00', '2026-06-07 10:00:00');

-- ============================================================
-- Indexes for tables
-- ============================================================
ALTER TABLE `users` ADD INDEX `idx_role` (`role`);
ALTER TABLE `users` ADD INDEX `idx_email` (`email`);
ALTER TABLE `tasks` ADD INDEX `idx_status` (`status`);
ALTER TABLE `tasks` ADD INDEX `idx_priority` (`priority`);
ALTER TABLE `tasks` ADD INDEX `idx_assigned_to` (`assigned_to`);
ALTER TABLE `tasks` ADD INDEX `idx_created_by` (`created_by`);

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- ============================================================
-- Setup Instructions
-- ============================================================
-- 1. Create the database and import this file:
--    mysql -u root -p < database_dump.sql
--
-- 2. Update seed data with actual bcrypt hashes in production
--    Default credentials (for development only):
--    - Admin: admin@company.com / admin123
--    - Employee: john@company.com / password123
--    - Employee: jane@company.com / password123
--    - Employee: bob@company.com / password123
-- ============================================================
