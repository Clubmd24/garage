import pool from '../lib/db-local.js';

export async function getInvoiceItems(invoice_id) {
  const [rows] = await pool.query(
    `SELECT 
       ii.id, 
       ii.invoice_id, 
       ii.description, 
       ii.qty, 
       ii.unit_price,
       qi.part_number AS partNumber
     FROM invoice_items ii
     LEFT JOIN quote_items qi ON ii.description = qi.description AND ii.qty = qi.qty AND ii.unit_price = qi.unit_price
     WHERE ii.invoice_id=?`,
    [invoice_id]
  );
  return rows.map(row => ({
    ...row,
    qty: row.qty == null ? null : Number(row.qty),
    unit_price: row.unit_price == null ? null : Number(row.unit_price),
    partNumber: row.partNumber || '',
  }));
}
