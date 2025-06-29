import pool from '../lib/db.js';

export async function getAllInvoices() {
  const [rows] = await pool.query(
    `SELECT id, job_id, customer_id, amount, due_date, status, created_ts
       FROM invoices ORDER BY id`
  );
  return rows;
}

export async function getInvoiceById(id) {
  const [[row]] = await pool.query(
    `SELECT id, job_id, customer_id, amount, due_date, status, created_ts
       FROM invoices WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function createInvoice({ job_id, customer_id, amount, due_date, status }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO invoices
      (job_id, customer_id, amount, due_date, status)
     VALUES (?,?,?,?,?)`,
    [job_id || null, customer_id || null, amount || null, due_date || null, status || null]
  );
  return { id: insertId, job_id, customer_id, amount, due_date, status };
}

export async function updateInvoice(
  id,
  { job_id, customer_id, amount, due_date, status }
) {
  await pool.query(
    `UPDATE invoices SET
       job_id=?,
       customer_id=?,
       amount=?,
       due_date=?,
       status=?
     WHERE id=?`,
    [job_id || null, customer_id || null, amount || null, due_date || null, status || null, id]
  );
  return { ok: true };
}

export async function deleteInvoice(id) {
  await pool.query('DELETE FROM invoices WHERE id=?', [id]);
  return { ok: true };
}
