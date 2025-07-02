import pool from '../lib/db.js';

export async function getInvoiceItems(invoice_id) {
  const [rows] = await pool.query(
    'SELECT id, invoice_id, description, qty, unit_price FROM invoice_items WHERE invoice_id=?',
    [invoice_id]
  );
  return rows;
}
