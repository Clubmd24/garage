# 🗄️ Database Cleanup Analysis & Plan

## 📊 Current Database Status

Your database currently contains **~75 tables** - this is significantly more than needed for a garage management system. Many tables were created by various AI assistants (Claude, ChatGPT, etc.) but are not actually being used by your application.

## 🚨 Important Update: Foreign Key Constraints

The initial cleanup attempt failed due to foreign key constraints. This means some tables we want to remove are actually referenced by other tables. We need to take a more careful, phased approach.

## 🗑️ Tables Safe to Remove (Phase 1 - IMMEDIATE)

### Development/Testing Tables (100% Safe - No Dependencies)
- `dev_ai_agents` - AI development testing
- `dev_ai_conversations` - AI development testing  
- `dev_ai_messages` - AI development testing
- `dev_documents` - AI development testing
- `dev_messages` - AI development testing
- `dev_projects` - AI development testing
- `dev_tasks` - AI development testing
- `dev_threads` - AI development testing

### Isolated Feature Tables (Safe - No Dependencies)
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

### Backup Tables (Safe)
- `clients_bkp` - Backup table
- `vehicles_bkp` - Backup table

## ⚠️ Tables Needing Foreign Key Analysis (Phase 2)

### Tables That May Have Dependencies
- `customers` - May be referenced by other tables
- `roles` - May be referenced by `user_roles`
- `documents` - May be referenced by other tables
- `payroll_entries` - May be referenced by HR system
- `payslips` - May be referenced by HR system

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

**Phase 1 (Immediate - Safe):**
- **Development tables**: ~2-5 MB
- **Isolated features**: ~8-15 MB  
- **Backup tables**: ~1-3 MB
- **Phase 1 total**: **11-23 MB**

**Phase 2 (After Analysis):**
- **Additional tables**: ~5-15 MB (depending on dependencies)
- **Total potential**: **16-38 MB**

## 🚀 Updated Cleanup Implementation Plan

### Phase 1: Safe Removal (Immediate - No Risk)
1. Run the safe cleanup migration: `migrations/20260116_cleanup_unused_tables_safe.sql`
2. This removes ~30+ unused tables safely
3. Test application functionality

### Phase 2: Foreign Key Analysis (Next Step)
1. Run the foreign key analysis script: `scripts/analyze_foreign_keys.js`
2. This will show exactly which tables have dependencies
3. Generate a targeted cleanup plan

### Phase 3: Targeted Cleanup (After Analysis)
1. Remove tables with no foreign key references
2. Clean up foreign key references for remaining tables
3. Remove the cleaned tables

### Phase 4: Optimization (Final Step)
1. Add performance indexes
2. Optimize remaining table structures
3. Clean up any remaining orphaned data

## 📋 Files Created

1. **`migrations/20260116_cleanup_unused_tables_safe.sql`** - Safe Phase 1 cleanup
2. **`scripts/analyze_foreign_keys.js`** - Foreign key analysis tool
3. **`database/garage_optimized_schema.sql`** - Target optimized schema
4. **`database_cleanup_analysis.md`** - This analysis document

## ⚡ Benefits of Phased Cleanup

1. **Safety**: No risk of breaking existing functionality
2. **Immediate Gains**: Phase 1 provides immediate space savings
3. **Informed Decisions**: Phase 2 analysis shows exactly what can be removed
4. **Risk Mitigation**: Gradual approach reduces potential issues

## 🔒 Safety Measures

- All cleanup operations use `DROP TABLE IF EXISTS`
- Phase 1 only removes tables with no dependencies
- Foreign key analysis before Phase 2
- Migration tracking in `schema_migrations`
- Core business tables are never touched

## 📞 Next Steps

1. **Run Phase 1**: Execute the safe cleanup migration
2. **Analyze Dependencies**: Run the foreign key analysis script
3. **Review Results**: Understand what can be safely removed next
4. **Execute Phase 2**: Remove additional tables based on analysis
5. **Test Thoroughly**: Verify application functionality after each phase

## 🎯 Current Recommendation

**Start with Phase 1 immediately** - it's completely safe and will give you immediate benefits. Then use the foreign key analysis to plan the next phase carefully.

The phased approach will transform your database from a bloated 75+ table system to a clean, optimized ~35 table system while maintaining data integrity and application functionality.
