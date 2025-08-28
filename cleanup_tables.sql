-- Direct Table Cleanup SQL Script
-- Run this directly on your database to remove 10 safe tables
-- Based on foreign key analysis - these tables have no dependencies

-- Remove tables with no foreign key references
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `payroll_entries`;
DROP TABLE IF EXISTS `payslips`;
DROP TABLE IF EXISTS `pos_sale_items`;
DROP TABLE IF EXISTS `pos_sales`;
DROP TABLE IF EXISTS `holiday_requests`;
DROP TABLE IF EXISTS `attendance_records`;
DROP TABLE IF EXISTS `shifts`;

-- Note: pos_sessions still has a foreign key reference and cannot be removed yet
-- To remove it, you would need to either:
-- 1. Remove the reference from pos_sales.session_id first, or
-- 2. Keep the table as it may be needed for the EPOS system
