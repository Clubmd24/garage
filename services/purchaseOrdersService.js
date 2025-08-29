import pool from '../lib/db-local.js';

export async function createPurchaseOrder({ job_id, supplier_id, status, items }) {
  if (Array.isArray(items) && items.length > 0) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [{ insertId }] = await conn.query(
        `INSERT INTO purchase_orders (job_id, supplier_id, status)
         VALUES (?,?,?)`,
        [job_id || null, supplier_id, status || null]
      );
      for (const it of items) {
        const { part_id, qty, unit_price } = it;
        await conn.query(
          `INSERT INTO purchase_order_items (purchase_order_id, part_id, qty, unit_price)
           VALUES (?,?,?,?)`,
          [insertId, part_id, qty || null, unit_price || null]
        );
      }
      await conn.commit();
      return { id: insertId, job_id, supplier_id, status };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
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

export async function getPurchaseOrderById(id) {
  const [[row]] = await pool.query(
    `SELECT id, job_id, supplier_id, status, created_at FROM purchase_orders WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function updatePurchaseOrder(id, { job_id, supplier_id, status }) {
  await pool.query(
    `UPDATE purchase_orders SET job_id=?, supplier_id=?, status=? WHERE id=?`,
    [job_id || null, supplier_id || null, status || null, id]
  );
  return { ok: true };
}
