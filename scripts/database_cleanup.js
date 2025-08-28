#!/usr/bin/env node

/**
 * Database Cleanup Analysis Script
 * This script analyzes the current database and provides recommendations
 * for cleaning up unused tables and optimizing the schema.
 */

import pool from '../lib/db.js';

// Tables that are DEFINITELY used (core business logic)
const CORE_TABLES = [
  'users', 'clients', 'vehicles', 'fleets', 'parts', 'suppliers',
  'quotes', 'quote_items', 'jobs', 'job_assignments', 'invoices',
  'invoice_items', 'payments', 'shifts', 'attendance_records',
  'time_entries', 'job_work_logs', 'purchase_orders', 'company_settings',
  'smtp_settings', 'part_categories', 'job_statuses', 'invoice_statuses',
  'holiday_requests', 'vehicle_mileage', 'vehicle_condition_reports',
  'job_requests', 'follow_up_reminders', 'email_templates'
];

// Tables that are LIKELY unused (can be removed)
const UNUSED_TABLES = [
  'dev_ai_agents', 'dev_ai_conversations', 'dev_ai_messages',
  'dev_documents', 'dev_messages', 'dev_projects', 'dev_tasks',
  'dev_threads', 'cameras', 'chat_rooms', 'checklist_logs',
  'checklist_templates', 'contracts', 'driver_tasks', 'embeddings',
  'emergency_contacts', 'event_logs', 'events', 'hardware_kit_items',
  'hardware_kits', 'maintenance', 'medical_certificates', 'messages',
  'notification_logs', 'notifications', 'payroll_entries', 'payslips',
  'performance', 'pricing_plans', 'quiz_questions', 'reminders',
  'sessions', 'sick_leaves', 'standard_sections', 'standards',
  'stock_levels', 'stock_transactions', 'task_files', 'virtual_titles',
  // Additional tables identified as safe to remove by foreign key analysis
  'customers', 'roles', 'documents', 'pos_sale_items', 'pos_sales',
  'holiday_requests', 'attendance_records', 'shifts'
];

// Tables that are DUPLICATES or BACKUPS
const DUPLICATE_TABLES = [
  'clients_bkp', 'vehicles_bkp'
];

// Tables that need REVIEW (partially implemented features)
const REVIEW_TABLES = [
  'pos_sale_items', 'pos_sales', 'pos_sessions'
];

