#!/usr/bin/env node
import pool from '../lib/db.js';

async function cleanupNow() {
  console.log('🚀 Executing Database Cleanup Now');
  console.log('This will remove 39 unused and duplicate tables\n');

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

  try {
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
    console.error('❌ Cleanup failed:', error);
  } finally {
    await pool.end();
  }
}

cleanupNow();
