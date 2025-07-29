import pool from '../lib/db.js';

async function checkInvoiceStatuses() {
  try {
    console.log('🔍 Checking invoice statuses...\n');
    
    // Check what invoice statuses exist
    const [statuses] = await pool.query('SELECT * FROM invoice_statuses ORDER BY id');
    console.log('📋 Available invoice statuses:');
    statuses.forEach(s => console.log(`  - ${s.id}: ${s.name}`));
    
    // Check if 'awaiting collection' exists
    const [[awaitingCollection]] = await pool.query(
      'SELECT id FROM invoice_statuses WHERE name = ?',
      ['awaiting collection']
    );
    
    if (awaitingCollection) {
      console.log('\n✅ "awaiting collection" status exists');
    } else {
      console.log('\n❌ "awaiting collection" status does NOT exist');
      console.log('This is causing the "Invalid invoice status" error');
    }
    
    // Check if 'issued' exists (fallback)
    const [[issued]] = await pool.query(
      'SELECT id FROM invoice_statuses WHERE name = ?',
      ['issued']
    );
    
    if (issued) {
      console.log('✅ "issued" status exists (can be used as fallback)');
    } else {
      console.log('❌ "issued" status does NOT exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking invoice statuses:', error);
  } finally {
    await pool.end();
  }
}

checkInvoiceStatuses(); 