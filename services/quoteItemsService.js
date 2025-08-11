import pool from '../lib/db.js';

export async function getQuoteItems(quote_id) {
  const [rows] = await pool.query(
    `SELECT
       qi.id,
       qi.quote_id,
       qi.part_id,
       qi.part_number,
       qi.description,
       qi.qty,
       -- ensure unit_cost is never NULL, default to 0 if missing
       COALESCE(qi.unit_cost, 0) AS unit_cost,
       qi.markup_percent,
       qi.unit_price,
       p.supplier_id,
       -- Use stored part_number if available, otherwise fall back to parts table
       COALESCE(qi.part_number, p.part_number) AS partNumber
     FROM quote_items qi
     LEFT JOIN parts p ON qi.part_id = p.id
     WHERE qi.quote_id = ?
     ORDER BY qi.id`,
    [quote_id]
  );

  return rows.map(row => ({
    ...row,
    // unit_cost is always present now, so convert to Number
    unit_cost: Number(row.unit_cost),
    markup_percent: row.markup_percent == null ? null : Number(row.markup_percent),
    unit_price: row.unit_price == null ? null : Number(row.unit_price),
  }));
}

export async function createQuoteItem({
  quote_id,
  part_id,
  part_number,
  description,
  qty,
  unit_cost,
  markup_percent,
  unit_price,
}) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO quote_items (quote_id, part_id, part_number, description, qty, unit_cost, markup_percent, unit_price)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      quote_id,
      part_id || null,
      part_number || null,
      description || null,
      qty || null,
      unit_cost || null,
      markup_percent || null,
      unit_price || null,
    ]
  );
  return {
    id: insertId,
    quote_id,
    part_id,
    description,
    qty,
    unit_cost,
    markup_percent,
    unit_price,
  };
}

export async function getQuoteItemById(id) {
  const [[row]] = await pool.query(
    `SELECT id, quote_id, part_id, description, qty, unit_cost, markup_percent, unit_price
       FROM quote_items WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function updateQuoteItem(id, { part_number, description, qty, unit_cost, markup_percent, unit_price }) {
  await pool.query(
    `UPDATE quote_items SET part_number=?, description=?, qty=?, unit_cost=?, markup_percent=?, unit_price=? WHERE id=?`,
    [part_number || null, description || null, qty || null, unit_cost || null, markup_percent || null, unit_price || null, id]
  );
  return { ok: true };
}
