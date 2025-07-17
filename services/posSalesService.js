import pool from '../lib/db.js';

export async function recordSale({ session_id, customer_id, vehicle_id, payment_type, total_amount }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO pos_sales (session_id, customer_id, vehicle_id, payment_type, total_amount)
     VALUES (?,?,?,?,?)`,
    [session_id, customer_id || null, vehicle_id || null, payment_type, total_amount]
  );
  const [[row]] = await pool.query('SELECT * FROM pos_sales WHERE id=?', [insertId]);
  return row;
}

export async function getSalesBySession(session_id) {
  const [rows] = await pool.query('SELECT * FROM pos_sales WHERE session_id=?', [session_id]);
  return rows;
}
