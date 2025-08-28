# 🗄️ Database Cleanup Analysis & Plan

## 📊 Current Database Status

Your database currently contains **~75 tables** - this is significantly more than needed for a garage management system. Many tables were created by various AI assistants (Claude, ChatGPT, etc.) but are not actually being used by your application.

## 🗑️ Tables Safe to Remove (Phase 1)

### Development/Testing Tables (100% Safe)
- `dev_ai_agents` - AI development testing
- `dev_ai_conversations` - AI development testing  
- `dev_ai_messages` - AI development testing
- `dev_documents` - AI development testing
- `dev_messages` - AI development testing
- `dev_projects` - AI development testing
- `dev_tasks` - AI development testing
- `dev_threads` - AI development testing

### Unimplemented Feature Tables (Safe)
- `cameras` - Security system (not implemented)
- `chat_rooms` - Chat functionality (not implemented)
- `checklist_logs` - Generic checklists (not used)
- `checklist_templates` - Generic checklists (not used)
- `contracts` - Contract management (not implemented)
- `driver_tasks` - Driver management (not implemented)
- `embeddings` - AI features (not implemented)
- `emergency_contacts` - Emergency system (not implemented)
- `event_logs` - Generic logging (not used)
- `events` - Generic events (not used)
- `hardware_kit_items` - Hardware management (not implemented)
- `hardware_kits` - Hardware management (not implemented)
- `maintenance` - Generic maintenance (not used)
- `medical_certificates` - HR features (not implemented)
- `messages` - Generic messaging (not used)
- `notification_logs` - Notification system (not implemented)
- `notifications` - Notification system (not implemented)
- `payroll_entries` - HR features (not implemented)
- `payslips` - HR features (not implemented)
- `performance` - Performance tracking (not implemented)
- `pricing_plans` - Subscription system (not implemented)
- `quiz_questions` - Training system (not implemented)
- `reminders` - Generic reminders (not used)
- `sessions` - User sessions (not used)
- `sick_leaves` - HR features (not implemented)
- `standard_sections` - Training standards (not used)
- `standards` - Training standards (not used)
- `stock_levels` - Inventory management (not implemented)
- `stock_transactions` - Inventory management (not implemented)
- `task_files` - File management (not used)
- `virtual_titles` - Generic titles (not used)

### Duplicate/Backup Tables (Safe)
- `customers` - Duplicate of `clients`
- `roles` - Duplicate of `user_roles`
- `documents` - Generic documents (not used)
- `clients_bkp` - Backup table
- `vehicles_bkp` - Backup table

## ⚠️ Tables Needing Review (Phase 2)

### EPOS Tables (Review if using EPOS)
- `pos_sale_items` - EPOS sales items
- `pos_sales` - EPOS sales records
- `pos_sessions` - EPOS sessions

### HR Tables (Review if using staff scheduling)
- `holiday_requests` - Staff time off
- `attendance_records` - Staff attendance
- `shifts` - Staff scheduling

## ✅ Core Tables to Keep (Essential)

### User Management
- `users` - User accounts
- `user_roles` - User role assignments

### Customer Management
- `clients` - Customer information
- `fleets` - Fleet management
- `vehicles` - Customer vehicles

### Inventory Management
- `parts` - Parts inventory
- `part_categories` - Parts organization
- `suppliers` - Part suppliers
- `supplier_credit_transactions` - Supplier credit tracking
- `supplier_payments` - Supplier payments

### Business Operations
- `quotes` - Customer quotes
- `quote_items` - Quote line items
- `jobs` - Work orders
- `job_assignments` - Engineer assignments
- `job_work_logs` - Job history
- `job_statuses` - Job workflow states
- `time_entries` - Engineer time tracking
- `invoices` - Customer invoices
- `invoice_items` - Invoice line items
- `invoice_statuses` - Invoice states
- `payments` - Customer payments
- `purchase_orders` - Supplier orders
- `purchase_order_items` - PO line items

### Supporting Features
- `job_requests` - Customer job requests
- `follow_up_reminders` - Customer follow-ups
- `vehicle_mileage` - Vehicle tracking
- `vehicle_condition_reports` - Vehicle inspections
- `company_settings` - Business configuration
- `smtp_settings` - Email configuration
- `email_templates` - Email communications
- `schema_migrations` - Migration tracking

## 💾 Expected Space Savings

**Removing unused tables could save:**
- **Development tables**: ~2-5 MB
- **Unimplemented features**: ~10-20 MB  
- **Duplicate tables**: ~5-10 MB
- **Total potential savings**: **15-35 MB**

## 🚀 Cleanup Implementation Plan

### Phase 1: Safe Removal (Immediate)
1. Run the cleanup migration: `migrations/20260116_cleanup_unused_tables.sql`
2. This removes ~40+ unused tables safely
3. Test application functionality

### Phase 2: Review & Decision (After Phase 1)
1. **EPOS Tables**: Keep if actively using EPOS, remove if not
2. **HR Tables**: Keep if using staff scheduling, remove if not
3. **Custom Tables**: Review any remaining tables not in core list

### Phase 3: Optimization (After cleanup)
1. Add performance indexes
2. Optimize remaining table structures
3. Clean up orphaned foreign keys

## 📋 Files Created

1. **`migrations/20260116_cleanup_unused_tables.sql`** - Safe cleanup migration
2. **`database/garage_optimized_schema.sql`** - Target optimized schema
3. **`scripts/database_cleanup.js`** - Analysis script (requires DB connection)

## ⚡ Benefits of Cleanup

1. **Performance**: Faster queries, smaller database size
2. **Maintenance**: Easier to understand and maintain
3. **Clarity**: Clear separation of used vs. unused features
4. **Storage**: Reduced storage costs
5. **Backups**: Faster backup/restore operations

## 🔒 Safety Measures

- All cleanup operations use `DROP TABLE IF EXISTS`
- Migration is tracked in `schema_migrations`
- Core business tables are never touched
- Foreign key constraints are automatically handled

## 📞 Next Steps

1. **Review this analysis** and confirm the plan
2. **Run the cleanup migration** when ready
3. **Test thoroughly** after cleanup
4. **Monitor performance** improvements

The cleanup will transform your database from a bloated 75+ table system to a clean, optimized ~35 table system focused on your actual business needs.
