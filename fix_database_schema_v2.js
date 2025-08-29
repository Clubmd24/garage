#!/usr/bin/env node
import mysql from 'mysql2/promise';

// New database connection string
const NEW_DB_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function fixDatabaseSchemaV2() {
  console.log('🔧 Fixing database schema (Version 2 - MySQL Compatible)...');
  
  let db;
  
  try {
    // Connect to new database
    db = await mysql.createConnection(NEW_DB_URL);
    console.log('✅ Connected to new database');
    
    // Helper function to safely add columns
    async function addColumnIfNotExists(table, column, definition) {
      try {
        // Check if column exists
        const [columns] = await db.execute(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
        if (columns.length === 0) {
          await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
          console.log(`✅ Added column: ${table}.${column}`);
          return true;
        } else {
          console.log(`ℹ️  Column already exists: ${table}.${column}`);
          return false;
        }
      } catch (error) {
        console.log(`⚠️  Error adding column ${table}.${column}: ${error.message}`);
        return false;
      }
    }
    
    // Fix 1: Add missing columns to users table (MySQL compatible way)
    console.log('🔧 Fix 1: Adding missing columns to users table...');
    const userColumns = [
      ['users', 'first_name', 'VARCHAR(100)'],
      ['users', 'surname', 'VARCHAR(100)'],
      ['users', 'street_address', 'TEXT'],
      ['users', 'post_code', 'VARCHAR(20)'],
      ['users', 'ni_tie_number', 'VARCHAR(50)'],
      ['users', 'contact_phone', 'VARCHAR(50)'],
      ['users', 'date_of_birth', 'DATE'],
      ['users', 'job_title', 'VARCHAR(100)'],
      ['users', 'department', 'VARCHAR(100)'],
      ['users', 'hourly_rate', 'DECIMAL(10,2)'],
      ['users', 'employee_id', 'VARCHAR(50)']
    ];
    
    for (const [table, column, definition] of userColumns) {
      await addColumnIfNotExists(table, column, definition);
    }
    
    // Fix 2: Add missing columns to clients table
    console.log('🔧 Fix 2: Adding missing columns to clients table...');
    const clientColumns = [
      ['clients', 'last_name', 'TEXT'],
      ['clients', 'mobile', 'TEXT'],
      ['clients', 'landline', 'TEXT'],
      ['clients', 'nie_number', 'TEXT'],
      ['clients', 'street_address', 'TEXT'],
      ['clients', 'town', 'TEXT'],
      ['clients', 'province', 'TEXT'],
      ['clients', 'post_code', 'TEXT'],
      ['clients', 'vehicle_reg', 'VARCHAR(50)'],
      ['clients', 'password_hash', 'VARCHAR(255)'],
      ['clients', 'pin_hash', 'VARCHAR(255)'],
      ['clients', 'must_change_password', 'TINYINT(1) DEFAULT 0']
    ];
    
    for (const [table, column, definition] of clientColumns) {
      await addColumnIfNotExists(table, column, definition);
    }
    
    // Fix 3: Add missing columns to vehicles table
    console.log('🔧 Fix 3: Adding missing columns to vehicles table...');
    const vehicleColumns = [
      ['vehicles', 'company_vehicle_id', 'VARCHAR(50)'],
      ['vehicles', 'customer_id', 'INT'],
      ['vehicles', 'fleet_id', 'INT']
    ];
    
    for (const [table, column, definition] of vehicleColumns) {
      await addColumnIfNotExists(table, column, definition);
    }
    
    // Fix 4: Add missing columns to fleets table
    console.log('🔧 Fix 4: Adding missing columns to fleets table...');
    const fleetColumns = [
      ['fleets', 'street_address', 'TEXT'],
      ['fleets', 'contact_number_1', 'VARCHAR(50)'],
      ['fleets', 'contact_number_2', 'VARCHAR(50)'],
      ['fleets', 'email_1', 'VARCHAR(255)'],
      ['fleets', 'email_2', 'VARCHAR(255)'],
      ['fleets', 'credit_limit', 'DECIMAL(10,2)'],
      ['fleets', 'tax_number', 'VARCHAR(100)'],
      ['fleets', 'contact_name_1', 'VARCHAR(255)'],
      ['fleets', 'contact_name_2', 'VARCHAR(255)']
    ];
    
    for (const [table, column, definition] of fleetColumns) {
      await addColumnIfNotExists(table, column, definition);
    }
    
    // Fix 5: Add missing columns to parts table
    console.log('🔧 Fix 5: Adding missing columns to parts table...');
    const partColumns = [
      ['parts', 'part_number', 'VARCHAR(100)'],
      ['parts', 'description', 'TEXT'],
      ['parts', 'category_id', 'INT'],
      ['parts', 'supplier_id', 'INT'],
      ['parts', 'unit_cost', 'DECIMAL(10,2)'],
      ['parts', 'unit_price', 'DECIMAL(10,2)'],
      ['parts', 'markup_percentage', 'DECIMAL(5,2)'],
      ['parts', 'stock_level', 'INT'],
      ['parts', 'min_stock_level', 'INT']
    ];
    
    for (const [table, column, definition] of partColumns) {
      await addColumnIfNotExists(table, column, definition);
    }
    
    // Fix 6: Add missing columns to suppliers table
    console.log('🔧 Fix 6: Adding missing columns to suppliers table...');
    const supplierColumns = [
      ['suppliers', 'contact_person', 'VARCHAR(255)'],
      ['suppliers', 'email', 'VARCHAR(255)'],
      ['suppliers', 'phone', 'VARCHAR(50)'],
      ['suppliers', 'address', 'TEXT'],
      ['suppliers', 'postcode', 'VARCHAR(20)'],
      ['suppliers', 'base_url', 'VARCHAR(500)'],
      ['suppliers', 'credit_limit', 'DECIMAL(12,2)'],
      ['suppliers', 'current_credit_balance', 'DECIMAL(12,2)']
    ];
    
    for (const [table, column, definition] of supplierColumns) {
      await addColumnIfNotExists(table, column, definition);
    }
    
    // Fix 7: Add missing columns to jobs table
    console.log('🔧 Fix 7: Adding missing columns to jobs table...');
    const jobColumns = [
      ['jobs', 'title', 'VARCHAR(255)'],
      ['jobs', 'description', 'TEXT'],
      ['jobs', 'defect_description', 'TEXT'],
      ['jobs', 'customer_reference', 'VARCHAR(255)'],
      ['jobs', 'purchase_order_number', 'VARCHAR(255)'],
      ['jobs', 'terms', 'TEXT'],
      ['jobs', 'bank_details', 'TEXT'],
      ['jobs', 'created_by', 'INT'],
      ['jobs', 'assigned_to', 'INT']
    ];
    
    for (const [table, column, definition] of jobColumns) {
      await addColumnIfNotExists(table, column, definition);
    }
    
    // Fix 8: Add missing columns to quotes table
    console.log('🔧 Fix 8: Adding missing columns to quotes table...');
    const quoteColumns = [
      ['quotes', 'reference', 'VARCHAR(255)'],
      ['quotes', 'revision', 'INT'],
      ['quotes', 'status', "ENUM('draft','sent','accepted','rejected','expired')"],
      ['quotes', 'total_amount', 'DECIMAL(10,2)'],
      ['quotes', 'terms', 'TEXT'],
      ['quotes', 'bank_details', 'TEXT'],
      ['quotes', 'valid_until', 'DATE'],
      ['quotes', 'created_by', 'INT']
    ];
    
    for (const [table, column, definition] of quoteColumns) {
      await addColumnIfNotExists(table, column, definition);
    }
    
    // Fix 9: Add missing columns to invoices table
    console.log('🔧 Fix 9: Adding missing columns to invoices table...');
    const invoiceColumns = [
      ['invoices', 'invoice_number', 'VARCHAR(255)'],
      ['invoices', 'status', "ENUM('draft','sent','paid','overdue','cancelled')"],
      ['invoices', 'total_amount', 'DECIMAL(10,2)'],
      ['invoices', 'terms', 'TEXT'],
      ['invoices', 'bank_details', 'TEXT'],
      ['invoices', 'due_date', 'DATE'],
      ['invoices', 'paid_date', 'DATE'],
      ['invoices', 'created_by', 'INT']
    ];
    
    for (const [table, column, definition] of invoiceColumns) {
      await addColumnIfNotExists(table, column, definition);
    }
    
    // Fix 10: Add missing columns to time_entries table
    console.log('🔧 Fix 10: Adding missing columns to time_entries table...');
    const timeEntryColumns = [
      ['time_entries', 'start_time', 'TIMESTAMP'],
      ['time_entries', 'end_time', 'TIMESTAMP NULL'],
      ['time_entries', 'duration_minutes', 'INT'],
      ['time_entries', 'notes', 'TEXT']
    ];
    
    for (const [table, column, definition] of timeEntryColumns) {
      await addColumnIfNotExists(table, column, definition);
    }
    
    console.log('\n🎉 Database schema fixes completed successfully!');
    console.log('📝 Your application should now be able to connect and login.');
    console.log('🔍 Try logging in to your application now!');
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
  } finally {
    if (db) await db.end();
  }
}

// Run the fix
fixDatabaseSchemaV2();
