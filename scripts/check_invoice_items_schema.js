import pool from '../lib/db.js';

async function checkInvoiceItemsSchema() {
  try {
    console.log('🔍 Checking invoice_items table schema...\n');
    
    // Check the table structure
    const [columns] = await pool.query('DESCRIBE invoice_items');
    console.log('📋 invoice_items table columns:');
    columns.forEach(col => console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`));
    
    // Check if part_id column exists
    const hasPartId = columns.some(col => col.Field === 'part_id');
    console.log(`\n${hasPartId ? '✅' : '❌'} part_id column ${hasPartId ? 'exists' : 'does NOT exist'}`);
    
    // Check sample data
    const [sampleData] = await pool.query('SELECT * FROM invoice_items LIMIT 3');
    console.log('\n📊 Sample invoice_items data:');
    sampleData.forEach(row => console.log(`  - ${JSON.stringify(row)}`));
    
  } catch (error) {
    console.error('❌ Error checking invoice_items schema:', error);
  } finally {
    await pool.end();
  }
}

checkInvoiceItemsSchema(); 