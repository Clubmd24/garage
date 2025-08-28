# Clean Database Setup Guide

## Overview
This guide will help you set up a clean, optimized database with only the essential tables your garage management system needs. We're replacing the current 77-table database with a clean 26-table schema.

## What We're Creating

### Core Business Tables (26 tables)
- **Clients & Vehicles**: `clients`, `vehicles`, `fleets`, `fleet_vehicles`
- **User Management**: `users`, `user_roles`
- **Job Management**: `jobs`, `job_statuses`, `job_assignments`, `job_work_logs`, `job_requests`
- **Quotes & Invoices**: `quotes`, `quote_items`, `invoices`, `invoice_items`, `invoice_statuses`
- **Parts & Suppliers**: `parts`, `part_categories`, `suppliers`, `purchase_orders`, `purchase_order_items`
- **Time Tracking**: `time_entries`
- **Supporting Tables**: `company_settings`, `smtp_settings`, `email_templates`, `follow_up_reminders`, `vehicle_condition_reports`, `vehicle_mileage`, `payments`

## Benefits of Clean Database
1. **Performance**: Faster queries, better indexing
2. **Maintainability**: Clear structure, proper relationships
3. **Scalability**: Optimized for growth
4. **Reliability**: No broken foreign keys or orphaned data

## Setup Steps

### Step 1: Run the Clean Database Setup
```bash
# This will create the new database schema and migrate your data
node scripts/setup_clean_database.js
```

### Step 2: Update Heroku Configuration
```bash
# Update your Heroku app to use the new database
node scripts/update_heroku_database.js
```

### Step 3: Restart Heroku Dynos
```bash
heroku restart
```

### Step 4: Verify Setup
- Check that your application is working
- Verify data has been migrated correctly
- Test key functionality (clients, jobs, quotes, etc.)

## What Happens During Setup

1. **Schema Creation**: Creates 26 clean tables with proper structure
2. **Data Migration**: Moves your existing data from old to new database
3. **Default Data**: Inserts essential default values (job statuses, invoice statuses, etc.)
4. **Foreign Keys**: Establishes proper relationships between tables
5. **Indexes**: Adds performance indexes for common queries

## Data Migration Details

The migration will preserve:
- All client information
- All vehicle records
- All job history
- All quotes and invoices
- All parts and supplier data
- All user accounts

## Rollback Plan

If anything goes wrong:
1. Your old database remains untouched
2. You can revert the `DATABASE_URL` in Heroku
3. All your data is safe

## Expected Results

After setup, you should have:
- **26 tables** instead of 77
- **Clean, fast queries**
- **Proper data relationships**
- **Better performance**
- **Easier maintenance**

## Troubleshooting

### Common Issues
1. **Connection Errors**: Verify the new database is accessible
2. **Migration Failures**: Check that old database is accessible
3. **Heroku Issues**: Ensure you're logged into Heroku CLI

### Getting Help
- Check the console output for specific error messages
- Verify database connectivity
- Ensure Heroku CLI is properly configured

## Next Steps

After successful setup:
1. **Test all functionality** thoroughly
2. **Monitor performance** improvements
3. **Update any custom queries** if needed
4. **Enjoy your clean, fast database!**

---

**Note**: This setup is designed to be safe and non-destructive. Your existing data will be preserved and migrated to the new clean structure.
