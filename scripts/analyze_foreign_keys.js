#!/usr/bin/env node

/**
 * Foreign Key Analysis Script
 * This script analyzes foreign key relationships to determine which tables
 * can be safely removed without breaking referential integrity.
 */

import pool from '../lib/db.js';

async function analyzeForeignKeys() {
  try {
    console.log('🔍 Analyzing foreign key relationships...\n');

    // Get all foreign key constraints
    const [foreignKeys] = await pool.query(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME IS NOT NULL 
        AND TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    console.log(`📊 Found ${foreignKeys.length} foreign key relationships\n`);

    // Group by referenced table
    const referencedBy = {};
    foreignKeys.forEach(fk => {
      const referencedTable = fk.REFERENCED_TABLE_NAME;
      if (!referencedBy[referencedTable]) {
        referencedBy[referencedTable] = [];
      }
      referencedBy[referencedTable].push({
        table: fk.TABLE_NAME,
        column: fk.COLUMN_NAME,
        constraint: fk.CONSTRAINT_NAME
      });
    });

    // Tables we want to potentially remove
    const targetTables = [
      'customers', 'roles', 'documents', 'payroll_entries', 'payslips',
      'pos_sale_items', 'pos_sales', 'pos_sessions',
      'holiday_requests', 'attendance_records', 'shifts'
    ];

    console.log('🔗 Foreign Key Analysis Results:\n');

    // Check each target table
    for (const targetTable of targetTables) {
      if (referencedBy[targetTable]) {
        console.log(`❌ ${targetTable} CANNOT be removed - referenced by:`);
        referencedBy[targetTable].forEach(ref => {
          console.log(`   - ${ref.table}.${ref.column} (constraint: ${ref.constraint})`);
        });
        console.log('');
      } else {
        console.log(`✅ ${targetTable} can be safely removed (no foreign key references)`);
      }
    }

    // Show all foreign key relationships for reference
    console.log('\n📋 Complete Foreign Key Reference Map:\n');
    
    const sortedTables = Object.keys(referencedBy).sort();
    for (const table of sortedTables) {
      console.log(`${table} is referenced by:`);
      referencedBy[table].forEach(ref => {
        console.log(`  - ${ref.table}.${ref.column}`);
      });
      console.log('');
    }

    // Generate safe cleanup recommendations
    console.log('🚀 Safe Cleanup Recommendations:\n');
    
    const safeToRemove = targetTables.filter(table => !referencedBy[table]);
    const cannotRemove = targetTables.filter(table => referencedBy[table]);
    
    if (safeToRemove.length > 0) {
      console.log('✅ Tables safe to remove:');
      safeToRemove.forEach(table => console.log(`   - ${table}`));
      console.log('');
    }
    
    if (cannotRemove.length > 0) {
      console.log('❌ Tables that need foreign key cleanup first:');
      cannotRemove.forEach(table => {
        console.log(`   - ${table}:`);
        referencedBy[table].forEach(ref => {
          console.log(`     * Remove reference from ${ref.table}.${ref.column}`);
        });
      });
      console.log('');
    }

    return {
      totalForeignKeys: foreignKeys.length,
      safeToRemove,
      cannotRemove,
      referencedBy
    };

  } catch (error) {
    console.error('❌ Error analyzing foreign keys:', error);
    throw error;
  }
}

async function generateCleanupPlan(analysis) {
  try {
    console.log('📝 Generating targeted cleanup plan...\n');

    let sql = '-- Targeted Database Cleanup Plan\n';
    sql += '-- Generated based on foreign key analysis\n';
    sql += '-- Date: ' + new Date().toISOString() + '\n\n';

    if (analysis.safeToRemove.length > 0) {
      sql += '-- Phase 1: Remove tables with no foreign key references\n';
      analysis.safeToRemove.forEach(table => {
        sql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      });
      sql += '\n';
    }

    if (analysis.cannotRemove.length > 0) {
      sql += '-- Phase 2: Tables that need foreign key cleanup first\n';
      sql += '-- These tables cannot be removed until their references are cleaned up:\n';
      analysis.cannotRemove.forEach(table => {
        sql += `-- ${table}\n`;
        if (analysis.referencedBy[table]) {
          analysis.referencedBy[table].forEach(ref => {
            sql += `--   Referenced by: ${ref.table}.${ref.column}\n`;
          });
        }
        sql += '\n';
      });
    }

    sql += '-- Phase 3: Add performance indexes\n';
    sql += 'CREATE INDEX IF NOT EXISTS `idx_jobs_status_date` ON `jobs`(`status`, `created_at`);\n';
    sql += 'CREATE INDEX IF NOT EXISTS `idx_quotes_status_date` ON `quotes`(`status`, `created_at`);\n';
    sql += 'CREATE INDEX IF NOT EXISTS `idx_invoices_status_date` ON `invoices`(`status`, `created_at`);\n';
    sql += 'CREATE INDEX IF NOT EXISTS `idx_parts_supplier_category` ON `parts`(`supplier_id`, `category_id`);\n';
    sql += 'CREATE INDEX IF NOT EXISTS `idx_vehicles_customer_fleet` ON `vehicles`(`customer_id`, `fleet_id`);\n';

    // Write to file
    const fs = await import('fs');
    fs.writeFileSync('targeted_cleanup_plan.sql', sql);
    
    console.log('✅ Targeted cleanup plan written to: targeted_cleanup_plan.sql');
    console.log('   Review this file before running any cleanup operations!');

  } catch (error) {
    console.error('❌ Error generating cleanup plan:', error);
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Foreign Key Analysis Tool\n');
    console.log('This tool will analyze foreign key relationships to determine\n');
    console.log('which tables can be safely removed.\n');
    
    const analysis = await analyzeForeignKeys();
    
    console.log('='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   Total foreign keys: ${analysis.totalForeignKeys}`);
    console.log(`   Tables safe to remove: ${analysis.safeToRemove.length}`);
    console.log(`   Tables needing cleanup: ${analysis.cannotRemove.length}`);
    console.log('='.repeat(60));

    // Ask if user wants to generate cleanup plan
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n❓ Would you like to generate a targeted cleanup plan? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        await generateCleanupPlan(analysis);
      } else {
        console.log('\n✅ Analysis complete. Review the foreign key relationships above.');
      }
      rl.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
