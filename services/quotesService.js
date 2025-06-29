import pool from '../lib/db.js';

export async function getAllQuotes() {
  const [rows] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, total_amount, status, created_ts
       FROM quotes ORDER BY id`
  );
  return rows;
}

export async function getQuoteById(id) {
  const [[row]] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, total_amount, status, created_ts
       FROM quotes WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function createQuote({ customer_id, fleet_id, job_id, total_amount, status }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO quotes
      (customer_id, fleet_id, job_id, total_amount, status)
     VALUES (?,?,?,?,?)`,
    [
      customer_id || null,
      fleet_id || null,
      job_id || null,
      total_amount || null,
      status || null,
    ]
  );
  return { id: insertId, customer_id, fleet_id, job_id, total_amount, status };
}

export async function updateQuote(
  id,
  { customer_id, fleet_id, job_id, total_amount, status }
) {
  await pool.query(
    `UPDATE quotes SET
       customer_id=?,
       fleet_id=?,
       job_id=?,
       total_amount=?,
       status=?
     WHERE id=?`,
    [
      customer_id || null,
      fleet_id || null,
      job_id || null,
      total_amount || null,
      status || null,
      id,
    ]
  );
  return { ok: true };
}

export async function deleteQuote(id) {
  await pool.query('DELETE FROM quotes WHERE id=?', [id]);
  return { ok: true };
}
