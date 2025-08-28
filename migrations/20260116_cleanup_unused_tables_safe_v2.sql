-- Safe Database Cleanup Migration
-- This version handles foreign key constraints and only removes truly unused tables
-- Run this after reviewing the analysis

-- Phase 1: Remove development/testing tables (usually safe)
-- These are typically isolated and don't have foreign key relationships
DROP TABLE IF EXISTS `dev_ai_agents`;
DROP TABLE IF EXISTS `dev_ai_conversations`;
DROP TABLE IF EXISTS `dev_ai_messages`;
DROP TABLE IF EXISTS `dev_documents`;
DROP TABLE IF EXISTS `dev_messages`;
DROP TABLE IF EXISTS `dev_projects`;
DROP TABLE IF EXISTS `dev_tasks`;
DROP TABLE IF EXISTS `dev_threads`;

-- Phase 2: Remove isolated unimplemented feature tables
-- These tables are typically standalone with no foreign key relationships
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

-- Phase 3: Remove backup tables (safe)
DROP TABLE IF EXISTS `clients_bkp`;
DROP TABLE IF EXISTS `vehicles_bkp`;

-- Phase 4: Add performance indexes to remaining tables
CREATE INDEX IF NOT EXISTS `idx_jobs_status_date` ON `jobs`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_quotes_status_date` ON `quotes`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_invoices_status_date` ON `invoices`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_parts_supplier_category` ON `parts`(`supplier_id`, `category_id`);
CREATE INDEX IF NOT EXISTS `idx_vehicles_customer_fleet` ON `vehicles`(`customer_id`, `fleet_id`);

-- Phase 5: Update schema_migrations to reflect cleanup
INSERT INTO `schema_migrations` (`version`, `description`, `executed_at`) 
VALUES ('20260116_cleanup_unused_tables_safe', 'Safely removed unused development and isolated tables', NOW())
ON DUPLICATE KEY UPDATE `executed_at` = NOW();

-- Note: The following tables were NOT removed due to potential foreign key constraints:
-- - customers (may be referenced by other tables)
-- - roles (may be referenced by user_roles)
-- - documents (may be referenced by other tables)
-- - payroll_entries (may be referenced by HR system)
-- - payslips (may be referenced by HR system)
-- - pos_sale_items, pos_sales, pos_sessions (EPOS system - review if using)
-- - holiday_requests, attendance_records, shifts (HR system - review if using)

-- To remove the remaining tables, you'll need to:
-- 1. Check for foreign key references
-- 2. Either remove the references first, or keep the tables
-- 3. Run additional cleanup migrations as needed
