import pool from '../lib/db.js';

export async function getQuoteItems(quote_id) {
  const [rows] = await pool.query(
    `SELECT id, quote_id, description, qty, unit_price
       FROM quote_items WHERE quote_id=? ORDER BY id`,
    [quote_id]
  );
  return rows;
}
