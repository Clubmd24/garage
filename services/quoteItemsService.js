import pool from '../lib/db-local.js';
import { recordCreditUsage } from './supplierCreditService.js';

export async function getQuoteItems(quoteId) {
  try {
    const [rows] = await pool.query(
      `SELECT qi.*, p.part_number, p.description as part_description, p.unit_cost, p.supplier_id,
              s.name as supplier_name
       FROM quote_items qi
       JOIN parts p ON qi.part_id = p.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE qi.quote_id = ?
       ORDER BY qi.id`,
      [quoteId]
    );
    return rows;
  } catch (error) {
    console.error('Error in getQuoteItems:', error);
    throw error;
  }
}

export async function createQuoteItem(quoteItemData) {
  try {
    const { quote_id, part_id, description, qty, unit_price, unit_cost, markup_percent } = quoteItemData;
    
    // Insert quote item
    const [result] = await pool.query(
      `INSERT INTO quote_items (quote_id, part_id, description, qty, unit_price, unit_cost, markup_percent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [quote_id, part_id, description, qty, unit_price, unit_cost, markup_percent]
    );
    
    // Get part info to track credit usage
    const [partRows] = await pool.query(
      'SELECT supplier_id, unit_cost FROM parts WHERE id = ?',
      [part_id]
    );
    
    if (partRows.length > 0 && partRows[0].supplier_id) {
      const part = partRows[0];
      const totalCost = part.unit_cost * qty;
      
      // Automatically record credit usage for the supplier
      try {
        await recordCreditUsage(
          part.supplier_id,
          totalCost,
          'quote',
          result.insertId,
          `Part sold: ${description} (Qty: ${qty})`,
          1 // TODO: Get from auth context
        );
      } catch (creditError) {
        console.error('Failed to record credit usage:', creditError);
        // Don't fail the quote item creation if credit tracking fails
      }
    }
    
    return { id: result.insertId, ...quoteItemData };
  } catch (error) {
    console.error('Error in createQuoteItem:', error);
    throw error;
  }
}

export async function getQuoteItemById(id) {
  const [[row]] = await pool.query(
    `SELECT id, quote_id, part_id, description, qty, unit_cost, markup_percent, unit_price
       FROM quote_items WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function updateQuoteItem(id, quoteItemData) {
  try {
    const { description, qty, unit_price, unit_cost, markup_percent } = quoteItemData;
    
    await pool.query(
      `UPDATE quote_items 
       SET description = ?, qty = ?, unit_price = ?, unit_cost = ?, markup_percent = ?
       WHERE id = ?`,
      [description, qty, unit_price, unit_cost, markup_percent, id]
    );
    
    return { id, ...quoteItemData };
  } catch (error) {
    console.error('Error in updateQuoteItem:', error);
    throw error;
  }
}

export async function deleteQuoteItem(id) {
  try {
    await pool.query('DELETE FROM quote_items WHERE id = ?', [id]);
    return { id };
  } catch (error) {
    console.error('Error in deleteQuoteItem:', error);
    throw error;
  }
}
