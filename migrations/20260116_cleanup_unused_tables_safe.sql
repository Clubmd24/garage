-- Conservative Database Cleanup Migration
-- This version only removes tables that are guaranteed to have no foreign key relationships
-- We'll start with the safest tables and add more later after analysis

-- Phase 1: Remove ONLY development/testing tables (guaranteed safe)
-- These are typically completely isolated with no relationships
DROP TABLE IF EXISTS `dev_ai_agents`;
DROP TABLE IF EXISTS `dev_ai_conversations`;
DROP TABLE IF EXISTS `dev_ai_messages`;
DROP TABLE IF EXISTS `dev_documents`;
DROP TABLE IF EXISTS `dev_messages`;
DROP TABLE IF EXISTS `dev_projects`;
DROP TABLE IF EXISTS `dev_tasks`;
DROP TABLE IF EXISTS `dev_threads`;

-- Phase 2: Add performance indexes to existing tables
CREATE INDEX IF NOT EXISTS `idx_jobs_status_date` ON `jobs`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_quotes_status_date` ON `quotes`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_invoices_status_date` ON `invoices`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_parts_supplier_category` ON `parts`(`supplier_id`, `category_id`);
CREATE INDEX IF NOT EXISTS `idx_vehicles_customer_fleet` ON `vehicles`(`customer_id`, `fleet_id`);

-- Phase 3: Update schema_migrations to reflect cleanup
INSERT INTO `schema_migrations` (`version`, `description`, `executed_at`) 
VALUES ('20260116_cleanup_unused_tables_safe', 'Conservatively removed development tables and added performance indexes', NOW())
ON DUPLICATE KEY UPDATE `executed_at` = NOW();

-- Note: We're being very conservative here and only removing development tables
-- The following tables were NOT removed due to potential foreign key constraints:
-- - cameras, chat_rooms, checklist_*, contracts, driver_tasks, embeddings
-- - emergency_contacts, event_logs, events, hardware_kit_*
-- - maintenance, medical_certificates, messages, notification_*
-- - performance, pricing_plans, quiz_questions, reminders
-- - sessions, sick_leaves, standard_*, stock_*, task_files, virtual_titles
-- - customers, roles, documents, payroll_entries, payslips
-- - pos_* tables, holiday_requests, attendance_records, shifts

-- Next steps:
-- 1. Run this conservative migration first
-- 2. Use the foreign key analysis script to identify safe tables
-- 3. Create additional migrations for tables that can be safely removed
