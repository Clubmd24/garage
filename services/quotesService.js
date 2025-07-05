import pool from '../lib/db.js';

export async function getAllQuotes() {
  const [rows] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, vehicle_id, total_amount, status, terms, created_ts
       FROM quotes ORDER BY id`
  );
  return rows;
}

export async function getQuotesByFleet(fleet_id) {
  const [rows] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, vehicle_id, total_amount, status, terms, created_ts
       FROM quotes WHERE fleet_id=? ORDER BY id`,
    [fleet_id]
  );
  return rows;
}

export async function getQuotesByCustomer(customer_id) {
  const [rows] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, vehicle_id, total_amount, status, terms, created_ts
       FROM quotes WHERE customer_id=? ORDER BY id`,
    [customer_id]
  );
  return rows;
}

export async function getQuoteById(id) {
  const [[row]] = await pool.query(
    `SELECT id, customer_id, fleet_id, job_id, vehicle_id, total_amount, status, terms, created_ts
       FROM quotes WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function createQuote({ customer_id, fleet_id, job_id, vehicle_id, total_amount, status, terms }) {
  const [{ insertId }] = await pool.query(
    `INSERT INTO quotes
      (customer_id, fleet_id, job_id, vehicle_id, total_amount, status, terms)
     VALUES (?,?,?,?,?,?,?)`,
    [
      customer_id || null,
      fleet_id || null,
      job_id || null,
      vehicle_id || null,
      total_amount || null,
      status || null,
      terms || null,
    ]
  );
  return { id: insertId, customer_id, fleet_id, job_id, vehicle_id, total_amount, status, terms };
}

export async function updateQuote(
  id,
  { customer_id, fleet_id, job_id, vehicle_id, total_amount, status, terms }
) {
  await pool.query(
    `UPDATE quotes SET
       customer_id=?,
       fleet_id=?,
       job_id=?,
       vehicle_id=?,
       total_amount=?,
       status=?,
       terms=?
     WHERE id=?`,
    [
      customer_id || null,
      fleet_id || null,
      job_id || null,
      vehicle_id || null,
      total_amount || null,
      status || null,
      terms || null,
      id,
    ]
  );
  return { ok: true };
}

export async function deleteQuote(id) {
  await pool.query('DELETE FROM quotes WHERE id=?', [id]);
  return { ok: true };
}
