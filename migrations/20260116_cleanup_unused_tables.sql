-- Database Cleanup Migration
-- Remove unused tables and optimize remaining ones
-- This will clean up tables created by various AI assistants that aren't being used

-- Phase 1: Remove obviously unused development/testing tables
DROP TABLE IF EXISTS `dev_ai_agents`;
DROP TABLE IF EXISTS `dev_ai_conversations`;
DROP TABLE IF EXISTS `dev_ai_messages`;
DROP TABLE IF EXISTS `dev_documents`;
DROP TABLE IF EXISTS `dev_messages`;
DROP TABLE IF EXISTS `dev_projects`;
DROP TABLE IF EXISTS `dev_tasks`;
DROP TABLE IF EXISTS `dev_threads`;

-- Phase 2: Remove unimplemented feature tables
DROP TABLE IF EXISTS `cameras`;
DROP TABLE IF EXISTS `chat_rooms`;
DROP TABLE IF EXISTS `checklist_logs`;
DROP TABLE IF EXISTS `checklist_templates`;
DROP TABLE IF EXISTS `contracts`;
DROP TABLE IF EXISTS `driver_tasks`;
DROP TABLE IF EXISTS `embeddings`;
DROP TABLE IF EXISTS `emergency_contacts`;
DROP TABLE IF EXISTS `event_logs`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `hardware_kit_items`;
DROP TABLE IF EXISTS `hardware_kits`;
DROP TABLE IF EXISTS `maintenance`;
DROP TABLE IF EXISTS `medical_certificates`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `notification_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `payroll_entries`;
DROP TABLE IF EXISTS `payslips`;
DROP TABLE IF EXISTS `performance`;
DROP TABLE IF EXISTS `pricing_plans`;
DROP TABLE IF EXISTS `quiz_questions`;
DROP TABLE IF EXISTS `reminders`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `sick_leaves`;
DROP TABLE IF EXISTS `standard_sections`;
DROP TABLE IF EXISTS `standards`;
DROP TABLE IF EXISTS `stock_levels`;
DROP TABLE IF EXISTS `stock_transactions`;
DROP TABLE IF EXISTS `task_files`;
DROP TABLE IF EXISTS `virtual_titles`;

-- Phase 3: Remove duplicate/unused tables
DROP TABLE IF EXISTS `customers`; -- Duplicate of clients
DROP TABLE IF EXISTS `roles`; -- Duplicate of user_roles
DROP TABLE IF EXISTS `documents`; -- Generic documents not used
DROP TABLE IF EXISTS `clients_bkp`; -- Backup table
DROP TABLE IF EXISTS `vehicles_bkp`; -- Backup table

-- Phase 4: Remove EPOS tables if not fully implemented
-- Comment these out if you're actively using EPOS
-- DROP TABLE IF EXISTS `pos_sale_items`;
-- DROP TABLE IF EXISTS `pos_sales`;
-- DROP TABLE IF EXISTS `pos_sessions`;

-- Phase 5: Remove HR tables if not using those features
-- Comment these out if you're actively using HR features
-- DROP TABLE IF EXISTS `holiday_requests`;
-- DROP TABLE IF EXISTS `attendance_records`;
-- DROP TABLE IF EXISTS `shifts`;

-- Phase 6: Clean up orphaned foreign keys and indexes
-- This will be handled automatically by MySQL when tables are dropped

-- Phase 7: Optimize remaining tables
-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_jobs_status_date` ON `jobs`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_quotes_status_date` ON `quotes`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_invoices_status_date` ON `invoices`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_parts_supplier_category` ON `parts`(`supplier_id`, `category_id`);
CREATE INDEX IF NOT EXISTS `idx_vehicles_customer_fleet` ON `vehicles`(`customer_id`, `fleet_id`);

-- Phase 8: Clean up any remaining orphaned data
-- Remove any records that reference deleted tables
DELETE FROM `user_roles` WHERE `role_id` NOT IN (SELECT `id` FROM `user_roles`);

-- Phase 9: Update schema_migrations to reflect cleanup
INSERT INTO `schema_migrations` (`version`, `description`, `executed_at`) 
VALUES ('20260116_cleanup_unused_tables', 'Removed unused tables and optimized schema', NOW())
ON DUPLICATE KEY UPDATE `executed_at` = NOW();

-- Phase 10: Verify cleanup
-- This will show remaining tables
-- SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME;
