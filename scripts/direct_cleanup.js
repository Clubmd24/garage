#!/usr/bin/env node
import pool from '../lib/db.js';

async function directCleanup() {
  console.log('🚀 Direct Database Cleanup Tool');
  console.log('This will remove 9 tables that are safe to delete based on foreign key analysis\n');

  const safeTables = [
    'customers',
    'roles', 
    'documents',
    'payroll_entries',
    'payslips',
    'pos_sale_items',
    'holiday_requests',
    'attendance_records',
    'shifts'
  ];

  try {
    console.log('📋 Tables to be removed:');
    safeTables.forEach(table => console.log(`  - ${table}`));
    console.log('');

    // Check if tables exist before trying to drop them
    for (const table of safeTables) {
      try {
        const [rows] = await pool.query(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          console.log(`🗑️  Dropping table: ${table}`);
          await pool.query(`DROP TABLE IF EXISTS \`${table}\``);
          console.log(`✅ Successfully dropped: ${table}`);
        } else {
          console.log(`ℹ️  Table doesn't exist: ${table}`);
        }
      } catch (error) {
        console.log(`❌ Error dropping ${table}:`, error.message);
      }
    }

    console.log('\n🎉 Cleanup completed!');
    
    // Show remaining tables
    const [remainingTables] = await pool.query('SHOW TABLES');
    console.log(`\n📊 Remaining tables: ${remainingTables.length}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  directCleanup();
}
