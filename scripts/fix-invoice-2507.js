import pool from '../lib/db.js';
import { getQuoteItems } from '../services/quoteItemsService.js';

async function fixInvoice2507() {
  try {
    console.log('Starting to fix invoice #2507...');
    
    // First, let's check what quote items exist for quote #2507
    const quoteItems = await getQuoteItems(2507);
    console.log(`Found ${quoteItems.length} quote items:`, quoteItems);
    
    if (quoteItems.length === 0) {
      console.log('No quote items found for quote #2507');
      return;
    }
    
    // Check if invoice items already exist
    const [existingItems] = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [2507]
    );
    
    if (existingItems.length > 0) {
      console.log(`Invoice #2507 already has ${existingItems.length} items. Deleting existing items...`);
      await pool.query('DELETE FROM invoice_items WHERE invoice_id = ?', [2507]);
    }
    
    // Now copy quote items to invoice items
    for (const item of quoteItems) {
      const description = item.description || item.partNumber || 'Service Item';
      const qty = item.qty || 1;
      const unitPrice = item.unit_price || item.unit_cost || 0;
      
      console.log(`Adding item: "${description}" x${qty} @ €${unitPrice}`);
      
      await pool.query(
        `INSERT INTO invoice_items 
          (invoice_id, description, qty, unit_price)
         VALUES (?, ?, ?, ?)`,
        [2507, description, qty, unitPrice]
      );
    }
    
    console.log(`Successfully fixed invoice #2507 with ${quoteItems.length} items`);
    
    // Verify the fix
    const [newItems] = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [2507]
    );
    console.log('New invoice items:', newItems);
    
  } catch (error) {
    console.error('Error fixing invoice #2507:', error);
  } finally {
    await pool.end();
  }
}

fixInvoice2507();
