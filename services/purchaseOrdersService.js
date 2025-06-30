import pool from '../lib/db.js';

export async function createPurchaseOrder({ job_id, supplier_id, status }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO purchase_orders (job_id, supplier_id, status)
     VALUES (?,?,?)`,
    [job_id || null, supplier_id, status || null]
  );
  return { id: insertId, job_id, supplier_id, status };
}

export async function addPurchaseOrderItem({ purchase_order_id, part_id, qty, unit_price }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO purchase_order_items (purchase_order_id, part_id, qty, unit_price)
     VALUES (?,?,?,?)`,
    [purchase_order_id, part_id, qty || null, unit_price || null]
  );
  return { id: insertId, purchase_order_id, part_id, qty, unit_price };
}
