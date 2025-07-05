import pool from '../lib/db.js';

export async function getAllInvoices() {
  const [rows] = await pool.query(
    `SELECT id, job_id, customer_id, amount, due_date, status, terms, created_ts
       FROM invoices ORDER BY id`
  );
  return rows;
}

export async function getInvoicesByCustomer(customer_id, status) {
  const base = `SELECT id, job_id, customer_id, amount, due_date, status, terms, created_ts FROM invoices WHERE customer_id=?`;
  const [rows] = status
    ? await pool.query(`${base} AND status=? ORDER BY id`, [customer_id, status])
    : await pool.query(`${base} ORDER BY id`, [customer_id]);
  return rows;
}

export async function getInvoicesByFleet(fleet_id, status) {
  const base = `SELECT i.id, i.job_id, i.customer_id, i.amount, i.due_date, i.status, i.terms, i.created_ts
       FROM invoices i
       JOIN jobs j ON i.job_id=j.id
       JOIN vehicles v ON j.vehicle_id=v.id
      WHERE v.fleet_id=?`;
  const [rows] = status
    ? await pool.query(`${base} AND i.status=? ORDER BY i.id`, [fleet_id, status])
    : await pool.query(`${base} ORDER BY i.id`, [fleet_id]);
  return rows;
}

export async function getInvoiceById(id) {
  const [[row]] = await pool.query(
    `SELECT id, job_id, customer_id, amount, due_date, status, terms, created_ts
       FROM invoices WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function createInvoice({ job_id, customer_id, amount, due_date, status, terms }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO invoices
      (job_id, customer_id, amount, due_date, status, terms)
     VALUES (?,?,?,?,?,?)`,
    [job_id || null, customer_id || null, amount || null, due_date || null, status || null, terms || null]
  );
  return { id: insertId, job_id, customer_id, amount, due_date, status, terms };
}

export async function updateInvoice(
  id,
  { job_id, customer_id, amount, due_date, status, terms }
) {
  await pool.query(
    `UPDATE invoices SET
       job_id=?,
       customer_id=?,
       amount=?,
       due_date=?,
       status=?,
       terms=?
     WHERE id=?`,
    [job_id || null, customer_id || null, amount || null, due_date || null, status || null, terms || null, id]
  );
  return { ok: true };
}

export async function deleteInvoice(id) {
  await pool.query('DELETE FROM invoices WHERE id=?', [id]);
  return { ok: true };
}
