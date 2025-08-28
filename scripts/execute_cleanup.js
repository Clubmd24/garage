#!/usr/bin/env node
import pool from '../lib/db.js';

async function executeCleanup() {
  console.log('🚀 Executing Direct Database Cleanup');
  console.log('This will remove 10 tables that are safe to delete\n');

  const cleanupSQL = `
    DROP TABLE IF EXISTS \`customers\`;
    DROP TABLE IF EXISTS \`roles\`;
    DROP TABLE IF EXISTS \`documents\`;
    DROP TABLE IF EXISTS \`payroll_entries\`;
    DROP TABLE IF EXISTS \`payslips\`;
    DROP TABLE IF EXISTS \`pos_sale_items\`;
    DROP TABLE IF EXISTS \`pos_sales\`;
    DROP TABLE IF EXISTS \`holiday_requests\`;
    DROP TABLE IF EXISTS \`attendance_records\`;
    DROP TABLE IF EXISTS \`shifts\`;
  `;

  try {
    console.log('🗑️  Executing cleanup SQL...');
    
    // Split the SQL into individual statements and execute each one
    const statements = cleanupSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log(`✅ Executed: ${statement.trim()}`);
        } catch (error) {
          console.log(`⚠️  Warning for: ${statement.trim()} - ${error.message}`);
        }
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
  executeCleanup();
}
