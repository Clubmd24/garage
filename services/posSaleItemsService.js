import pool from '../lib/db-local.js';

export async function addSaleItem({ sale_id, part_id, qty, unit_price }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO pos_sale_items (sale_id, part_id, qty, unit_price)
     VALUES (?,?,?,?)`,
    [sale_id, part_id, qty, unit_price]
  );
  const [[row]] = await pool.query('SELECT * FROM pos_sale_items WHERE id=?', [insertId]);
  return row;
}

export async function getItemsBySale(sale_id) {
  const [rows] = await pool.query('SELECT * FROM pos_sale_items WHERE sale_id=?', [sale_id]);
  return rows;
}
