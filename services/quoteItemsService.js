import pool from '../lib/db.js';

export async function getQuoteItems(quote_id) {
  const [rows] = await pool.query(
    `SELECT qi.id, qi.quote_id, qi.part_id, qi.description, qi.qty, qi.unit_price,
            p.supplier_id
       FROM quote_items qi
  LEFT JOIN parts p ON qi.part_id=p.id
      WHERE qi.quote_id=?
   ORDER BY qi.id`,
    [quote_id]
  );
  return rows;
}

export async function createQuoteItem({ quote_id, part_id, description, qty, unit_price }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO quote_items (quote_id, part_id, description, qty, unit_price)
     VALUES (?,?,?,?,?)`,
    [quote_id, part_id || null, description || null, qty || null, unit_price || null]
  );
  return { id: insertId, quote_id, part_id, description, qty, unit_price };
}

export async function getQuoteItemById(id) {
  const [[row]] = await pool.query(
    `SELECT id, quote_id, part_id, description, qty, unit_price FROM quote_items WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function updateQuoteItem(id, { description, qty, unit_price }) {
  await pool.query(
    `UPDATE quote_items SET description=?, qty=?, unit_price=? WHERE id=?`,
    [description || null, qty || null, unit_price || null, id]
  );
  return { ok: true };
}
