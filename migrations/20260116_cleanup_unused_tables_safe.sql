-- Database Optimization Migration (No Table Removal)
-- Since even development tables have foreign key constraints, we'll focus on optimization
-- Table cleanup will be done manually after foreign key analysis

-- Phase 1: Add performance indexes to existing tables
CREATE INDEX IF NOT EXISTS `idx_jobs_status_date` ON `jobs`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_quotes_status_date` ON `quotes`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_invoices_status_date` ON `invoices`(`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_parts_supplier_category` ON `parts`(`supplier_id`, `category_id`);
CREATE INDEX IF NOT EXISTS `idx_vehicles_customer_fleet` ON `vehicles`(`customer_id`, `fleet_id`);

-- Phase 2: Update schema_migrations to reflect this optimization
INSERT INTO `schema_migrations` (`version`, `description`, `executed_at`) 
VALUES ('20260116_cleanup_unused_tables_safe', 'Added performance indexes and prepared for manual table cleanup', NOW())
ON DUPLICATE KEY UPDATE `executed_at` = NOW();

-- Note: Table removal requires manual foreign key analysis first
-- Even development tables appear to have foreign key relationships
-- Next steps:
-- 1. Run foreign key analysis script to understand dependencies
-- 2. Manually identify and remove safe tables
-- 3. Create targeted cleanup migrations based on analysis