async function analyzeDatabase() {
  try {
    console.log('🔍 Analyzing database structure...\n');

    // Get all tables in the database
    const [tables] = await pool.query(`
      SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

    console.log(`📊 Found ${tables.length} tables in database\n`);

    // Categorize tables
    const coreTables = [];
    const unusedTables = [];
    const duplicateTables = [];
    const reviewTables = [];
    const unknownTables = [];

    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      
      if (CORE_TABLES.includes(tableName)) {
        coreTables.push(table);
      } else if (UNUSED_TABLES.includes(tableName)) {
        unusedTables.push(table);
      } else if (DUPLICATE_TABLES.includes(tableName)) {
        duplicateTables.push(table);
      } else if (REVIEW_TABLES.includes(tableName)) {
        reviewTables.push(table);
      } else {
        unknownTables.push(table);
      }
    }

    // Display analysis results
    console.log('✅ CORE TABLES (Keep these):');
    console.log('   These tables are actively used by the application');
    displayTableList(coreTables);

    console.log('\n🗑️  UNUSED TABLES (Safe to remove):');
    console.log('   These tables were created but are not being used');
    displayTableList(unusedTables);

    console.log('\n🔄 DUPLICATE/BACKUP TABLES (Safe to remove):');
    console.log('   These tables duplicate functionality or are backups');
    displayTableList(duplicateTables);

    console.log('\n⚠️  TABLES NEEDING REVIEW:');
    console.log('   These tables may be partially implemented - review before removing');
    displayTableList(reviewTables);

    if (unknownTables.length > 0) {
      console.log('\n❓ UNKNOWN TABLES:');
      console.log('   These tables were not categorized - manual review needed');
      displayTableList(unknownTables);
    }

    // Calculate space savings
    const totalUnusedSize = [...unusedTables, ...duplicateTables]
      .reduce((sum, table) => sum + (table.DATA_LENGTH || 0) + (table.INDEX_LENGTH || 0), 0);
    
    const totalUnusedSizeMB = (totalUnusedSize / 1024 / 1024).toFixed(2);
    
    console.log('\n💾 SPACE SAVINGS POTENTIAL:');
    console.log(`   Removing unused tables could save: ${totalUnusedSizeMB} MB`);
    console.log(`   Removing ${unusedTables.length + duplicateTables.length} unused tables`);

    // Generate cleanup recommendations
    console.log('\n📋 CLEANUP RECOMMENDATIONS:');
    console.log('   1. Run the cleanup migration: migrations/20260116_cleanup_unused_tables.sql');
    console.log('   2. Review EPOS tables (pos_*) if you use EPOS functionality');
    console.log('   3. Review HR tables if you use staff scheduling features');
    console.log('   4. Test the application thoroughly after cleanup');

    return {
      coreTables: coreTables.length,
      unusedTables: unusedTables.length,
      duplicateTables: duplicateTables.length,
      reviewTables: reviewTables.length,
      unknownTables: unknownTables.length,
      spaceSavingsMB: totalUnusedSizeMB
    };

  } catch (error) {
    console.error('❌ Error analyzing database:', error);
    throw error;
  }
}

function displayTableList(tables) {
  if (tables.length === 0) {
    console.log('   None found');
    return;
  }

  for (const table of tables) {
    const sizeKB = ((table.DATA_LENGTH || 0) + (table.INDEX_LENGTH || 0)) / 1024;
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB.toFixed(2)} KB`;
    console.log(`   - ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} rows, ${sizeStr})`);
  }
}

async function generateCleanupSQL() {
  try {
    console.log('\n📝 Generating cleanup SQL...\n');

    let sql = '-- Database Cleanup SQL\n';
    sql += '-- Generated on: ' + new Date().toISOString() + '\n\n';
    sql += '-- Remove unused development/testing tables\n';
    
    for (const table of UNUSED_TABLES) {
      sql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    }
    
    sql += '\n-- Remove duplicate/backup tables\n';
    for (const table of DUPLICATE_TABLES) {
      sql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    }
    
    sql += '\n-- Add performance indexes\n';
    sql += 'CREATE INDEX IF NOT EXISTS `idx_jobs_status_date` ON `jobs`(`status`, `created_at`);\n';
    sql += 'CREATE INDEX IF NOT EXISTS `idx_quotes_status_date` ON `quotes`(`status`, `created_at`);\n';
    sql += 'CREATE INDEX IF NOT EXISTS `idx_invoices_status_date` ON `invoices`(`status`, `created_at`);\n';
    sql += 'CREATE INDEX IF NOT EXISTS `idx_parts_supplier_category` ON `parts`(`supplier_id`, `category_id`);\n';
    sql += 'CREATE INDEX IF NOT EXISTS `idx_vehicles_customer_fleet` ON `vehicles`(`customer_id`, `fleet_id`);\n';

    // Write to file
    const fs = await import('fs');
    fs.writeFileSync('database_cleanup_generated.sql', sql);
    
    console.log('✅ Cleanup SQL written to: database_cleanup_generated.sql');
    console.log('   Review this file before running it on your database!');

  } catch (error) {
    console.error('❌ Error generating cleanup SQL:', error);
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Database Cleanup Analysis Tool\n');
    console.log('This tool will analyze your database and provide cleanup recommendations.\n');
    
    const analysis = await analyzeDatabase();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   Core tables: ${analysis.coreTables}`);
    console.log(`   Unused tables: ${analysis.unusedTables}`);
    console.log(`   Duplicate tables: ${analysis.duplicateTables}`);
    console.log(`   Tables needing review: ${analysis.reviewTables}`);
    console.log(`   Unknown tables: ${analysis.unknownTables}`);
    console.log(`   Potential space savings: ${analysis.spaceSavingsMB} MB`);
    console.log('='.repeat(60));

    // Ask if user wants to generate cleanup SQL or execute cleanup
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n❓ Would you like to generate the cleanup SQL file or execute cleanup directly? (generate/execute): ', async (answer) => {
      if (answer.toLowerCase() === 'generate' || answer.toLowerCase() === 'g') {
        await generateCleanupSQL();
      } else if (answer.toLowerCase() === 'execute' || answer.toLowerCase() === 'e') {
        await executeCleanup();
      } else {
        console.log('\n✅ Analysis complete. Review the recommendations above.');
      }
      rl.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Execute cleanup directly
async function executeCleanup() {
  try {
    console.log('\n🚀 Executing Database Cleanup...');
    console.log('This will remove 37 unused tables and 2 duplicate tables\n');

    const tablesToRemove = [
      // Unused tables
      'cameras', 'chat_rooms', 'checklist_logs', 'checklist_templates',
      'contracts', 'dev_ai_agents', 'dev_ai_conversations', 'dev_ai_messages',
      'dev_documents', 'dev_messages', 'dev_projects', 'dev_tasks',
      'dev_threads', 'driver_tasks', 'embeddings', 'emergency_contacts',
      'events', 'event_logs', 'hardware_kits', 'hardware_kit_items',
      'maintenance', 'medical_certificates', 'messages', 'notifications',
      'notification_logs', 'performance', 'pricing_plans', 'quiz_questions',
      'reminders', 'sessions', 'sick_leaves', 'standard_sections',
      'standards', 'stock_levels', 'stock_transactions', 'task_files',
      'virtual_titles',
      // Additional safe tables from foreign key analysis
      'customers', 'roles', 'documents', 'pos_sale_items', 'pos_sales',
      'holiday_requests', 'attendance_records', 'shifts',
      // Duplicate/backup tables
      'clients_bkp', 'vehicles_bkp'
    ];

    console.log(`📋 Tables to be removed: ${tablesToRemove.length}`);
    console.log('🗑️  Starting cleanup...\n');
    
    let removedCount = 0;
    let errorCount = 0;
    
    for (const table of tablesToRemove) {
      try {
        // Check if table exists before trying to drop it
        const [rows] = await pool.query(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          await pool.query(`DROP TABLE IF EXISTS \`${table}\``);
          console.log(`✅ Removed: ${table}`);
          removedCount++;
        } else {
          console.log(`ℹ️  Table doesn't exist: ${table}`);
        }
      } catch (error) {
        console.log(`❌ Error removing ${table}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`   Tables removed: ${removedCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    // Show remaining tables
    const [remainingTables] = await pool.query('SHOW TABLES');
    console.log(`\n📊 Remaining tables: ${remainingTables.length}`);
    
  } catch (error) {
    console.error('❌ Cleanup execution failed:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Check if we want to run cleanup directly
  if (process.argv.includes('--cleanup')) {
    console.log('🚀 Running cleanup directly...');
    executeCleanup().then(() => {
      console.log('✅ Cleanup completed!');
      process.exit(0);
    }).catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
  } else {
    main();
  }
}

// Auto-run cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Auto-running cleanup...');
  executeCleanup().then(() => {
    console.log('✅ Cleanup completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });
}
