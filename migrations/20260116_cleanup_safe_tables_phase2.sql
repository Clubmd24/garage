-- Phase 2: Safe Table Cleanup Migration
-- Based on foreign key analysis - these tables have no dependencies
-- This migration removes 9 tables that are safe to delete

-- Remove tables with no foreign key references
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `payroll_entries`;
DROP TABLE IF EXISTS `payslips`;
DROP TABLE IF EXISTS `pos_sale_items`;
DROP TABLE IF EXISTS `holiday_requests`;
DROP TABLE IF EXISTS `attendance_records`;
DROP TABLE IF EXISTS `shifts`;

-- Record this cleanup in schema_migrations
INSERT INTO `schema_migrations` (`version`, `description`, `executed_at`) 
VALUES ('20260116_cleanup_safe_tables_phase2', 'Removed 9 tables with no foreign key dependencies', NOW())
ON DUPLICATE KEY UPDATE `executed_at` = NOW();

-- Note: The following tables still need manual review:
-- - pos_sales (referenced by pos_sale_items.sale_id)
-- - pos_sessions (referenced by pos_sales.session_id)
-- These require additional cleanup before removal
